import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const responseTimeQuerySchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  groupBy: z.enum(['day', 'week', 'month']).optional().default('day')
});

// GET: Fetch average response time data for a specific bot
export async function GET(
  req: Request,
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

    // Authenticate the user
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

    // IMPORTANT: Check if user is an admin first
    const isAdmin = user.role === 'ADMIN';
    console.log(`User ${user.email} has admin status: ${isAdmin}`);

    // Parse and validate query parameters
    const url = new URL(req.url);
    const validated = responseTimeQuerySchema.safeParse({
      startDate: url.searchParams.get('startDate') || '',
      endDate: url.searchParams.get('endDate') || '',
      groupBy: url.searchParams.get('groupBy') || 'day'
    });

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validated.error.format() },
        { status: 400 }
      );
    }

    const { startDate, endDate, groupBy } = validated.data;
    
    // Parse dates
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    // Check if user has access to the requested bot
    let bot;
    let ownerInfo = null;
    
    if (isAdmin) {
      console.log('Admin access - skipping ownership check');
      // Admin can access any bot
      bot = await db.bot.findUnique({
        where: { id: botId },
        select: {
          id: true,
          bot_name: true,
          model_type: true,
          creator_id: true
        }
      });
      
      // For admin view, get creator info
      if (bot) {
        const creator = await db.user.findUnique({
          where: { userId: bot.creator_id },
          select: {
            userId: true,
            email: true,
            first_name: true,
            last_name: true
          }
        });
        
        if (creator) {
          ownerInfo = {
            id: creator.userId,
            email: creator.email,
            name: creator.first_name && creator.last_name 
              ? `${creator.first_name} ${creator.last_name}` 
              : creator.email
          };
        }
      }
    } else {
      console.log('Regular user access - checking ownership');
      // Regular users can only access their own bots
      bot = await db.bot.findFirst({
        where: {
          id: botId,
          creator_id: user.userId
        },
        select: {
          id: true,
          bot_name: true,
          model_type: true,
          creator_id: true  // Always include creator_id in the selection
        }
      });
    }

    if (!bot) {
      return NextResponse.json(
        { error: "Bot not found or unauthorized" },
        { status: isAdmin ? 404 : 403 }
      );
    }

    // Get conversations for this bot in the date range
    const conversations = await db.conversation.findMany({
      where: {
        bot_id: botId,
        start_time: {
          gte: startDateTime,
          lte: endDateTime
        }
      },
      include: {
        messages: {
          where: {
            sender_type: "BOT",
            response_time: {
              not: null
            }
          },
          select: {
            sent_at: true,
            response_time: true
          }
        }
      }
    });

    // Extract all bot messages with response times
    const allMessages = conversations.flatMap(conv => conv.messages);
    const totalMessages = allMessages.length;
    
    // Calculate overall average response time
    const totalResponseTimeMs = allMessages.reduce((sum, msg) => sum + (msg.response_time || 0), 0);
    const averageResponseTimeMs = totalMessages > 0 ? totalResponseTimeMs / totalMessages : 0;
    
    // Calculate min and max response times
    const minResponseTimeMs = totalMessages > 0 ? Math.min(...allMessages.map(msg => msg.response_time || 0)) : 0;
    const maxResponseTimeMs = totalMessages > 0 ? Math.max(...allMessages.map(msg => msg.response_time || 0)) : 0;
    
    // Group response times by the specified interval (day, week, month)
    const timeSeriesData = groupMessagesByTime(allMessages, groupBy, startDateTime, endDateTime);

    // Create bot info object
    const botInfo = {
      id: bot.id,
      name: bot.bot_name,
      modelType: bot.model_type,
      userId: bot.creator_id,  // Always include the userId (creator_id) in the response
      ...(ownerInfo ? { owner: ownerInfo } : {})
    };

    // Format response to match CSAT response structure
    return NextResponse.json({
      summary: {
        totalMessages,
        averageResponseTimeMs,
        averageResponseTimeSec: averageResponseTimeMs / 1000,
        minResponseTimeSec: minResponseTimeMs / 1000,
        maxResponseTimeSec: maxResponseTimeMs / 1000
      },
      timeSeriesData,
      bot: botInfo,
      timeframe: {
        start: startDateTime,
        end: endDateTime,
        groupBy
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching response time data:", error);
    return NextResponse.json(
      { error: "Error fetching response time data" },
      { status: 500 }
    );
  }
}

// Helper function to group messages by time period
function groupMessagesByTime(
  messages: Array<{ sent_at: Date, response_time: number | null }>,
  groupBy: 'day' | 'week' | 'month',
  startDate: Date,
  endDate: Date
) {
  // Create empty buckets for the time series
  const timeBuckets = generateTimeBuckets(startDate, endDate, groupBy);
  
  // Group messages into buckets
  const groupedMessages: Record<string, number[]> = {};
  
  messages.forEach(msg => {
    const date = msg.sent_at;
    let bucketKey: string;
    
    switch (groupBy) {
      case 'day':
        bucketKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        break;
      case 'week':
        // Get the Monday of the week
        const dayOfWeek = date.getDay();
        const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const monday = new Date(date);
        monday.setDate(diff);
        bucketKey = monday.toISOString().split('T')[0];
        break;
      case 'month':
        bucketKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        bucketKey = date.toISOString().split('T')[0];
    }
    
    if (!groupedMessages[bucketKey]) {
      groupedMessages[bucketKey] = [];
    }
    
    if (msg.response_time !== null) {
      groupedMessages[bucketKey].push(msg.response_time);
    }
  });
  
  // Calculate average for each bucket
  return timeBuckets.map(bucket => {
    const responseTimes = groupedMessages[bucket.key] || [];
    const avgResponseTimeMs = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : null;
    
    return {
      period: bucket.label,
      messageCount: responseTimes.length,
      averageResponseTimeMs: avgResponseTimeMs,
      averageResponseTimeSec: avgResponseTimeMs !== null ? avgResponseTimeMs / 1000 : null
    };
  });
}

// Helper function to generate time buckets
function generateTimeBuckets(
  startDate: Date, 
  endDate: Date, 
  groupBy: 'day' | 'week' | 'month'
) {
  const buckets = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    let key: string;
    let label: string;
    
    switch (groupBy) {
      case 'day':
        key = currentDate.toISOString().split('T')[0];
        label = new Date(key).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'week':
        // Get the Monday of the week
        const dayOfWeek = currentDate.getDay();
        const diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const monday = new Date(currentDate);
        monday.setDate(diff);
        
        key = monday.toISOString().split('T')[0];
        
        // Calculate Sunday
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        
        label = `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        
        // Move to next week
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'month':
        key = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        label = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
          .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        // Move to the first day of the next month
        currentDate.setMonth(currentDate.getMonth() + 1);
        currentDate.setDate(1);
        break;
      default:
        key = currentDate.toISOString().split('T')[0];
        label = key;
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    buckets.push({ key, label });
  }
  
  return buckets;
}