import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const kpiFilterSchema = z.object({
  botId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timeFrame: z.enum(['daily', 'weekly', 'monthly']).default('daily')
});

// GET: Retrieve all KPI metrics for a user's bots
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
    const validated = kpiFilterSchema.safeParse({
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

    // Query condition for date range
    const dateCondition = {
      start_time: {
        gte: startDateTime,
        lte: endDateTime
      }
    };

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
        kpis: {}
      }, { status: botId ? 404 : 200 });
    }

    const botIds = bots.map(bot => bot.id);
    
    // Get all conversations within the date range for the specified bots
    const conversations = await db.conversation.findMany({
      where: {
        bot_id: { in: botIds },
        ...dateCondition
      },
      include: {
        messages: {
          include: {
            knowledge_queries: true,
            unrecognized_queries: true
          }
        },
        csat: true
      }
    });

    // Calculate metrics for each KPI
    
    // 1. Resolution Rate
    const totalInteractions = conversations.length;
    const resolvedInteractions = conversations.filter(conv => 
      conv.resolution_status === "RESOLVED" || conv.resolution_status === "COMPLETED"
    ).length;
    const resolutionRate = totalInteractions > 0 
      ? (resolvedInteractions / totalInteractions) * 100 
      : 0;

    // 2. CSAT (Admin)
    const csatRatings = conversations.flatMap(conv => conv.csat);
    const totalCsatScore = csatRatings.reduce((sum, rating) => sum + rating.rating_score, 0);
    const avgCsat = csatRatings.length > 0 
      ? totalCsatScore / csatRatings.length 
      : 0;

    // 3. Session Volume
    const sessionVolume = totalInteractions;

    // 4. Escalation Rate
    const escalatedInteractions = conversations.filter(conv => conv.escalated).length;
    const escalationRate = totalInteractions > 0 
      ? (escalatedInteractions / totalInteractions) * 100 
      : 0;

    // 5. Knowledge Base Utilization
    const botMessages = conversations.flatMap(conv => 
      conv.messages.filter(msg => msg.sender_type === "BOT")
    );
    
    const knowledgeBaseResponses = botMessages.filter(msg => msg.used_knowledge_base).length;
    const knowledgeBaseUtilization = botMessages.length > 0 
      ? (knowledgeBaseResponses / botMessages.length) * 100 
      : 0;

    // 6. Average Response Time
    const responseTimesMs = conversations.flatMap(conv => 
      conv.messages
        .filter(msg => msg.sender_type === "BOT" && msg.response_time !== null)
        .map(msg => msg.response_time || 0)
    );
    
    const avgResponseTimeMs = responseTimesMs.length > 0 
      ? responseTimesMs.reduce((sum, time) => sum + time, 0) / responseTimesMs.length 
      : 0;
    
    // Convert to seconds for better readability
    const avgResponseTimeSec = avgResponseTimeMs / 1000;

    // 7. Unrecognized Queries
    const unrecognizedQueries = conversations.flatMap(conv => 
      conv.messages.flatMap(msg => msg.unrecognized_queries)
    );
    
    const totalUnrecognizedQueries = unrecognizedQueries.length;
    
    // Get top unrecognized queries
    const unrecognizedQueryCounts: Record<string, number> = {};
    unrecognizedQueries.forEach(query => {
      if (!unrecognizedQueryCounts[query.query_text]) {
        unrecognizedQueryCounts[query.query_text] = 0;
      }
      unrecognizedQueryCounts[query.query_text] += query.frequency;
    });
    
    const topUnrecognizedQueries = Object.entries(unrecognizedQueryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));

    // 8. Lead Generation
    const leadTaggedMessages = conversations.flatMap(conv => 
      conv.messages.filter(msg => msg.message_text.toLowerCase().includes("lead"))
    );
    
    const leadCount = leadTaggedMessages.length;

    // 9. Training Coverage
    const trainingCoverage = await Promise.all(botIds.map(async (botId) => {
      const coverage = await db.training_Coverage.findFirst({
        where: { bot_id: botId },
        orderBy: { measure_at: 'desc' }
      });
      
      return {
        botId,
        coverage: coverage ? {
          totalQueries: coverage.total_unique_queries,
          coveredIntents: coverage.covered_intents,
          percentage: coverage.total_unique_queries > 0 
            ? (coverage.covered_intents / coverage.total_unique_queries) * 100 
            : 0,
          measuredAt: coverage.measure_at
        } : null
      };
    }));

    // 10. Sentiment Trends
    const conversationsWithSentiment = conversations.filter(conv => conv.sentiment_score !== null);
    
    const sentimentGroups = {
      positive: conversationsWithSentiment.filter(conv => (conv.sentiment_score || 0) > 0.3).length,
      neutral: conversationsWithSentiment.filter(conv => 
        (conv.sentiment_score || 0) >= -0.3 && (conv.sentiment_score || 0) <= 0.3
      ).length,
      negative: conversationsWithSentiment.filter(conv => (conv.sentiment_score || 0) < -0.3).length
    };
    
    const sentimentDistribution = conversationsWithSentiment.length > 0 ? {
      positive: (sentimentGroups.positive / conversationsWithSentiment.length) * 100,
      neutral: (sentimentGroups.neutral / conversationsWithSentiment.length) * 100,
      negative: (sentimentGroups.negative / conversationsWithSentiment.length) * 100
    } : { positive: 0, neutral: 0, negative: 0 };

    // Define the type for our time series data structure
    interface TimeSeriesEntry {
      interactions: number;
      resolved: number;
      escalated: number;
      leadCount: number;
      csatScores: number[];
      responseTimesMs: number[];
      knowledgeBaseUsed: number;
      botMessages: number;
      unrecognizedQueries: number;
      sentimentScores: number[];
    }

    // Group data by time periods for trend analysis
    const timeSeriesData = conversations.reduce<Record<string, TimeSeriesEntry>>((acc, conv) => {
      let timeKey: string;
      const date = new Date(conv.start_time);
      
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

      if (!acc[timeKey]) {
        acc[timeKey] = {
          interactions: 0,
          resolved: 0,
          escalated: 0,
          leadCount: 0,
          csatScores: [],
          responseTimesMs: [],
          knowledgeBaseUsed: 0,
          botMessages: 0,
          unrecognizedQueries: 0,
          sentimentScores: []
        };
      }

      // Add data for each metric
      acc[timeKey].interactions++;
      
      if (conv.resolution_status === "RESOLVED" || conv.resolution_status === "COMPLETED") {
        acc[timeKey].resolved++;
      }
      
      if (conv.escalated) {
        acc[timeKey].escalated++;
      }
      
      // Add CSAT scores
      conv.csat.forEach(rating => {
        acc[timeKey].csatScores.push(rating.rating_score);
      });
      
      // Count lead-tagged messages
      const periodLeadMessages = conv.messages.filter(msg => 
        msg.message_text.toLowerCase().includes("lead")
      ).length;
      acc[timeKey].leadCount += periodLeadMessages;
      
      // Response times
      conv.messages.forEach(msg => {
        if (msg.sender_type === "BOT" && msg.response_time !== null) {
          acc[timeKey].responseTimesMs.push(msg.response_time || 0);
        }
        
        if (msg.sender_type === "BOT") {
          acc[timeKey].botMessages++;
          if (msg.used_knowledge_base) {
            acc[timeKey].knowledgeBaseUsed++;
          }
        }
        
        // Unrecognized queries
        acc[timeKey].unrecognizedQueries += msg.unrecognized_queries.length;
      });
      
      // Sentiment
      if (conv.sentiment_score !== null) {
        acc[timeKey].sentimentScores.push(conv.sentiment_score);
      }
      
      return acc;
    }, {});

    // Convert the time series data into arrays suitable for charts
    const trends = Object.entries(timeSeriesData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([timeKey, data]) => {
        // Calculate averages and percentages
        const csatAvg = data.csatScores.length > 0 
          ? data.csatScores.reduce((sum, score) => sum + score, 0) / data.csatScores.length 
          : null;
        
        const responseTimeAvg = data.responseTimesMs.length > 0
          ? data.responseTimesMs.reduce((sum, time) => sum + time, 0) / data.responseTimesMs.length / 1000
          : null;
        
        const knowledgeBaseRate = data.botMessages > 0
          ? (data.knowledgeBaseUsed / data.botMessages) * 100
          : 0;
        
        const resolutionRate = data.interactions > 0
          ? (data.resolved / data.interactions) * 100
          : 0;
        
        const escalationRate = data.interactions > 0
          ? (data.escalated / data.interactions) * 100
          : 0;
        
        const sentimentAvg = data.sentimentScores.length > 0
          ? data.sentimentScores.reduce((sum, score) => sum + score, 0) / data.sentimentScores.length
          : null;

        return {
          period: timeKey,
          metrics: {
            sessionVolume: data.interactions,
            resolutionRate: resolutionRate,
            escalationRate: escalationRate,
            csatScore: csatAvg,
            avgResponseTimeSec: responseTimeAvg,
            knowledgeBaseUtilization: knowledgeBaseRate,
            unrecognizedQueries: data.unrecognizedQueries,
            leadCount: data.leadCount,
            sentimentScore: sentimentAvg
          }
        };
      });

    // Return all KPI data
    return NextResponse.json({
      timeframe: {
        start: startDateTime,
        end: endDateTime,
        groupBy: timeFrame
      },
      bots: bots.map(bot => ({
        id: bot.id,
        name: bot.bot_name
      })),
      summary: {
        resolutionRate: {
          value: resolutionRate.toFixed(1),
          total: totalInteractions,
          resolved: resolvedInteractions
        },
        csatScore: {
          value: avgCsat.toFixed(1),
          totalRatings: csatRatings.length
        },
        sessionVolume: {
          value: sessionVolume
        },
        escalationRate: {
          value: escalationRate.toFixed(1),
          total: totalInteractions,
          escalated: escalatedInteractions
        },
        knowledgeBaseUtilization: {
          value: knowledgeBaseUtilization.toFixed(1),
          totalBotMessages: botMessages.length,
          knowledgeBasedResponses: knowledgeBaseResponses
        },
        avgResponseTime: {
          valueMs: avgResponseTimeMs.toFixed(0),
          valueSec: avgResponseTimeSec.toFixed(2)
        },
        unrecognizedQueries: {
          total: totalUnrecognizedQueries,
          topQueries: topUnrecognizedQueries
        },
        leadGeneration: {
          total: leadCount
        },
        trainingCoverage: trainingCoverage,
        sentimentTrends: {
          distribution: {
            positive: sentimentDistribution.positive.toFixed(1),
            neutral: sentimentDistribution.neutral.toFixed(1),
            negative: sentimentDistribution.negative.toFixed(1)
          },
          total: conversationsWithSentiment.length
        }
      },
      trends
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching KPI data:", error);
    return NextResponse.json(
      { error: "Error fetching KPI data" },
      { status: 500 }
    );
  }
}