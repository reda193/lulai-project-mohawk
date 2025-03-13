import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const leadFilterSchema = z.object({
  botId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timeFrame: z.enum(['daily', 'weekly', 'monthly']).default('daily')
});

// GET: Get lead generation metrics
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
    const validated = leadFilterSchema.safeParse({
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
        leads: []
      }, { status: botId ? 404 : 200 });
    }

    const botIds = bots.map(bot => bot.id);

    // Get conversations in the date range
    const conversations = await db.conversation.findMany({
      where: {
        bot_id: { in: botIds },
        start_time: {
          gte: startDateTime,
          lte: endDateTime
        }
      },
      include: {
        messages: {
          select: {
            id: true,
            message_text: true,
            sent_at: true,
            sender_type: true
          }
        },
        bot: {
          select: {
            id: true,
            bot_name: true
          }
        }
      }
    });

    // Define keywords to identify leads
    const leadKeywords = ['lead', 'interest', 'purchase', 'buy', 'subscribe', 'contact', 'demo', 'trial', 'sales'];
    
    // Find lead messages
    const leadMessages = conversations.flatMap(conv => 
      conv.messages
        .filter(msg => {
          const lowerText = msg.message_text.toLowerCase();
          return leadKeywords.some(keyword => lowerText.includes(keyword));
        })
        .map(msg => ({
          messageId: msg.id,
          text: msg.message_text,
          sentAt: msg.sent_at,
          senderType: msg.sender_type,
          conversationId: conv.id,
          botId: conv.bot_id,
          botName: conv.bot.bot_name
        }))
    );

    // Group lead messages by conversation
    const leadsByConversation = leadMessages.reduce((acc, msg) => {
      if (!acc[msg.conversationId]) {
        acc[msg.conversationId] = {
          conversationId: msg.conversationId,
          botId: msg.botId,
          botName: msg.botName,
          messages: [],
          firstLead: msg.sentAt,
          isQualified: false
        };
      }
      
      acc[msg.conversationId].messages.push({
        messageId: msg.messageId,
        text: msg.text,
        sentAt: msg.sentAt,
        senderType: msg.senderType
      });
      
      // Update first lead time if this message is earlier
      if (new Date(msg.sentAt) < new Date(acc[msg.conversationId].firstLead)) {
        acc[msg.conversationId].firstLead = msg.sentAt;
      }
      
      // Check if this is a qualified lead (contains email or phone number)
      if (!acc[msg.conversationId].isQualified) {
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
        const phoneRegex = /(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
        
        acc[msg.conversationId].isQualified = 
          emailRegex.test(msg.text) || phoneRegex.test(msg.text);
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Convert to array
    const leadConversations = Object.values(leadsByConversation);

    // Group by bot
    const leadsByBot = botIds.reduce((acc, botId) => {
      const botLeads = leadConversations.filter(lead => lead.botId === botId);
      const qualifiedLeads = botLeads.filter(lead => lead.isQualified);
      
      acc[botId] = {
        botId,
        botName: bots.find(b => b.id === botId)?.bot_name || 'Unknown',
        totalLeads: botLeads.length,
        qualifiedLeads: qualifiedLeads.length,
        conversionRate: botLeads.length > 0 
          ? (qualifiedLeads.length / botLeads.length) * 100 
          : 0
      };
      
      return acc;
    }, {} as Record<string, any>);

    // Group by time period for trends
    interface LeadTimeEntry {
      botId: string;
      botName: string;
      totalLeads: number;
      qualifiedLeads: number;
    }

    const timeSeriesData: Record<string, Record<string, LeadTimeEntry>> = {};

    leadConversations.forEach(lead => {
      const date = new Date(lead.firstLead);
      
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
      
      if (!timeSeriesData[timeKey][lead.botId]) {
        timeSeriesData[timeKey][lead.botId] = {
          botId: lead.botId,
          botName: lead.botName,
          totalLeads: 0,
          qualifiedLeads: 0
        };
      }
      
      // Update time series data
      timeSeriesData[timeKey][lead.botId].totalLeads++;
      if (lead.isQualified) {
        timeSeriesData[timeKey][lead.botId].qualifiedLeads++;
      }
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
    const totalLeads = leadConversations.length;
    const qualifiedLeads = leadConversations.filter(lead => lead.isQualified).length;
    const overallConversionRate = totalLeads > 0 
      ? (qualifiedLeads / totalLeads) * 100 
      : 0;

    // Calculate trend direction
    let trendDirection = "stable";
    if (trends.length >= 2) {
      const firstPeriod = trends[0];
      const lastPeriod = trends[trends.length - 1];
      
      const firstTotal = firstPeriod.bots.reduce((sum, bot) => sum + bot.totalLeads, 0);
      const lastTotal = lastPeriod.bots.reduce((sum, bot) => sum + bot.totalLeads, 0);
      
      if (lastTotal > firstTotal * 1.2) { // 20% increase
        trendDirection = "increasing";
      } else if (lastTotal < firstTotal * 0.8) { // 20% decrease
        trendDirection = "decreasing";
      }
    }

    return NextResponse.json({
      timeframe: {
        start: startDateTime,
        end: endDateTime,
        groupBy: timeFrame
      },
      summary: {
        totalLeads,
        qualifiedLeads,
        conversionRate: overallConversionRate.toFixed(2),
        trendDirection
      },
      byBot: Object.values(leadsByBot),
      trends,
      recent: leadConversations
        .sort((a, b) => new Date(b.firstLead).getTime() - new Date(a.firstLead).getTime())
        .slice(0, 10)
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching lead generation metrics:", error);
    return NextResponse.json(
      { error: "Error fetching lead generation metrics" },
      { status: 500 }
    );
  }
}

// POST: Mark a conversation as a qualified lead
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
    const { conversationId, isQualified = true, notes } = body;

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
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

    // Update conversation to mark as lead
    const updatedConversation = await db.conversation.update({
      where: { id: conversationId },
      data: {
        // Add a custom field or tag to mark this as a lead
        // This would require extending your schema
        resolution_status: isQualified ? "QUALIFIED_LEAD" : "LEAD",
        // You might want to add a field for lead notes
      }
    });

    return NextResponse.json({
      message: `Conversation marked as ${isQualified ? 'qualified' : ''} lead successfully`,
      conversation: {
        id: updatedConversation.id,
        status: updatedConversation.resolution_status
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error marking lead:", error);
    return NextResponse.json(
      { error: "Error marking lead" },
      { status: 500 }
    );
  }
}