import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET: Get knowledge base utilization metrics for a specific bot
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

    // Check if user is an admin
    const isAdmin = user.role === 'ADMIN';
    console.log(`User ${user.email} has admin status: ${isAdmin}`);
    
    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const rawStartDate = searchParams.get('startDate');
    const rawEndDate = searchParams.get('endDate');
    
    // Parse dates with fallbacks
    let startDateTime, endDateTime;
    
    try {
      startDateTime = rawStartDate ? new Date(rawStartDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (isNaN(startDateTime.getTime())) {
        startDateTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      }
    } catch (e) {
      startDateTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }
    
    try {
      endDateTime = rawEndDate ? new Date(rawEndDate) : new Date();
      if (isNaN(endDateTime.getTime())) {
        endDateTime = new Date();
      }
    } catch (e) {
      endDateTime = new Date();
    }

    // If admin, skip bot ownership check
    let bot;
    
    if (isAdmin) {
      console.log('Admin access - skipping ownership check');
      // Admin can access any bot
      bot = await db.bot.findFirst({
        where: { id: botId }
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

    // Get all BOT messages in the date range
    const botMessages = await db.conv_Messages.findMany({
      where: {
        conversation: {
          bot_id: botId,
          start_time: {
            gte: startDateTime,
            lte: endDateTime
          }
        },
        sender_type: "BOT" // Only bot messages
      },
      include: {
        knowledge_queries: true
      }
    });

    // Calculate Knowledge Base Utilization (KBU) metric
    const totalBotResponses = botMessages.length;
    const responsesUsingKB = botMessages.filter(msg => 
      msg.used_knowledge_base || (msg.knowledge_queries && msg.knowledge_queries.length > 0)
    ).length;
    
    // Apply the formula: KBU = (Responses using Knowledge Base / Total Responses) × 100
    const kbUtilizationPercentage = totalBotResponses > 0 
      ? Math.round((responsesUsingKB / totalBotResponses) * 100)
      : 0;

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
      timeframe: {
        start: startDateTime,
        end: endDateTime
      },
      summary: {
        totalBotResponses,
        responsesUsingKB,
        kbUtilizationPercentage
      },
      bot: botInfo
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching knowledge base metrics:", error);
    return NextResponse.json(
      { error: "Error fetching knowledge base metrics" },
      { status: 500 }
    );
  }
}