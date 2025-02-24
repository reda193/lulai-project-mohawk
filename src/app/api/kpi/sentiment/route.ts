import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const sentimentFilterSchema = z.object({
  botId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timeFrame: z.enum(['daily', 'weekly', 'monthly']).default('daily')
});

// GET: Get sentiment analysis for user's bots
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
    const validated = sentimentFilterSchema.safeParse({
      botId: url.searchParams.get('botId'),
      startDate: url.searchParams.get('startDate'),
      endDate: url.searchParams.get('endDate'),
      timeFrame: url.searchParams.get('timeFrame') || 'daily'
    });

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validated.error.format() },
        { status: 400 }
      );
    }

    const { botId, startDate, endDate, timeFrame } = validated.data;

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
        sentiment: []
      }, { status: botId ? 404 : 200 });
    }

    const botIds = bots.map(bot => bot.id);

    // Get conversations with sentiment scores
    const conversations = await db.conversation.findMany({
      where: {
        bot_id: { in: botIds },
        sentiment_score: { not: null },
        start_time: {
          gte: startDateTime,
          lte: endDateTime
        }
      },
      select: {
        id: true,
        bot_id: true,
        start_time: true,
        sentiment_score: true,
        escalated: true
      }
    });

    // Group by bot for overall stats
    const botSentimentMap = botIds.reduce((map, id) => {
      map[id] = {
        botId: id,
        botName: bots.find(b => b.id === id)?.bot_name || 'Unknown',
        conversationsCount: 0,
        averageSentiment: 0,
        distribution: {
          positive: 0,
          neutral: 0,
          negative: 0
        },
        escalationByDistribution: {
          positive: { count: 0, total: 0 },
          neutral: { count: 0, total: 0 },
          negative: { count: 0, total: 0 }
        }
      };
      return map;
    }, {} as Record<string, any>);

    // Define types for time series data
    interface SentimentTimeEntry {
      positive: number;
      neutral: number;
      negative: number;
      averageScore: number;
      totalCount: number;
    }
    
    // Time series data for plotting trends
    const timeSeriesData: Record<string, Record<string, SentimentTimeEntry>> = {};

    // Process each conversation
    conversations.forEach(conv => {
      const botId = conv.bot_id;
      const sentiment = conv.sentiment_score || 0;
      const date = new Date(conv.start_time);
      
      // Update bot stats
      botSentimentMap[botId].conversationsCount++;
      
      // Categorize sentiment
      let category: 'positive' | 'neutral' | 'negative';
      if (sentiment > 0.3) {
        category = 'positive';
      } else if (sentiment < -0.3) {
        category = 'negative';
      } else {
        category = 'neutral';
      }
      
      // Update distribution
      botSentimentMap[botId].distribution[category]++;
      
      // Track escalations by sentiment category
      botSentimentMap[botId].escalationByDistribution[category].total++;
      if (conv.escalated) {
        botSentimentMap[botId].escalationByDistribution[category].count++;
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
          positive: 0,
          neutral: 0,
          negative: 0,
          averageScore: 0,
          totalCount: 0
        };
      }
      
      // Update time series data
      timeSeriesData[timeKey][botId][category]++;
      timeSeriesData[timeKey][botId].totalCount++;
      timeSeriesData[timeKey][botId].averageScore = 
        (timeSeriesData[timeKey][botId].averageScore * (timeSeriesData[timeKey][botId].totalCount - 1) + sentiment) / 
        timeSeriesData[timeKey][botId].totalCount;
    });

    // Calculate final averages and percentages for each bot
    Object.keys(botSentimentMap).forEach(botId => {
      const bot = botSentimentMap[botId];
      if (bot.conversationsCount > 0) {
        // Calculate average sentiment from all conversations for this bot
        const botConversations = conversations.filter(c => c.bot_id === botId);
        const totalSentiment = botConversations.reduce((sum, conv) => sum + (conv.sentiment_score || 0), 0);
        bot.averageSentiment = totalSentiment / botConversations.length;
        
        // Convert counts to percentages
        const totalDistribution = bot.distribution.positive + bot.distribution.neutral + bot.distribution.negative;
        if (totalDistribution > 0) {
          bot.distribution.positive = (bot.distribution.positive / totalDistribution) * 100;
          bot.distribution.neutral = (bot.distribution.neutral / totalDistribution) * 100;
          bot.distribution.negative = (bot.distribution.negative / totalDistribution) * 100;
        }
        
        // Calculate escalation rates for each sentiment category
        if (bot.escalationByDistribution.positive.total > 0) {
          bot.escalationByDistribution.positive.rate = 
            (bot.escalationByDistribution.positive.count / bot.escalationByDistribution.positive.total) * 100;
        }
        
        if (bot.escalationByDistribution.neutral.total > 0) {
          bot.escalationByDistribution.neutral.rate = 
            (bot.escalationByDistribution.neutral.count / bot.escalationByDistribution.neutral.total) * 100;
        }
        
        if (bot.escalationByDistribution.negative.total > 0) {
          bot.escalationByDistribution.negative.rate = 
            (bot.escalationByDistribution.negative.count / bot.escalationByDistribution.negative.total) * 100;
        }
      }
    });

    // Convert time series data to sorted array
    const trends = Object.entries(timeSeriesData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([timeKey, botData]) => {
        const botTrends = Object.entries(botData).map(([botId, data]) => {
          const totalCount = data.positive + data.neutral + data.negative;
          return {
            botId,
            botName: bots.find(b => b.id === botId)?.bot_name || 'Unknown',
            distribution: {
              positive: totalCount > 0 ? (data.positive / totalCount) * 100 : 0,
              neutral: totalCount > 0 ? (data.neutral / totalCount) * 100 : 0,
              negative: totalCount > 0 ? (data.negative / totalCount) * 100 : 0
            },
            averageScore: data.averageScore,
            count: totalCount
          };
        });

        return {
          period: timeKey,
          bots: botTrends
        };
      });

    // Prepare overall stats
    const overallSentiment = conversations.length > 0
      ? conversations.reduce((sum, conv) => sum + (conv.sentiment_score || 0), 0) / conversations.length
      : 0;

    const sentimentDistribution = {
      positive: conversations.filter(conv => (conv.sentiment_score || 0) > 0.3).length,
      neutral: conversations.filter(conv => (conv.sentiment_score || 0) >= -0.3 && (conv.sentiment_score || 0) <= 0.3).length,
      negative: conversations.filter(conv => (conv.sentiment_score || 0) < -0.3).length
    };

    const totalConversations = conversations.length;
    const distributionPercentages = totalConversations > 0 ? {
      positive: (sentimentDistribution.positive / totalConversations) * 100,
      neutral: (sentimentDistribution.neutral / totalConversations) * 100,
      negative: (sentimentDistribution.negative / totalConversations) * 100
    } : { positive: 0, neutral: 0, negative: 0 };

    return NextResponse.json({
      timeframe: {
        start: startDateTime,
        end: endDateTime,
        groupBy: timeFrame
      },
      summary: {
        totalConversationsWithSentiment: totalConversations,
        overallSentiment: overallSentiment,
        distribution: distributionPercentages
      },
      bots: Object.values(botSentimentMap),
      trends
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching sentiment analysis:", error);
    return NextResponse.json(
      { error: "Error fetching sentiment analysis" },
      { status: 500 }
    );
  }
}