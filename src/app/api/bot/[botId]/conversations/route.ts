import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const conversationsQuerySchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().int().positive().optional().default(20),
  page: z.number().int().min(1).optional().default(1)
});

// GET: Fetch conversations for a specific bot
export async function GET(
  req: Request,
  context: any
) {
  console.log("POST request received for bot training creation");
  try {
  // Correctly await params
  const params = await context.params;
  const botId = params.botId;
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

    // Parse and validate query parameters
    const url = new URL(req.url);
    const validated = conversationsQuerySchema.safeParse({
      status: url.searchParams.get('status') || undefined,
      search: url.searchParams.get('search') || undefined,
      limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit') as string) : 20,
      page: url.searchParams.get('page') ? parseInt(url.searchParams.get('page') as string) : 1
    });

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validated.error.format() },
        { status: 400 }
      );
    }

    const { status, search, limit, page } = validated.data;
    
    // Build the where clause for filtering
    const where: any = {
      bot_id: botId
    };
    
    // Add status filter if provided
    if (status && status !== 'all') {
      where.resolution_status = status;
    }
    
    // Add search filter if provided
    if (search) {
      where.messages = {
        some: {
          message_text: {
            contains: search,
            mode: 'insensitive'
          }
        }
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalCount = await db.conversation.count({
      where
    });
    
    // Fetch conversations with latest message
    const conversations = await db.conversation.findMany({
      where,
      orderBy: {
        start_time: 'desc'
      },
      skip,
      take: limit,
      select: {
        id: true,
        start_time: true,
        end_time: true,
        escalated: true,
        resolution_status: true,
        sentiment_score: true,
        messages: {
          orderBy: {
            sent_at: 'desc'
          },
          take: 1,
          select: {
            id: true,
            message_text: true,
            sent_at: true,
            sender_type: true
          }
        }
      }
    });
    
    // Format conversations for response
    const formattedConversations = await Promise.all(conversations.map(async (conv) => {
      // Get user information from the first user message
      const firstUserMessage = await db.conv_Messages.findFirst({
        where: {
          conversation_id: conv.id,
          sender_type: 'USER'
        },
        orderBy: {
          sent_at: 'asc'
        },
        select: {
          message_text: true,
          sent_at: true
        }
      });
      
      // Get last message
      const lastMessage = conv.messages.length > 0 ? conv.messages[0] : null;
      
      // Determine status for display
      let displayStatus: 'active' | 'resolved' | 'pending' | 'escalated' = 'active';
      
      if (conv.escalated) {
        displayStatus = 'escalated';
      } else if (conv.resolution_status === 'RESOLVED' || conv.resolution_status === 'COMPLETED') {
        displayStatus = 'resolved';
      } else if (!conv.end_time) {
        displayStatus = 'active';
      } else {
        displayStatus = 'pending';
      }
      
      // Extract a generic "user name" from the first message if possible
      // In a real scenario, you'd have a better way to get the user info
      const userName = extractUserName(firstUserMessage?.message_text || "Anonymous User");
      
      return {
        id: conv.id,
        user: {
          name: userName,
          id: `user-${conv.id}`, // In a real app, you'd have a proper user ID
          avatar: undefined // No avatars in the database schema
        },
        lastMessage: {
          text: lastMessage?.message_text || "",
          timestamp: lastMessage?.sent_at || conv.start_time
        },
        status: displayStatus,
        startTime: conv.start_time,
        endTime: conv.end_time,
        escalated: conv.escalated,
        sentimentScore: conv.sentiment_score
      };
    }));

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
      conversations: formattedConversations,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      },
      bot: botInfo
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Error fetching conversations" },
      { status: 500 }
    );
  }
}

// Helper function to extract a user name from message
function extractUserName(message: string): string {
  // This is a very basic implementation
  // In a real app, you'd have a proper way to get user info
  
  // Try to extract a name from the message (very naive approach)
  const nameMatch = message.match(/(?:I am|My name is|This is) ([A-Z][a-z]+ [A-Z][a-z]+)/);
  if (nameMatch && nameMatch[1]) {
    return nameMatch[1];
  }
  
  // Return a default name with a random ID to differentiate users
  return `User ${Math.floor(Math.random() * 1000) + 1}`;
}