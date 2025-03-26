import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const sessionVolumeQuerySchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  groupBy: z.enum(['day', 'week', 'month']).optional().default('day')
});

// GET: Fetch session volume data for a specific bot
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

    // Check if user is an admin
    const isAdmin = user.role === 'ADMIN';
    console.log(`User ${user.email} has admin status: ${isAdmin}`);

    // Parse and validate query parameters
    const url = new URL(req.url);
    const validated = sessionVolumeQuerySchema.safeParse({
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

    // If admin, skip bot ownership check
    let bot;
    
    if (isAdmin) {
      console.log('Admin access - skipping ownership check');
      // Admin can access any bot
      bot = await db.bot.findFirst({
        where: { id: botId },
        select: {
          id: true,
          bot_name: true,
          model_type: true,
          creator_id: true
        }
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
        },
        select: {
          id: true,
          bot_name: true,
          model_type: true
        }
      });
    }

    if (!bot) {
      return NextResponse.json(
        { error: "Bot not found or unauthorized" },
        { status: 404 }
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
      select: {
        id: true,
        start_time: true,
        end_time: true,
        minutes: true,
        _count: {
          select: { messages: true }
        }
      }
    });

    // Total number of conversations
    const totalSessions = conversations.length;
    
    // Calculate average conversation duration in minutes
    const sessionsWithDuration = conversations.filter(conv => conv.minutes !== null);
    const totalDuration = sessionsWithDuration.reduce((sum, conv) => sum + (conv.minutes || 0), 0);
    const averageDurationMinutes = sessionsWithDuration.length > 0 
      ? totalDuration / sessionsWithDuration.length 
      : 0;
    
    // Calculate average messages per conversation
    const totalMessages = conversations.reduce((sum, conv) => sum + conv._count.messages, 0);
    const averageMessagesPerSession = totalSessions > 0 ? totalMessages / totalSessions : 0;
    
    // Group sessions by time period
    const timeSeriesData = groupSessionsByTime(conversations, groupBy, startDateTime, endDateTime);
    
    // Calculate user engagement rate (percentage of conversations with more than 3 messages)
    const engagingConversations = conversations.filter(conv => conv._count.messages > 3).length;
    const engagementRate = totalSessions > 0 ? (engagingConversations / totalSessions) * 100 : 0;

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

    // Format response with summary and time series data
    return NextResponse.json({
      summary: {
        totalSessions,
        averageDurationMinutes,
        averageMessagesPerSession,
        totalMessages,
        engagementRate
      },
      timeSeriesData,
      bot: botInfo
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching session volume data:", error);
    return NextResponse.json(
      { error: "Error fetching session volume data" },
      { status: 500 }
    );
  }
}

// Helper function to group sessions by time period
function groupSessionsByTime(
  conversations: Array<{ 
    id: string; 
    start_time: Date; 
    end_time: Date | null; 
    minutes: number | null;
    _count: { messages: number } 
  }>,
  groupBy: 'day' | 'week' | 'month',
  startDate: Date,
  endDate: Date
) {
  // Create empty buckets for the time series
  const timeBuckets = generateTimeBuckets(startDate, endDate, groupBy);
  
  // Group sessions into buckets
  const groupedData: Record<string, { 
    count: number;
    totalDuration: number;
    totalMessages: number;
  }> = {};
  
  // Initialize all buckets with zero values
  timeBuckets.forEach(bucket => {
    groupedData[bucket.key] = {
      count: 0,
      totalDuration: 0,
      totalMessages: 0
    };
  });
  
  // Fill buckets with session data
  conversations.forEach(conv => {
    const date = conv.start_time;
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
    
    if (groupedData[bucketKey]) {
      groupedData[bucketKey].count += 1;
      groupedData[bucketKey].totalDuration += conv.minutes || 0;
      groupedData[bucketKey].totalMessages += conv._count.messages;
    }
  });
  
  // Format data for response
  return timeBuckets.map(bucket => {
    const data = groupedData[bucket.key] || { count: 0, totalDuration: 0, totalMessages: 0 };
    
    return {
      period: bucket.label,
      sessionCount: data.count,
      averageDuration: data.count > 0 ? data.totalDuration / data.count : 0,
      messagesCount: data.totalMessages,
      averageMessages: data.count > 0 ? data.totalMessages / data.count : 0
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