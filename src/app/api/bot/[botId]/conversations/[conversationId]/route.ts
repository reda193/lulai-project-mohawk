import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET: Fetch single conversation with messages
export async function GET(
  req: Request,
  context: any,
) {
  try {
    // Get the bot ID and conversation ID from the route parameters
    const params = await context.params;
    const { botId, conversationId } = params;
    console.log('CONVERSATION ID', conversationId);
    if (!botId || !conversationId) {
      return NextResponse.json(
        { error: "Both Bot ID and Conversation ID are required" },
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
        }
      });
    }

    if (!bot) {
      return NextResponse.json(
        { error: "Bot not found or unauthorized" },
        { status: 404 }
      );
    }

    // Fetch the conversation
    const conversation = await db.conversation.findUnique({
      where: {
        id: conversationId,
        bot_id: botId // Ensure it belongs to the specified bot
      },
      select: {
        id: true,
        start_time: true,
        end_time: true,
        escalated: true,
        resolution_status: true,
        sentiment_score: true,
        messages: {
          orderBy: {
            sent_at: 'asc' // Get messages in chronological order
          },
          select: {
            id: true,
            sender_type: true,
            message_text: true,
            sent_at: true,
            response_time: true,
            used_knowledge_base: true
          }
        },
        csat: {
          select: {
            rating_score: true,
            feedback_at: true
          }
        }
      }
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Get the first user message to extract user info
    const firstUserMessage = conversation.messages.find(msg => msg.sender_type === 'USER');
    
    // Determine conversation status
    let displayStatus: 'active' | 'resolved' | 'pending' | 'escalated' = 'active';
    
    if (conversation.escalated) {
      displayStatus = 'escalated';
    } else if (conversation.resolution_status === 'RESOLVED' || conversation.resolution_status === 'COMPLETED') {
      displayStatus = 'resolved';
    } else if (!conversation.end_time) {
      displayStatus = 'active';
    } else {
      displayStatus = 'pending';
    }
    
    // Extract a generic user name from the first message
    const userName = extractUserName(firstUserMessage?.message_text || "Anonymous User");
    
    // Format messages for response
    const formattedMessages = conversation.messages.map(msg => ({
      id: msg.id,
      sender: msg.sender_type.toLowerCase() === 'user' ? 'user' : 'bot',
      text: msg.message_text,
      timestamp: msg.sent_at,
      ...(msg.sender_type.toLowerCase() === 'user' && { status: 'read' }) // Add status for user messages
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
    
    // Format the response
    const formattedConversation = {
      id: conversation.id,
      user: {
        name: userName,
        id: `user-${conversation.id}`, // In a real app, you'd have a proper user ID
        avatar: undefined // No avatars in the database schema
      },
      lastMessage: {
        text: formattedMessages.length > 0 ? formattedMessages[formattedMessages.length - 1].text : "",
        timestamp: formattedMessages.length > 0 ? formattedMessages[formattedMessages.length - 1].timestamp : conversation.start_time
      },
      status: displayStatus,
      startTime: conversation.start_time,
      endTime: conversation.end_time,
      escalated: conversation.escalated,
      sentimentScore: conversation.sentiment_score,
      csatRating: conversation.csat.length > 0 ? conversation.csat[0].rating_score : null,
      messages: formattedMessages,
      bot: botInfo
    };

    return NextResponse.json(formattedConversation, { status: 200 });
  } catch (error) {
    console.error("Error fetching conversation details:", error);
    return NextResponse.json(
      { error: "Error fetching conversation details" },
      { status: 500 }
    );
  }
}

// POST: Reply to a conversation
export async function POST(
  req: Request,
  context: any,
) {
  try {
    
    const params = await context.params;
    const { botId, conversationId } = params;
    
    if (!botId || !conversationId) {
      return NextResponse.json(
        { error: "Both Bot ID and Conversation ID are required" },
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
        where: { id: botId }
      });
    } else {
      console.log('Regular user access - checking ownership');
      // Regular users can only access their own bots
      bot = await db.bot.findFirst({
        where: {
          id: botId,
          creator_id: user.userId
        }
      });
    }

    if (!bot) {
      return NextResponse.json(
        { error: "Bot not found or unauthorized" },
        { status: 404 }
      );
    }

    // Validate request body
    const body = await req.json();
    
    if (!body.message || typeof body.message !== 'string' || body.message.trim() === '') {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Check if conversation exists and belongs to the bot
    const conversation = await db.conversation.findUnique({
      where: {
        id: conversationId,
        bot_id: botId
      }
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Add message to the conversation
    const message = await db.conv_Messages.create({
      data: {
        conversation_id: conversationId,
        sender_type: 'AGENT', // This is from an agent/admin, not the bot or user
        message_text: body.message,
        sent_at: new Date()
      }
    });

    // If conversation was previously ended, reactivate it 
    if (conversation.end_time || conversation.resolution_status === 'RESOLVED') {
      await db.conversation.update({
        where: { id: conversationId },
        data: {
          end_time: null,
          resolution_status: 'REOPENED'
        }
      });
    }

    return NextResponse.json({
      id: message.id,
      conversationId: message.conversation_id,
      text: message.message_text,
      sender: 'bot', // We return 'bot' to match your frontend expectation (even though it's an agent reply)
      timestamp: message.sent_at
    }, { status: 201 });
  } catch (error) {
    console.error("Error adding reply:", error);
    return NextResponse.json(
      { error: "Error adding reply" },
      { status: 500 }
    );
  }
}

// PATCH: Update conversation status
export async function PATCH(
  req: Request,
  context: any,
) {
  try {

    const params = await context.params;
    const { botId, conversationId } = params;
    
    if (!botId || !conversationId) {
      return NextResponse.json(
        { error: "Both Bot ID and Conversation ID are required" },
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
        where: { id: botId }
      });
    } else {
      console.log('Regular user access - checking ownership');
      // Regular users can only access their own bots
      bot = await db.bot.findFirst({
        where: {
          id: botId,
          creator_id: user.userId
        }
      });
    }

    if (!bot) {
      return NextResponse.json(
        { error: "Bot not found or unauthorized" },
        { status: 404 }
      );
    }

    // Validate request body
    const body = await req.json();
    
    if (!body.status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Map frontend status to database status
    let updateData: any = {};
    
    switch (body.status) {
      case 'resolved':
        updateData = {
          resolution_status: 'RESOLVED',
          end_time: new Date()
        };
        break;
      case 'escalated':
        updateData = {
          escalated: true
        };
        break;
      case 'active':
        updateData = {
          resolution_status: 'ACTIVE',
          end_time: null
        };
        break;
      case 'pending':
        updateData = {
          resolution_status: 'PENDING'
        };
        break;
      default:
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
    }

    // Update the conversation
    const updatedConversation = await db.conversation.update({
      where: {
        id: conversationId,
        bot_id: botId
      },
      data: updateData
    });

    return NextResponse.json({
      id: updatedConversation.id,
      status: body.status
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating conversation status:", error);
    return NextResponse.json(
      { error: "Error updating conversation status" },
      { status: 500 }
    );
  }
}

// Helper function to extract a user name from message
function extractUserName(message: string): string {
  // This is a very basic implementation
  
  // Try to extract a name from the message (very naive approach)
  const nameMatch = message.match(/(?:I am|My name is|This is) ([A-Z][a-z]+ [A-Z][a-z]+)/);
  if (nameMatch && nameMatch[1]) {
    return nameMatch[1];
  }
  
  // Return a default name with a random ID to differentiate users
  return `User ${Math.floor(Math.random() * 1000) + 1}`;
}