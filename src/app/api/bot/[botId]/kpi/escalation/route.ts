import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET: Get escalation rate metrics for a specific bot
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

    // Check if user is an admin
    const isAdmin = user.role === 'ADMIN';
    console.log(`User ${user.email} has admin status: ${isAdmin}`);
    
    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const rawStartDate = searchParams.get('startDate');
    const rawEndDate = searchParams.get('endDate');
    
    // Parse dates with fallbacks
    let startDateTime, endDateTime;
    
    try {
      startDateTime = rawStartDate ? new Date(rawStartDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      // Check if valid date
      if (isNaN(startDateTime.getTime())) {
        startDateTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      }
    } catch (e) {
      startDateTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }
    
    try {
      endDateTime = rawEndDate ? new Date(rawEndDate) : new Date();
      // Check if valid date
      if (isNaN(endDateTime.getTime())) {
        endDateTime = new Date();
      }
    } catch (e) {
      endDateTime = new Date();
    }

    // If admin, skip bot ownership check
    let bot;
    
    if (isAdmin) {
      console.log('Admin access - skipping ownership check');
      // Admin can access any bot
      bot = await db.bot.findFirst({
        where: { id: botId }
      });
      
      // Get creator information if needed
      if (bot) {
        const creator = await db.user.findUnique({
          where: { userId: bot.creator_id },
          select: {
            userId: true,
            email: true,
            first_name: true,
            last_name: true,
            role: true
          }
        });
        
        if (creator) {
          // Add creator info to bot
          (bot as any).creator = creator;
        }
      }
    } else {
      console.log('Regular user access - checking ownership');
      // Regular users can only access their own bots
      bot = await db.bot.findFirst({
        where: { 
          id: botId,
          creator_id: user.userId 
        }
      });
    }

    if (!bot) {
      return NextResponse.json(
        { error: "Bot not found or unauthorized" },
        { status: 404 }
      );
    }

    // Get all conversations for this bot in the date range
    const conversations = await db.conversation.findMany({
      where: {
        bot_id: botId,
        start_time: {
          gte: startDateTime,
          lte: endDateTime
        }
      }
    });

    const totalConversations = conversations.length;
    const escalatedConversations = conversations.filter(conv => conv.escalated).length;
    
    // Calculate escalation rate as a percentage
    const escalationRate = totalConversations > 0 
      ? (escalatedConversations / totalConversations) * 100 
      : 0;

    // Get escalation reasons if available (this depends on your schema)
    // This is a placeholder - adjust based on your actual schema
    const escalationReasons: Record<string, number> = {};
    
    // Get escalation trend data over time
    const timeData: { date: string; escalationRate: number; count: number }[] = [];
    
    // Determine the time interval based on the date range
    const daysDiff = Math.floor((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24));
    
    // For short ranges (<=7 days), show daily data
    // For medium ranges (<=30 days), show weekly data
    // For long ranges, show monthly data
    const interval = daysDiff <= 7 ? 'daily' : daysDiff <= 30 ? 'weekly' : 'monthly';
    
    if (interval === 'daily') {
      // Group by day
      const dailyData: Record<string, { total: number; escalated: number }> = {};
      
      // Initialize all days in the range
      const currentDate = new Date(startDateTime);
      while (currentDate <= endDateTime) {
        const dateKey = currentDate.toISOString().split('T')[0];
        dailyData[dateKey] = { total: 0, escalated: 0 };
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Count conversations by day
      conversations.forEach(conv => {
        const date = new Date(conv.start_time);
        const dateKey = date.toISOString().split('T')[0];
        
        if (dailyData[dateKey]) {
          dailyData[dateKey].total++;
          if (conv.escalated) {
            dailyData[dateKey].escalated++;
          }
        }
      });
      
      // Calculate rates and format for the response
      Object.entries(dailyData).forEach(([date, data]) => {
        const rate = data.total > 0 ? (data.escalated / data.total) * 100 : 0;
        timeData.push({
          date: date, // YYYY-MM-DD
          escalationRate: parseFloat(rate.toFixed(1)),
          count: data.escalated
        });
      });
    } else if (interval === 'weekly') {
      // Group by week
      const weeklyData: Record<string, { total: number; escalated: number }> = {};
      
      // Group conversations by week
      conversations.forEach(conv => {
        const date = new Date(conv.start_time);
        const year = date.getFullYear();
        const weekNum = Math.ceil((date.getDate() + new Date(year, date.getMonth(), 1).getDay()) / 7);
        const weekKey = `${year}-W${weekNum}`;
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { total: 0, escalated: 0 };
        }
        
        weeklyData[weekKey].total++;
        if (conv.escalated) {
          weeklyData[weekKey].escalated++;
        }
      });
      
      // Calculate rates and format for the response
      Object.entries(weeklyData).forEach(([weekKey, data]) => {
        const rate = data.total > 0 ? (data.escalated / data.total) * 100 : 0;
        timeData.push({
          date: weekKey,
          escalationRate: parseFloat(rate.toFixed(1)),
          count: data.escalated
        });
      });
    } else {
      // Group by month
      const monthlyData: Record<string, { total: number; escalated: number }> = {};
      
      // Group conversations by month
      conversations.forEach(conv => {
        const date = new Date(conv.start_time);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { total: 0, escalated: 0 };
        }
        
        monthlyData[monthKey].total++;
        if (conv.escalated) {
          monthlyData[monthKey].escalated++;
        }
      });
      
      // Calculate rates and format for the response
      Object.entries(monthlyData).forEach(([monthKey, data]) => {
        const rate = data.total > 0 ? (data.escalated / data.total) * 100 : 0;
        timeData.push({
          date: monthKey,
          escalationRate: parseFloat(rate.toFixed(1)),
          count: data.escalated
        });
      });
    }
    
    // Sort time data chronologically
    timeData.sort((a, b) => a.date.localeCompare(b.date));
    
    // Calculate trend (increasing, decreasing, or stable)
    let trend = "stable";
    
    if (timeData.length >= 2) {
      const firstHalf = timeData.slice(0, Math.floor(timeData.length / 2));
      const secondHalf = timeData.slice(Math.floor(timeData.length / 2));
      
      const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.escalationRate, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.escalationRate, 0) / secondHalf.length;
      
      const difference = secondHalfAvg - firstHalfAvg;
      
      if (difference > 2) {
        trend = "increasing";
      } else if (difference < -2) {
        trend = "decreasing";
      }
    }
    
    // Generate top escalation triggers (placeholder - replace with real data if available)
    // This section depends on your schema and data model
    const topEscalationTriggers = [
      {
        category: "Technical Issue",
        count: Math.floor(escalatedConversations * 0.35),
        percentage: 35
      },
      {
        category: "Complex Query",
        count: Math.floor(escalatedConversations * 0.25),
        percentage: 25
      },
      {
        category: "User Requested",
        count: Math.floor(escalatedConversations * 0.2),
        percentage: 20
      },
      {
        category: "Other",
        count: escalatedConversations - Math.floor(escalatedConversations * 0.35) - 
                Math.floor(escalatedConversations * 0.25) - Math.floor(escalatedConversations * 0.2),
        percentage: 20
      }
    ];

    // Create bot info object with creator details for admin
    const botInfo = {
      id: bot.id,
      name: bot.bot_name
    };
    
    // For admin view, add owner information if available
    if (isAdmin && (bot as any).creator) {
      const creator = (bot as any).creator;
      (botInfo as any).owner = {
        id: creator.userId,
        email: creator.email,
        name: creator.first_name && creator.last_name 
          ? `${creator.first_name} ${creator.last_name}`
          : undefined
      };
    }

    return NextResponse.json({
      timeframe: {
        start: startDateTime,
        end: endDateTime,
        interval
      },
      summary: {
        totalConversations,
        escalatedConversations,
        escalationRate: parseFloat(escalationRate.toFixed(1)),
        trend
      },
      chartData: [
        { name: 'Escalated', value: parseFloat(escalationRate.toFixed(1)) },
        { name: 'Resolved by Bot', value: parseFloat((100 - escalationRate).toFixed(1)) }
      ],
      timeSeries: timeData,
      topTriggers: topEscalationTriggers,
      bot: botInfo
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching escalation metrics:", error);
    return NextResponse.json(
      { error: "Error fetching escalation metrics" },
      { status: 500 }
    );
  }
}