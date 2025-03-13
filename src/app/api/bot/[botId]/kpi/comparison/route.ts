import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const comparisonSchema = z.object({
  botIds: z.string().transform(ids => ids.split(',')),
  metrics: z.string().transform(metrics => metrics.split(',')),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

// GET: Compare performance metrics between multiple bots
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
    const validated = comparisonSchema.safeParse({
      botIds: url.searchParams.get('botIds') || '',
      metrics: url.searchParams.get('metrics') || 'resolutionRate,csatScore,escalationRate,responseTime,knowledgeBaseUtilization',
      startDate: url.searchParams.get('startDate'),
      endDate: url.searchParams.get('endDate')
    });

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validated.error.format() },
        { status: 400 }
      );
    }

    const { botIds, metrics, startDate, endDate } = validated.data;

    if (botIds.length === 0) {
      return NextResponse.json(
        { error: "At least one bot ID must be provided" },
        { status: 400 }
      );
    }

    // Default to last 30 days if no dates provided
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    
    const startDateTime = startDate ? new Date(startDate) : defaultStartDate;
    const endDateTime = endDate ? new Date(endDate) : new Date();

    // Check if user has access to all requested bots
    const accessibleBots = await db.bot.findMany({
      where: {
        id: { in: botIds },
        creator_id: user.userId
      },
      select: {
        id: true,
        bot_name: true,
        model_type: true
      }
    });

    if (accessibleBots.length !== botIds.length) {
      return NextResponse.json(
        { error: "One or more requested bots not found or unauthorized" },
        { status: 403 }
      );
    }

    // Fetch data for each bot and calculate metrics
    const botPerformanceData = await Promise.all(accessibleBots.map(async (bot) => {
      // Get conversations for this bot in the date range
      const conversations = await db.conversation.findMany({
        where: {
          bot_id: bot.id,
          start_time: {
            gte: startDateTime,
            lte: endDateTime
          }
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

      const totalInteractions = conversations.length;
      
      // Calculate the requested metrics
      const metricResults: Record<string, any> = {};

      // Resolution Rate
      if (metrics.includes('resolutionRate')) {
        const resolvedInteractions = conversations.filter(conv => 
          conv.resolution_status === "RESOLVED" || conv.resolution_status === "COMPLETED"
        ).length;
        
        metricResults.resolutionRate = {
          value: totalInteractions > 0 ? (resolvedInteractions / totalInteractions) * 100 : 0,
          resolvedCount: resolvedInteractions,
          totalCount: totalInteractions
        };
      }

      // CSAT Score
      if (metrics.includes('csatScore')) {
        const csatRatings = conversations.flatMap(conv => conv.csat);
        const totalCsatScore = csatRatings.reduce((sum, rating) => sum + rating.rating_score, 0);
        
        metricResults.csatScore = {
          value: csatRatings.length > 0 ? totalCsatScore / csatRatings.length : 0,
          ratingCount: csatRatings.length
        };
      }

      // Session Volume
      if (metrics.includes('sessionVolume')) {
        metricResults.sessionVolume = {
          value: totalInteractions
        };
      }

      // Escalation Rate
      if (metrics.includes('escalationRate')) {
        const escalatedInteractions = conversations.filter(conv => conv.escalated).length;
        
        metricResults.escalationRate = {
          value: totalInteractions > 0 ? (escalatedInteractions / totalInteractions) * 100 : 0,
          escalatedCount: escalatedInteractions,
          totalCount: totalInteractions
        };
      }

      // Knowledge Base Utilization
      if (metrics.includes('knowledgeBaseUtilization')) {
        const botMessages = conversations.flatMap(conv => 
          conv.messages.filter(msg => msg.sender_type === "BOT")
        );
        
        const knowledgeBaseResponses = botMessages.filter(msg => msg.used_knowledge_base).length;
        
        metricResults.knowledgeBaseUtilization = {
          value: botMessages.length > 0 ? (knowledgeBaseResponses / botMessages.length) * 100 : 0,
          knowledgeBaseCount: knowledgeBaseResponses,
          totalBotMessages: botMessages.length
        };
      }

      // Average Response Time
      if (metrics.includes('responseTime')) {
        const responseTimesMs = conversations.flatMap(conv => 
          conv.messages
            .filter(msg => msg.sender_type === "BOT" && msg.response_time !== null)
            .map(msg => msg.response_time || 0)
        );
        
        const avgResponseTimeMs = responseTimesMs.length > 0 
          ? responseTimesMs.reduce((sum, time) => sum + time, 0) / responseTimesMs.length 
          : 0;
        
        metricResults.responseTime = {
          valueMs: avgResponseTimeMs,
          valueSec: avgResponseTimeMs / 1000,
          messageCount: responseTimesMs.length
        };
      }

      // Unrecognized Queries
      if (metrics.includes('unrecognizedQueries')) {
        const unrecognizedQueries = conversations.flatMap(conv => 
          conv.messages.flatMap(msg => msg.unrecognized_queries)
        );
        
        metricResults.unrecognizedQueries = {
          value: unrecognizedQueries.length,
          userMessages: conversations.flatMap(conv => 
            conv.messages.filter(msg => msg.sender_type === "USER")
          ).length
        };
      }

      // Lead Generation
      if (metrics.includes('leadGeneration')) {
        const leadTaggedMessages = conversations.flatMap(conv => 
          conv.messages.filter(msg => msg.message_text.toLowerCase().includes("lead"))
        );
        
        metricResults.leadGeneration = {
          value: leadTaggedMessages.length
        };
      }

      // Training Coverage
      if (metrics.includes('trainingCoverage')) {
        const coverage = await db.training_Coverage.findFirst({
          where: { bot_id: bot.id },
          orderBy: { measure_at: 'desc' }
        });
        
        metricResults.trainingCoverage = coverage ? {
          value: coverage.total_unique_queries > 0 
            ? (coverage.covered_intents / coverage.total_unique_queries) * 100 
            : 0,
          coveredIntents: coverage.covered_intents,
          totalQueries: coverage.total_unique_queries,
          measuredAt: coverage.measure_at
        } : {
          value: 0,
          coveredIntents: 0,
          totalQueries: 0,
          measuredAt: null
        };
      }

      // Sentiment Analysis
      if (metrics.includes('sentiment')) {
        const conversationsWithSentiment = conversations.filter(conv => conv.sentiment_score !== null);
        const totalSentiment = conversationsWithSentiment.reduce((sum, conv) => 
          sum + (conv.sentiment_score || 0), 0
        );
        
        metricResults.sentiment = {
          value: conversationsWithSentiment.length > 0 
            ? totalSentiment / conversationsWithSentiment.length 
            : 0,
          conversationCount: conversationsWithSentiment.length
        };
      }

      return {
        botId: bot.id,
        botName: bot.bot_name,
        modelType: bot.model_type,
        conversationCount: totalInteractions,
        metrics: metricResults
      };
    }));

    // Format data for comparison visualization
    const comparisonData = metrics.map(metric => {
      // Get display name for the metric
      const metricDisplayName = getMetricDisplayName(metric);
      
      return {
        metric,
        name: metricDisplayName,
        bots: botPerformanceData.map(bot => ({
          botId: bot.botId,
          botName: bot.botName,
          value: bot.metrics[metric]?.value || 0,
          details: bot.metrics[metric] || {}
        }))
      };
    });

    return NextResponse.json({
      timeframe: {
        start: startDateTime,
        end: endDateTime
      },
      bots: accessibleBots,
      metrics: comparisonData,
      rawData: botPerformanceData
    }, { status: 200 });
  } catch (error) {
    console.error("Error comparing bot performance:", error);
    return NextResponse.json(
      { error: "Error comparing bot performance" },
      { status: 500 }
    );
  }
}

// Helper function to get friendly display names for metrics
function getMetricDisplayName(metricKey: string): string {
  const displayNames: Record<string, string> = {
    resolutionRate: "Resolution Rate",
    csatScore: "CSAT Score",
    sessionVolume: "Session Volume",
    escalationRate: "Escalation Rate",
    knowledgeBaseUtilization: "Knowledge Base Utilization",
    responseTime: "Response Time",
    unrecognizedQueries: "Unrecognized Queries",
    leadGeneration: "Lead Generation",
    trainingCoverage: "Training Coverage",
    sentiment: "Sentiment Score"
  };
  
  return displayNames[metricKey] || metricKey;
}