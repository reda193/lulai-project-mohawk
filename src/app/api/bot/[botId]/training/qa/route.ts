// File: app/api/bot/[botId]/training/qa/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET: Fetch bot Q&A pairs for training
export async function GET(
  req: Request,
  context: any
) {
  try {
    const params = await context.params;    
    const { botId } = params;
    
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

    // Fetch the bot's Q&A pairs
    const qa_pairs = await db.bot_QA.findMany({
      where: {
        bot_id: botId,
        is_active: true
      },
      select: {
        id: true,
        question: true,
        answer: true,
        category: true,
        created_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // For admin, add bot owner information
    if (isAdmin && (bot as any).creator) {
      const creator = (bot as any).creator;
      return NextResponse.json({ 
        training_data: qa_pairs,
        bot: {
          id: bot.id,
          name: bot.bot_name,
          owner: {
            id: creator.userId,
            email: creator.email,
            name: creator.first_name && creator.last_name 
              ? `${creator.first_name} ${creator.last_name}`
              : undefined
          }
        }
      }, { status: 200 });
    }

    return NextResponse.json({ training_data: qa_pairs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching Q&A pairs:", error);
    return NextResponse.json(
      { error: "Error fetching Q&A pairs" },
      { status: 500 }
    );
  }
}

// POST: Create/Update bot Q&A pairs
export async function POST(
  req: Request,
  context: any,
) {
  try {
    const params = await context.params;
    const { botId } = params;
    
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

    // Parse the request body
    const body = await req.json();
    
    // Validate the request body
    if (!Array.isArray(body.training_data)) {
      return NextResponse.json(
        { error: "Training data must be an array" },
        { status: 400 }
      );
    }

    // Delete existing Q&A pairs for this bot (if requested)
    if (body.replace_all === true) {
      // Soft delete by marking as inactive
      await db.bot_QA.updateMany({
        where: { bot_id: botId },
        data: { is_active: false }
      });
    }

    // Process each Q&A pair in the array
    const results = [];

    for (const qa of body.training_data) {
      // Validate each Q&A pair
      if (!qa.question || !qa.answer) {
        continue; // Skip invalid pairs
      }

      // Update existing or create new Q&A pair
      if (qa.id) {
        // First check if this Q&A pair belongs to this bot
        const existingQA = await db.bot_QA.findFirst({
          where: {
            id: qa.id,
            bot_id: botId
          }
        });

        if (existingQA) {
          // Update existing Q&A pair
          const updated = await db.bot_QA.update({
            where: { id: qa.id },
            data: {
              question: qa.question,
              answer: qa.answer,
              category: qa.category || null,
              is_active: true
            }
          });
          results.push(updated);
        } else {
          // ID doesn't match this bot, create new
          const created = await db.bot_QA.create({
            data: {
              bot_id: botId,
              question: qa.question,
              answer: qa.answer,
              category: qa.category || null,
              is_active: true
            }
          });
          results.push(created);
        }
      } else {
        // Create new Q&A pair
        const created = await db.bot_QA.create({
          data: {
            bot_id: botId,
            question: qa.question,
            answer: qa.answer,
            category: qa.category || null,
            is_active: true
          }
        });
        results.push(created);
      }
    }

    // For admin, add bot owner information
    if (isAdmin && (bot as any).creator) {
      const creator = (bot as any).creator;
      return NextResponse.json({ 
        training_data: results,
        bot: {
          id: bot.id,
          name: bot.bot_name,
          owner: {
            id: creator.userId,
            email: creator.email,
            name: creator.first_name && creator.last_name 
              ? `${creator.first_name} ${creator.last_name}`
              : undefined
          }
        }
      }, { status: 200 });
    }

    return NextResponse.json({ training_data: results }, { status: 200 });
  } catch (error) {
    console.error("Error updating Q&A pairs:", error);
    return NextResponse.json(
      { error: "Error updating Q&A pairs" },
      { status: 500 }
    );
  }
}

// DELETE: Remove specific Q&A pair
export async function DELETE(
  req: Request,
  context: any,
) {
  try {
    const params = await context.params;
    const { botId } = params;
    
    if (!botId) {
      return NextResponse.json(
        { error: "Bot ID is required" },
        { status: 400 }
      );
    }

    // Parse URL to get Q&A pair ID
    const url = new URL(req.url);
    const qaId = url.searchParams.get("qaId");
    
    if (!qaId) {
      return NextResponse.json(
        { error: "Q&A pair ID is required" },
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

    // Check if Q&A pair exists and belongs to this bot
    const qa = await db.bot_QA.findFirst({
      where: {
        id: qaId,
        bot_id: botId
      }
    });

    if (!qa) {
      return NextResponse.json(
        { error: "Q&A pair not found or not associated with this bot" },
        { status: 404 }
      );
    }

    // Soft delete the Q&A pair by marking as inactive
    await db.bot_QA.update({
      where: { id: qaId },
      data: { is_active: false }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting Q&A pair:", error);
    return NextResponse.json(
      { error: "Error deleting Q&A pair" },
      { status: 500 }
    );
  }
}