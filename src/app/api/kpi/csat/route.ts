import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const csatFilterSchema = z.object({
  botId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timeFrame: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  minRating: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  maxRating: z.string().optional().transform(val => val ? parseInt(val) : undefined)
});

// Define types for CSAT distribution
type CsatScore = 1 | 2 | 3 | 4 | 5;
type CsatDistribution = {
  [K in CsatScore]: number;
};
type EscalationByScore = {
  [K in CsatScore]: { count: number; total: number; rate: number };
};

// GET: Get CSAT analysis for user's bots
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.email) {
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

    // Parse and validate query parameters
    const url = new URL(req.url);
    const validated = csatFilterSchema.safeParse({
      botId: url.searchParams.get('botId'),
      startDate: url.searchParams.get('startDate'),
      endDate: url.searchParams.get('endDate'),
      timeFrame: url.searchParams.get('timeFrame') || 'daily',
      minRating: url.searchParams.get('minRating'),
      maxRating: url.searchParams.get('maxRating')
    });

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validated.error.format() },
        { status: 400 }
      );
    }

    const { botId, startDate, endDate, timeFrame, minRating, maxRating } = validated.data;

    // Default to last 30 days if no dates provided
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    
    const startDateTime = startDate ? new Date(startDate) : defaultStartDate;
    const endDateTime = endDate ? new Date(endDate) : new Date();

    // Get user's bots or specific bot
    const botsCondition = botId 
      ? { id: botId, creator_id: user.userId }
      : { creator_id: user.userId };

    const bots = await db.bot.findMany({
      where: botsCondition,
      select: {
        id: true,
        bot_name: true
      }
    });

    if (bots.length === 0) {
      return NextResponse.json({
        message: botId ? "Bot not found or unauthorized" : "No bots found for this user",
        csat: []
      }, { status: botId ? 404 : 200 });
    }

    const botIds = bots.map(bot => bot.id);

    // Build rating filter if provided
    const ratingFilter: any = {};
    if (minRating !== undefined) {
      ratingFilter.rating_score = {
        ...ratingFilter.rating_score,
        gte: minRating
      };
    }
    
    if (maxRating !== undefined) {
      ratingFilter.rating_score = {
        ...ratingFilter.rating_score,
        lte: maxRating
      };
    }

    // Get CSAT ratings
    const csatRatings = await db.csat.findMany({
      where: {
        conversation: {
          bot_id: { in: botIds },
          start_time: {
            gte: startDateTime,
            lte: endDateTime
          }
        },
        ...ratingFilter
      },
      include: {
        conversation: {
          select: {
            bot_id: true,
            escalated: true,
            minutes: true,
            start_time: true
          }
        }
      },
      orderBy: {
        feedback_at: 'asc'
      }
    });

    // Type for bot CSAT map entries
    interface BotCsatEntry {
      botId: string;
      botName: string;
      ratingsCount: number;
      averageScore: number;
      distribution: CsatDistribution;
      escalationByScore: EscalationByScore;
    }
    
    // Group by bot for overall stats
    const botCsatMap = botIds.reduce<Record<string, BotCsatEntry>>((map, id) => {
      map[id] = {
        botId: id,
        botName: bots.find(b => b.id === id)?.bot_name || 'Unknown',
        ratingsCount: 0,
        averageScore: 0,
        distribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0
        },
        escalationByScore: {
          1: { count: 0, total: 0, rate: 0 },
          2: { count: 0, total: 0, rate: 0 },
          3: { count: 0, total: 0, rate: 0 },
          4: { count: 0, total: 0, rate: 0 },
          5: { count: 0, total: 0, rate: 0 }
        }
      };
      return map;
    }, {});

    // Define types for time series data
    interface TimeSeriesEntry {
      botId: string;
      botName: string;
      averageScore: number;
      ratingsCount: number;
      distribution: CsatDistribution;
    }

    // Time series data for plotting trends
    const timeSeriesData: Record<string, Record<string, TimeSeriesEntry>> = {};

    // Process each CSAT rating
    csatRatings.forEach(csat => {
      const botId = csat.conversation.bot_id;
      const score = csat.rating_score as CsatScore; // Cast to our CsatScore type
      const date = new Date(csat.feedback_at);
      
      // Update bot stats
      botCsatMap[botId].ratingsCount++;
      botCsatMap[botId].distribution[score]++;
      
      // Track escalations by score
      botCsatMap[botId].escalationByScore[score].total++;
      if (csat.conversation.escalated) {
        botCsatMap[botId].escalationByScore[score].count++;
      }
      
      // Generate time key based on timeFrame
      let timeKey: string;
      if (timeFrame === 'daily') {
        timeKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (timeFrame === 'weekly') {
        // Get the week number
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        timeKey = `${date.getFullYear()}-W${weekNumber}`;
      } else {
        // Monthly
        timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      
      // Initialize time series entry if needed
      if (!timeSeriesData[timeKey]) {
        timeSeriesData[timeKey] = {};
      }
      
      if (!timeSeriesData[timeKey][botId]) {
        timeSeriesData[timeKey][botId] = {
          botId,
          botName: bots.find(b => b.id === botId)?.bot_name || 'Unknown',
          averageScore: 0,
          ratingsCount: 0,
          distribution: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
          }
        };
      }
      
      // Update time series data
      timeSeriesData[timeKey][botId].distribution[score]++;
      timeSeriesData[timeKey][botId].ratingsCount++;
    });

    // Calculate final averages and percentages for each bot
    Object.keys(botCsatMap).forEach(botId => {
      const bot = botCsatMap[botId];
      if (bot.ratingsCount > 0) {
        // Calculate average CSAT score
        const totalScore = Object.entries(bot.distribution).reduce((sum, [scoreStr, count]) => {
          const score = parseInt(scoreStr) as CsatScore;
          return sum + (score * count);
        }, 0);
        
        bot.averageScore = totalScore / bot.ratingsCount;
        
        // Calculate escalation rates by score
        const scoreValues: CsatScore[] = [1, 2, 3, 4, 5];
        for (const scoreValue of scoreValues) {
          if (bot.escalationByScore[scoreValue].total > 0) {
            bot.escalationByScore[scoreValue].rate = 
              (bot.escalationByScore[scoreValue].count / bot.escalationByScore[scoreValue].total) * 100;
          }
        }
        
        // Convert distribution to percentages
        const totalRatings = bot.ratingsCount;
        for (const scoreValue of scoreValues) {
          bot.distribution[scoreValue] = (bot.distribution[scoreValue] / totalRatings) * 100;
        }
      }
    });

    // Calculate time series averages
    Object.keys(timeSeriesData).forEach(timeKey => {
      Object.keys(timeSeriesData[timeKey]).forEach(botId => {
        const entry = timeSeriesData[timeKey][botId];
        if (entry.ratingsCount > 0) {
          const totalScore = Object.entries(entry.distribution).reduce((sum, [scoreStr, count]) => {
            const score = parseInt(scoreStr) as CsatScore;
            return sum + (score * count);
          }, 0);
          
          entry.averageScore = totalScore / entry.ratingsCount;
        }
      });
    });

    // Convert time series data to sorted array
    const trends = Object.entries(timeSeriesData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([timeKey, botData]) => {
        return {
          period: timeKey,
          bots: Object.values(botData).map(entry => ({
            botId: entry.botId,
            botName: entry.botName,
            averageScore: entry.averageScore,
            ratingsCount: entry.ratingsCount,
            distribution: entry.distribution
          }))
        };
      });

    // Calculate satisfaction categories (high, medium, low)
    const satisfactionCategories = {
      high: csatRatings.filter(csat => csat.rating_score >= 4).length,
      medium: csatRatings.filter(csat => csat.rating_score === 3).length,
      low: csatRatings.filter(csat => csat.rating_score < 3).length
    };

    // Calculate overall CSAT metrics
    const totalRatings = csatRatings.length;
    const overallAverageScore = totalRatings > 0
      ? csatRatings.reduce((sum, csat) => sum + csat.rating_score, 0) / totalRatings
      : 0;
    
    const satisfactionPercentages = totalRatings > 0 ? {
      high: (satisfactionCategories.high / totalRatings) * 100,
      medium: (satisfactionCategories.medium / totalRatings) * 100,
      low: (satisfactionCategories.low / totalRatings) * 100
    } : { high: 0, medium: 0, low: 0 };

    // Calculate distribution percentages for all ratings
    const overallDistribution: CsatDistribution = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };

    csatRatings.forEach(csat => {
      const score = csat.rating_score as CsatScore;
      overallDistribution[score]++;
    });

    const distributionPercentages: CsatDistribution = totalRatings > 0 
      ? {
          1: (overallDistribution[1] / totalRatings) * 100,
          2: (overallDistribution[2] / totalRatings) * 100,
          3: (overallDistribution[3] / totalRatings) * 100,
          4: (overallDistribution[4] / totalRatings) * 100,
          5: (overallDistribution[5] / totalRatings) * 100
        }
      : overallDistribution;

    // Determine satisfaction trend
    let trend = "stable";
    if (trends.length >= 2) {
      const latestPeriods = trends.slice(-3);
      
      const firstAvg = latestPeriods[0].bots.reduce((sum, bot) => sum + bot.averageScore * bot.ratingsCount, 0) / 
        latestPeriods[0].bots.reduce((sum, bot) => sum + bot.ratingsCount, 0);
      
      const lastAvg = latestPeriods[latestPeriods.length - 1].bots.reduce((sum, bot) => sum + bot.averageScore * bot.ratingsCount, 0) / 
        latestPeriods[latestPeriods.length - 1].bots.reduce((sum, bot) => sum + bot.ratingsCount, 0);
      
      const difference = lastAvg - firstAvg;
      if (difference > 0.3) {
        trend = "improving";
      } else if (difference < -0.3) {
        trend = "declining";
      }
    }

    return NextResponse.json({
      timeframe: {
        start: startDateTime,
        end: endDateTime,
        groupBy: timeFrame
      },
      summary: {
        totalRatings,
        averageScore: overallAverageScore,
        distribution: distributionPercentages,
        satisfaction: {
          high: satisfactionPercentages.high,
          medium: satisfactionPercentages.medium,
          low: satisfactionPercentages.low
        },
        trend
      },
      bots: Object.values(botCsatMap),
      trends
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching CSAT analysis:", error);
    return NextResponse.json(
      { error: "Error fetching CSAT analysis" },
      { status: 500 }
    );
  }
}

// POST endpoint for manually adding CSAT ratings (for testing/development)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.email) {
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

    // Parse request body
    const body = await req.json();
    const { conversationId, rating } = body;

    if (!conversationId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Invalid request. Conversation ID and rating (1-5) are required" },
        { status: 400 }
      );
    }

    // Check if conversation exists and belongs to user's bot
    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        bot: {
          creator_id: user.userId
        }
      }
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found or unauthorized" },
        { status: 404 }
      );
    }

    // Create the CSAT rating
    const csatRating = await db.csat.create({
      data: {
        conversation_id: conversationId,
        rating_score: rating,
        feedback_at: new Date(),
        submitted_at: new Date()
      }
    });

    return NextResponse.json({
      message: "CSAT rating added successfully",
      csat: {
        id: csatRating.id,
        conversationId: csatRating.conversation_id,
        rating: csatRating.rating_score,
        feedbackAt: csatRating.feedback_at,
        submittedAt: csatRating.submitted_at
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error adding CSAT rating:", error);
    return NextResponse.json(
      { error: "Error adding CSAT rating" },
      { status: 500 }
    );
  }
}