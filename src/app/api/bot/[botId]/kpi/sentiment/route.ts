import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET: Get sentiment trends for a specific bot
export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    const params = await context.params;
    const botId = params.botId
    
    if (!botId) {
      return NextResponse.json(
        { error: "Bot ID is required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const rawStartDate = searchParams.get('startDate');
    const rawEndDate = searchParams.get('endDate');
    
    // Parse dates with fallbacks
    let startDateTime, endDateTime;
    
    try {
      startDateTime = rawStartDate ? new Date(rawStartDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (isNaN(startDateTime.getTime())) {
        startDateTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      }
    } catch (e) {
      startDateTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }
    
    try {
      endDateTime = rawEndDate ? new Date(rawEndDate) : new Date();
      if (isNaN(endDateTime.getTime())) {
        endDateTime = new Date();
      }
    } catch (e) {
      endDateTime = new Date();
    }

    // Verify bot belongs to user
    const bot = await db.bot.findFirst({
      where: { 
        id: botId,
        creator_id: user.userId 
      }
    });

    if (!bot) {
      return NextResponse.json(
        { error: "Bot not found or unauthorized" },
        { status: 404 }
      );
    }

    // Get all conversations for this bot in the date range with sentiment scores
    const conversations = await db.conversation.findMany({
      where: {
        bot_id: botId,
        start_time: {
          gte: startDateTime,
          lte: endDateTime
        }
      },
      select: {
        id: true,
        start_time: true,
        sentiment_score: true
      }
    });

    // Calculate date range in days
    const daysDiff = Math.ceil((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24));
    
    // Determine appropriate time interval based on date range
    let interval = 'daily';
    if (daysDiff > 60) {
      interval = 'monthly';
    } else if (daysDiff > 14) {
      interval = 'weekly';
    }

    // Group conversations by time period
    const timeGroups: Record<string, { 
      positive: number, 
      neutral: number, 
      negative: number,
      total: number
    }> = {};
    
    // Initialize time periods
    if (interval === 'daily') {
      // Create entries for each day
      const current = new Date(startDateTime);
      while (current <= endDateTime) {
        const dateKey = current.toISOString().split('T')[0];
        timeGroups[dateKey] = { positive: 0, neutral: 0, negative: 0, total: 0 };
        current.setDate(current.getDate() + 1);
      }
    } else if (interval === 'weekly') {
      // Group by week
      const weekCount = Math.ceil(daysDiff / 7);
      for (let i = 0; i < weekCount; i++) {
        timeGroups[`Week ${i + 1}`] = { positive: 0, neutral: 0, negative: 0, total: 0 };
      }
    } else {
      // Group by month
      const startMonth = new Date(startDateTime);
      const endMonth = new Date(endDateTime);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      let current = new Date(startMonth);
      current.setDate(1); // First day of month
      
      while (current <= endMonth) {
        const monthKey = months[current.getMonth()];
        timeGroups[monthKey] = { positive: 0, neutral: 0, negative: 0, total: 0 };
        current.setMonth(current.getMonth() + 1);
      }
    }

    // Process each conversation
    conversations.forEach(conv => {
      let group;
      const date = new Date(conv.start_time);
      
      if (interval === 'daily') {
        const dateKey = date.toISOString().split('T')[0];
        group = timeGroups[dateKey];
      } else if (interval === 'weekly') {
        // Calculate which week this falls into
        const dayIndex = Math.floor((date.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24));
        const weekIndex = Math.floor(dayIndex / 7);
        group = timeGroups[`Week ${weekIndex + 1}`];
      } else {
        // Monthly
        const monthKey = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
        group = timeGroups[monthKey];
      }
      
      if (group) {
        group.total++;
        
        // Classify sentiment based on score
        // Scores typically range from -1 (negative) to 1 (positive)
        const score = conv.sentiment_score || 0;
        
        if (score > 0.2) {
          group.positive++;
        } else if (score < -0.2) {
          group.negative++;
        } else {
          group.neutral++;
        }
      }
    });

    // Format data for the chart
    const chartData = Object.entries(timeGroups).map(([name, data]) => {
      // Convert counts to percentages
      let positive = 0;
      let neutral = 0;
      let negative = 0;
      
      if (data.total > 0) {
        positive = Math.round((data.positive / data.total) * 100);
        neutral = Math.round((data.neutral / data.total) * 100);
        negative = Math.round((data.negative / data.total) * 100);
        
        // Handle rounding errors to ensure total is 100%
        const total = positive + neutral + negative;
        if (total !== 100) {
          const diff = 100 - total;
          // Add the difference to the largest category
          if (positive >= neutral && positive >= negative) {
            positive += diff;
          } else if (neutral >= positive && neutral >= negative) {
            neutral += diff;
          } else {
            negative += diff;
          }
        }
      }
      
      return {
        name,
        positive,
        neutral,
        negative
      };
    });
    
    // Sort by time period
    if (interval === 'daily') {
      // Sort by date
      chartData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (interval === 'weekly') {
      // Sort by week number
      chartData.sort((a, b) => {
        const weekA = parseInt(a.name.split(' ')[1]);
        const weekB = parseInt(b.name.split(' ')[1]);
        return weekA - weekB;
      });
    } 
    // For monthly, we'll rely on the natural order from Object.entries

    // Calculate overall sentiment averages
    let totalPositive = 0;
    let totalNeutral = 0;
    let totalNegative = 0;
    let totalCount = 0;
    
    Object.values(timeGroups).forEach(group => {
      totalPositive += group.positive;
      totalNeutral += group.neutral;
      totalNegative += group.negative;
      totalCount += group.total;
    });
    
    const averageSentiment = {
      positive: totalCount > 0 ? Math.round((totalPositive / totalCount) * 100) : 0,
      neutral: totalCount > 0 ? Math.round((totalNeutral / totalCount) * 100) : 0,
      negative: totalCount > 0 ? Math.round((totalNegative / totalCount) * 100) : 0,
    };
    
    // Handle rounding errors for average
    const totalAverage = averageSentiment.positive + averageSentiment.neutral + averageSentiment.negative;
    if (totalAverage !== 100 && totalCount > 0) {
      const diff = 100 - totalAverage;
      if (averageSentiment.positive >= averageSentiment.neutral && averageSentiment.positive >= averageSentiment.negative) {
        averageSentiment.positive += diff;
      } else if (averageSentiment.neutral >= averageSentiment.positive && averageSentiment.neutral >= averageSentiment.negative) {
        averageSentiment.neutral += diff;
      } else {
        averageSentiment.negative += diff;
      }
    }

    return NextResponse.json({
      timeframe: {
        start: startDateTime,
        end: endDateTime,
        interval
      },
      summary: {
        totalConversations: totalCount,
        averageSentiment
      },
      chartData,
      bot: {
        id: bot.id,
        name: bot.bot_name
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching sentiment trends:", error);
    return NextResponse.json(
      { error: "Error fetching sentiment trends" },
      { status: 500 }
    );
  }
}