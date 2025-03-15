import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Define clear interfaces for type safety
interface BotTimeEntry {
  botId: string;
  botName: string;
  totalConversations: number;
  resolvedConversations: number;
  resolutionRate: number;
  statusCounts: Record<string, number>;
}

interface TimeEntry {
  bots: Record<string, BotTimeEntry>;
}

interface BotResolutionEntry {
  botId: string;
  botName: string;
  totalConversations: number;
  resolvedConversations: number;
  resolutionRate: number;
  averageMessagesPerResolution: number;
  statusBreakdown: Record<string, number>;
  totalMessagesInResolved?: number;
}

interface TrendPeriod {
  period: string;
  bots: BotTimeEntry[];
}

const resolutionFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timeFrame: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  status: z.string().optional()
});

// GET: Get resolution rate metrics for a specific bot
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

    // Parse query parameters without validation for debugging
    const searchParams = req.nextUrl.searchParams;
    const rawStartDate = searchParams.get('startDate');
    const rawEndDate = searchParams.get('endDate');
    const rawTimeFrame = searchParams.get('timeFrame');
    const rawStatus = searchParams.get('status');
    
    console.log('Query params received:', {
      startDate: rawStartDate,
      endDate: rawEndDate,
      timeFrame: rawTimeFrame,
      status: rawStatus
    });
    
    // More lenient validation
    let startDateTime, endDateTime, timeFrame, status;
    
    // Parse dates with fallbacks
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
    
    // Parse timeFrame with fallback
    if (rawTimeFrame === 'daily' || rawTimeFrame === 'weekly' || rawTimeFrame === 'monthly') {
      timeFrame = rawTimeFrame;
    } else {
      timeFrame = 'daily';
    }
    
    // Pass through status as-is
    status = rawStatus;

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

    // Build query conditions
    const whereCondition: any = {
      bot_id: botId,
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

    // Create a bot entry for resolution metrics
    const botResolution: BotResolutionEntry = {
      botId: bot.id,
      botName: bot.bot_name,
      totalConversations: 0,
      resolvedConversations: 0,
      resolutionRate: 0,
      averageMessagesPerResolution: 0,
      statusBreakdown: {},
      totalMessagesInResolved: 0
    };

    // Time series data - ensure we have entries for each day in the date range
    const timeSeriesData: Record<string, TimeEntry> = {};
    
    // Create entries for each day in the date range
    const currentDate = new Date(startDateTime);
    while (currentDate <= endDateTime) {
      let timeKey: string;
      
      if (timeFrame === 'daily') {
        timeKey = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (timeFrame === 'weekly') {
        // Get the week number
        const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
        const days = Math.floor((currentDate.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        timeKey = `${currentDate.getFullYear()}-W${weekNumber}`;
      } else {
        // Monthly
        timeKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!timeSeriesData[timeKey]) {
        const botEntry: BotTimeEntry = {
          botId: bot.id,
          botName: bot.bot_name,
          totalConversations: 0,
          resolvedConversations: 0,
          resolutionRate: 0,
          statusCounts: {}
        };
        
        timeSeriesData[timeKey] = {
          bots: { [bot.id]: botEntry }
        };
      }
      
      // Move to next day/week/month
      if (timeFrame === 'daily') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (timeFrame === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    // Process each conversation
    conversations.forEach(conv => {
      const isResolved = resolvedStatuses.includes(conv.resolution_status || "");
      const messageCount = conv.messages.length;
      const date = new Date(conv.start_time);
      
      // Update bot stats
      botResolution.totalConversations++;
      
      // Track resolution status
      const statusKey = conv.resolution_status || "UNRESOLVED";
      if (!botResolution.statusBreakdown[statusKey]) {
        botResolution.statusBreakdown[statusKey] = 0;
      }
      botResolution.statusBreakdown[statusKey]++;
      
      // Track resolved conversations
      if (isResolved) {
        botResolution.resolvedConversations++;
        
        // Update message count for calculating average
        if (botResolution.totalMessagesInResolved !== undefined) {
          botResolution.totalMessagesInResolved += messageCount;
        }
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
      
      // Update time series data
      if (timeSeriesData[timeKey] && timeSeriesData[timeKey].bots[bot.id]) {
        const botEntry = timeSeriesData[timeKey].bots[bot.id];
        botEntry.totalConversations++;
        
        if (isResolved) {
          botEntry.resolvedConversations++;
        }
        
        // Update status counts
        const statusCountKey = conv.resolution_status || "UNRESOLVED";
        if (!botEntry.statusCounts[statusCountKey]) {
          botEntry.statusCounts[statusCountKey] = 0;
        }
        botEntry.statusCounts[statusCountKey]++;
      }
    });

    // Calculate final rates and averages
    if (botResolution.totalConversations > 0) {
      botResolution.resolutionRate = (botResolution.resolvedConversations / botResolution.totalConversations) * 100;
    }
    
    if (botResolution.resolvedConversations > 0 && botResolution.totalMessagesInResolved !== undefined && botResolution.totalMessagesInResolved > 0) {
      botResolution.averageMessagesPerResolution = botResolution.totalMessagesInResolved / botResolution.resolvedConversations;
    }

    // Calculate resolution rates for time series data
    Object.keys(timeSeriesData).forEach(timeKey => {
      const entry = timeSeriesData[timeKey].bots[bot.id];
      if (entry.totalConversations > 0) {
        entry.resolutionRate = (entry.resolvedConversations / entry.totalConversations) * 100;
      }
    });

    // Convert time series data to sorted array
    const trends: TrendPeriod[] = Object.entries(timeSeriesData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([timeKey, data]) => {
        return {
          period: timeKey,
          bots: Object.values(data.bots)
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
      bot: {
        id: bot.id,
        name: bot.bot_name
      },
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