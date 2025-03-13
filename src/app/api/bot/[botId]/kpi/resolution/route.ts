import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const resolutionFilterSchema = z.object({
  botId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timeFrame: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  status: z.string().optional()
});

// GET: Get resolution rate metrics for chatbots
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
    const validated = resolutionFilterSchema.safeParse({
      botId: url.searchParams.get('botId'),
      startDate: url.searchParams.get('startDate'),
      endDate: url.searchParams.get('endDate'),
      timeFrame: url.searchParams.get('timeFrame') || 'daily',
      status: url.searchParams.get('status')
    });

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validated.error.format() },
        { status: 400 }
      );
    }

    const { botId, startDate, endDate, timeFrame, status } = validated.data;

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
        resolution: []
      }, { status: botId ? 404 : 200 });
    }

    const botIds = bots.map(bot => bot.id);

    // Build query conditions
    const whereCondition: any = {
      bot_id: { in: botIds },
      start_time: {
        gte: startDateTime,
        lte: endDateTime
      }
    };

    // Add status filter if provided
    if (status) {
      whereCondition.resolution_status = status;
    }

    // Get conversations
    const conversations = await db.conversation.findMany({
      where: whereCondition,
      include: {
        messages: {
          select: {
            id: true,
            sender_type: true
          }
        }
      }
    });

    // Define which statuses count as "resolved"
    const resolvedStatuses = ["RESOLVED", "COMPLETED", "CLOSED"];

    // Group conversations by bot
    const botResolutionMap = botIds.reduce((map, id) => {
      map[id] = {
        botId: id,
        botName: bots.find(b => b.id === id)?.bot_name || 'Unknown',
        totalConversations: 0,
        resolvedConversations: 0,
        resolutionRate: 0,
        averageMessagesPerResolution: 0,
        statusBreakdown: {} as Record<string, number>
      };
      return map;
    }, {} as Record<string, any>);

    // Define types for time series data
    interface TimeSeriesEntry {
      botId: string;
      botName: string;
      totalConversations: number;
      resolvedConversations: number;
      resolutionRate: number;
      statusCounts: Record<string, number>;
    }

    // Time series data for plotting trends
    const timeSeriesData: Record<string, Record<string, TimeSeriesEntry>> = {};

    // Process each conversation
    conversations.forEach(conv => {
      const botId = conv.bot_id;
      const isResolved = resolvedStatuses.includes(conv.resolution_status || "");
      const messageCount = conv.messages.length;
      const userMessageCount = conv.messages.filter(msg => msg.sender_type === "USER").length;
      const botMessageCount = conv.messages.filter(msg => msg.sender_type === "BOT").length;
      const date = new Date(conv.start_time);
      
      // Update bot stats
      botResolutionMap[botId].totalConversations++;
      
      // Track resolution status
      if (!botResolutionMap[botId].statusBreakdown[conv.resolution_status || "UNRESOLVED"]) {
        botResolutionMap[botId].statusBreakdown[conv.resolution_status || "UNRESOLVED"] = 0;
      }
      botResolutionMap[botId].statusBreakdown[conv.resolution_status || "UNRESOLVED"]++;
      
      // Track resolved conversations
      if (isResolved) {
        botResolutionMap[botId].resolvedConversations++;
        
        // Update message count for calculating average
        if (!botResolutionMap[botId].totalMessagesInResolved) {
          botResolutionMap[botId].totalMessagesInResolved = 0;
        }
        botResolutionMap[botId].totalMessagesInResolved += messageCount;
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
          totalConversations: 0,
          resolvedConversations: 0,
          resolutionRate: 0,
          statusCounts: {}
        };
      }
      
      // Update time series data
      timeSeriesData[timeKey][botId].totalConversations++;
      if (isResolved) {
        timeSeriesData[timeKey][botId].resolvedConversations++;
      }
      
      // Update status counts
      const status = conv.resolution_status || "UNRESOLVED";
      if (!timeSeriesData[timeKey][botId].statusCounts[status]) {
        timeSeriesData[timeKey][botId].statusCounts[status] = 0;
      }
      timeSeriesData[timeKey][botId].statusCounts[status]++;
    });

    // Calculate final rates and averages for each bot
    Object.keys(botResolutionMap).forEach(botId => {
      const bot = botResolutionMap[botId];
      if (bot.totalConversations > 0) {
        bot.resolutionRate = (bot.resolvedConversations / bot.totalConversations) * 100;
      }
      
      if (bot.resolvedConversations > 0 && bot.totalMessagesInResolved) {
        bot.averageMessagesPerResolution = bot.totalMessagesInResolved / bot.resolvedConversations;
      }
    });

    // Calculate resolution rates for time series data
    Object.keys(timeSeriesData).forEach(timeKey => {
      Object.keys(timeSeriesData[timeKey]).forEach(botId => {
        const entry = timeSeriesData[timeKey][botId];
        if (entry.totalConversations > 0) {
          entry.resolutionRate = (entry.resolvedConversations / entry.totalConversations) * 100;
        }
      });
    });

    // Convert time series data to sorted array
    const trends = Object.entries(timeSeriesData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([timeKey, botData]) => {
        return {
          period: timeKey,
          bots: Object.values(botData)
        };
      });

    // Calculate overall metrics
    const totalConversations = conversations.length;
    const resolvedConversations = conversations.filter(conv => 
      resolvedStatuses.includes(conv.resolution_status || "")
    ).length;
    
    const overallResolutionRate = totalConversations > 0 
      ? (resolvedConversations / totalConversations) * 100 
      : 0;

    // Aggregate status breakdown
    const statusBreakdown: Record<string, number> = {};
    conversations.forEach(conv => {
      const status = conv.resolution_status || "UNRESOLVED";
      if (!statusBreakdown[status]) {
        statusBreakdown[status] = 0;
      }
      statusBreakdown[status]++;
    });

    // Calculate trend direction
    let trendDirection = "stable";
    if (trends.length >= 2) {
      const firstPeriods = trends.slice(0, Math.min(3, Math.floor(trends.length / 2)));
      const lastPeriods = trends.slice(-Math.min(3, Math.floor(trends.length / 2)));
      
      const firstAvgRate = firstPeriods.reduce((sum, period) => {
        const periodTotal = period.bots.reduce((t, bot) => t + bot.totalConversations, 0);
        const periodResolved = period.bots.reduce((r, bot) => r + bot.resolvedConversations, 0);
        return sum + (periodTotal > 0 ? (periodResolved / periodTotal) * 100 : 0);
      }, 0) / firstPeriods.length;
      
      const lastAvgRate = lastPeriods.reduce((sum, period) => {
        const periodTotal = period.bots.reduce((t, bot) => t + bot.totalConversations, 0);
        const periodResolved = period.bots.reduce((r, bot) => r + bot.resolvedConversations, 0);
        return sum + (periodTotal > 0 ? (periodResolved / periodTotal) * 100 : 0);
      }, 0) / lastPeriods.length;
      
      const difference = lastAvgRate - firstAvgRate;
      if (difference > 5) { // 5% increase
        trendDirection = "improving";
      } else if (difference < -5) { // 5% decrease
        trendDirection = "declining";
      }
    }

    return NextResponse.json({
      timeframe: {
        start: startDateTime,
        end: endDateTime,
        groupBy: timeFrame
      },
      summary: {
        totalConversations,
        resolvedConversations,
        resolutionRate: overallResolutionRate.toFixed(2),
        trendDirection,
        statusBreakdown
      },
      byBot: Object.values(botResolutionMap),
      trends
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching resolution metrics:", error);
    return NextResponse.json(
      { error: "Error fetching resolution metrics" },
      { status: 500 }
    );
  }
}

// POST: Update resolution status for a conversation
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
    const { conversationId, status, notes } = body;

    if (!conversationId || !status) {
      return NextResponse.json(
        { error: "Conversation ID and status are required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["RESOLVED", "COMPLETED", "CLOSED", "PENDING", "UNRESOLVED", "ESCALATED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Valid statuses: " + validStatuses.join(", ") },
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

    // Update conversation status
    const updatedConversation = await db.conversation.update({
      where: { id: conversationId },
      data: {
        resolution_status: status,
        // You might want to add a field for notes
        // notes: notes
      }
    });

    return NextResponse.json({
      message: "Resolution status updated successfully",
      conversation: {
        id: updatedConversation.id,
        status: updatedConversation.resolution_status
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating resolution status:", error);
    return NextResponse.json(
      { error: "Error updating resolution status" },
      { status: 500 }
    );
  }
}