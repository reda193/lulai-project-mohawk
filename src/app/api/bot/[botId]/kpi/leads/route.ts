import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const leadQuerySchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  groupBy: z.enum(['day', 'week', 'month']).optional().default('day')
});

// GET: Fetch lead generation data for a specific bot
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
    const validated = leadQuerySchema.safeParse({
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
      include: {
        messages: {
          where: {
            // Filter messages that contain the word "lead" or have been tagged as leads
            // This is a simplified approach - in a real implementation you'd want to use
            // a more robust method to identify leads based on your specific criteria
            OR: [
              {
                message_text: {
                  contains: "lead",
                  mode: "insensitive"
                }
              },
              {
                // You might need to add a specific field or tag in your schema
                // to properly identify leads if you don't have one already
                message_text: {
                  contains: "interested",
                  mode: "insensitive"
                }
              }
            ]
          },
          select: {
            id: true,
            sent_at: true,
            message_text: true
          }
        }
      }
    });

    // Count conversations with lead messages
    const conversationsWithLeads = conversations.filter(conv => conv.messages.length > 0);
    const totalLeadConversations = conversationsWithLeads.length;
    
    // Count total lead messages
    const totalLeadMessages = conversationsWithLeads.reduce((sum, conv) => sum + conv.messages.length, 0);
    
    // Group lead data by time period
    const timeSeriesData = groupLeadsByTime(conversationsWithLeads, groupBy, startDateTime, endDateTime);
    
    // Calculate conversion rate (percentage of conversations that generated leads)
    const totalConversations = conversations.length;
    const conversionRate = totalConversations > 0 ? (totalLeadConversations / totalConversations) * 100 : 0;

    // Get example lead messages for analysis
    const exampleLeads = conversationsWithLeads
      .flatMap(conv => conv.messages.map(msg => ({ 
        conversationId: conv.id,
        leadText: msg.message_text,
        timestamp: msg.sent_at
      })))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) // Most recent first
      .slice(0, 10); // Limit to 10 examples

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

    return NextResponse.json({
      summary: {
        totalLeadConversations,
        totalLeadMessages,
        conversionRate,
        totalConversations
      },
      timeSeriesData,
      exampleLeads,
      bot: botInfo
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching lead generation data:", error);
    return NextResponse.json(
      { error: "Error fetching lead generation data" },
      { status: 500 }
    );
  }
}

// Helper function to group lead data by time period
function groupLeadsByTime(
  conversationsWithLeads: Array<{ 
    id: string; 
    start_time: Date;
    messages: Array<{
      id: string;
      sent_at: Date;
      message_text: string;
    }>;
  }>,
  groupBy: 'day' | 'week' | 'month',
  startDate: Date,
  endDate: Date
) {
  // Create empty buckets for the time series
  const timeBuckets = generateTimeBuckets(startDate, endDate, groupBy);
  
  // Group lead messages into buckets
  const groupedData: Record<string, { 
    conversationCount: number;
    messageCount: number;
  }> = {};
  
  // Initialize all buckets with zero values
  timeBuckets.forEach(bucket => {
    groupedData[bucket.key] = {
      conversationCount: 0,
      messageCount: 0
    };
  });
  
  // Fill buckets with lead data
  conversationsWithLeads.forEach(conv => {
    // Get the time bucket key for this conversation
    const date = conv.start_time;
    let conversationBucketKey: string;
    
    switch (groupBy) {
      case 'day':
        conversationBucketKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        break;
      case 'week':
        // Get the Monday of the week
        const dayOfWeek = date.getDay();
        const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const monday = new Date(date);
        monday.setDate(diff);
        conversationBucketKey = monday.toISOString().split('T')[0];
        break;
      case 'month':
        conversationBucketKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        conversationBucketKey = date.toISOString().split('T')[0];
    }
    
    // Increment conversation count for this bucket
    if (groupedData[conversationBucketKey]) {
      groupedData[conversationBucketKey].conversationCount += 1;
      groupedData[conversationBucketKey].messageCount += conv.messages.length;
    }
  });
  
  // Format data for response
  return timeBuckets.map(bucket => {
    const data = groupedData[bucket.key];
    
    return {
      period: bucket.label,
      leadConversations: data.conversationCount,
      leadMessages: data.messageCount
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