import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const timeRangeSchema = z.object({
  range: z.enum(["7d", "30d", "90d", "all"]).default("30d")
});

// GET: Detailed analytics for a specific bot
export async function GET(
  req: Request,
  context: { params: Promise<{ botId: string }> }
) {
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

    const url = new URL(req.url);
    const timeRange = timeRangeSchema.safeParse({
      range: url.searchParams.get("range") || "30d"
    });

    if (!timeRange.success) {
      return NextResponse.json(
        { error: "Invalid time range" },
        { status: 400 }
      );
    }

    const param = await context.params;
    const botId = await param.botId;

    // Check if bot exists and belongs to user
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

    // Determine date range based on selection
    const startDate = new Date();
    switch (timeRange.data.range) {
      case "7d":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(startDate.getDate() - 90);
        break;
      case "all":
        // No date filtering
        startDate.setFullYear(2000); // Far in the past
        break;
    }

    // Get conversations for the bot within time range
    const conversations = await db.conversation.findMany({
      where: {
        bot_id: botId,
        start_time: {
          gte: startDate
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
      },
      orderBy: {
        start_time: 'asc'
      }
    });

    // Group conversations by day
    const conversationsByDay: Record<string, any[]> = {};
    conversations.forEach(conv => {
      const day = conv.start_time.toISOString().split('T')[0];
      if (!conversationsByDay[day]) {
        conversationsByDay[day] = [];
      }
      conversationsByDay[day].push(conv);
    });

    // Calculate daily metrics
    const dailyMetrics = Object.entries(conversationsByDay).map(([date, convs]) => {
      // Calculate total conversations for the day
      const totalConversations = convs.length;
      
      // Calculate total and average message count
      const totalMessages = convs.reduce((sum, conv) => sum + conv.messages.length, 0);
      const avgMessages = totalConversations > 0 ? totalMessages / totalConversations : 0;
      
      // Calculate average CSAT score
      const csatRatings = convs.flatMap(conv => conv.csat);
      const totalCsatScore = csatRatings.reduce((sum, rating) => sum + rating.rating_score, 0);
      const avgCsat = csatRatings.length > 0 ? totalCsatScore / csatRatings.length : null;
      
      // Calculate escalation rate
      const escalatedCount = convs.filter(conv => conv.escalated).length;
      const escalationRate = totalConversations > 0 ? (escalatedCount / totalConversations) * 100 : 0;
      
      // Calculate average conversation duration
      const convsWithDuration = convs.filter(conv => conv.minutes !== null);
      const totalDuration = convsWithDuration.reduce((sum, conv) => sum + (conv.minutes || 0), 0);
      const avgDuration = convsWithDuration.length > 0 ? totalDuration / convsWithDuration.length : 0;
      
      // Calculate unrecognized query rate - Fixed the TypeScript error here
      const totalUnrecognizedQueries = convs.reduce((sum, conv) => {
        return sum + conv.messages.reduce((msgSum: number, msg: any) => 
          msgSum + msg.unrecognized_queries.length, 0
        );
      }, 0);
      
      return {
        date,
        conversations: totalConversations,
        messages: {
          total: totalMessages,
          average: avgMessages.toFixed(1)
        },
        csat: avgCsat !== null ? avgCsat.toFixed(1) : null,
        escalationRate: escalationRate.toFixed(1),
        avgDurationMinutes: avgDuration.toFixed(1),
        unrecognizedQueries: totalUnrecognizedQueries
      };
    });

    // Get top unrecognized queries
    const unrecognizedQueries = await db.unrecognizedQueries.findMany({
      where: {
        message: {
          conversation: {
            bot_id: botId,
            start_time: {
              gte: startDate
            }
          }
        }
      },
      orderBy: {
        frequency: 'desc'
      },
      take: 10
    });

    // Calculate total and training coverage
    const trainingCoverage = await db.training_Coverage.findFirst({
      where: {
        bot_id: botId
      },
      orderBy: {
        measure_at: 'desc'
      }
    });

    // Compile training stats
    const trainingStats = {
      totalQueries: trainingCoverage?.total_unique_queries || 0,
      coveredIntents: trainingCoverage?.covered_intents || 0,
      coveragePercentage: trainingCoverage
        ? ((trainingCoverage.covered_intents / trainingCoverage.total_unique_queries) * 100).toFixed(1)
        : '0',
      lastMeasured: trainingCoverage?.measure_at || null
    };

    // Gather QA data
    const qaItems = await db.bot_QA.count({
      where: {
        bot_id: botId,
        is_active: true
      }
    });

    return NextResponse.json({
      botId: bot.id,
      botName: bot.bot_name,
      timeRange: timeRange.data.range,
      summary: {
        totalConversations: conversations.length,
        totalMessages: conversations.reduce((sum, conv) => sum + conv.messages.length, 0),
        avgCsat: (() => {
          const allCsat = conversations.flatMap(conv => conv.csat);
          const totalScore = allCsat.reduce((sum, rating) => sum + rating.rating_score, 0);
          return allCsat.length > 0 ? (totalScore / allCsat.length).toFixed(1) : null;
        })(),
        escalationRate: (() => {
          const escalated = conversations.filter(conv => conv.escalated).length;
          return conversations.length > 0 
            ? ((escalated / conversations.length) * 100).toFixed(1) 
            : '0';
        })(),
        avgDurationMinutes: (() => {
          const withDuration = conversations.filter(conv => conv.minutes !== null);
          const total = withDuration.reduce((sum, conv) => sum + (conv.minutes || 0), 0);
          return withDuration.length > 0 ? (total / withDuration.length).toFixed(1) : '0';
        })(),
        activeQAItems: qaItems
      },
      dailyMetrics,
      topUnrecognizedQueries: unrecognizedQueries.map(q => ({
        query: q.query_text,
        frequency: q.frequency,
        firstSeen: q.first_seen_at,
        lastSeen: q.last_seen_at
      })),
      trainingCoverage: trainingStats
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching bot analytics:", error);
    return NextResponse.json(
      { error: "Error fetching bot analytics" },
      { status: 500 }
    );
  }
}