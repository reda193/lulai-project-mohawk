// File: app/api/bot/[botId]/training/prompts/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET: Fetch bot custom prompts for training
export async function GET(
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

    // Fetch the bot's custom prompts
    const custom_prompts = await db.bot_Training.findMany({
      where: {
        bot_id: botId
      },
      select: {
        id: true,
        prompt_type: true,
        prompt_content: true,
        category: true,
        context: true,
        created_at: true,
        updated_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // For admin, add bot owner information
    if (isAdmin && (bot as any).creator) {
      const creator = (bot as any).creator;
      return NextResponse.json({ 
        custom_prompts,
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

    return NextResponse.json({ custom_prompts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching custom prompts:", error);
    return NextResponse.json(
      { error: "Error fetching custom prompts" },
      { status: 500 }
    );
  }
}

// POST: Create/Update bot custom prompts
export async function POST(
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

    // Parse the request body
    const body = await req.json();
    
    // Validate the request body
    if (!Array.isArray(body.custom_prompts)) {
      return NextResponse.json(
        { error: "Custom prompts must be an array" },
        { status: 400 }
      );
    }

    // Delete existing prompts for this bot (if requested)
    if (body.replace_all === true) {
      await db.bot_Training.deleteMany({
        where: { bot_id: botId }
      });
    }

    // Process each prompt in the array
    const results = [];

    for (const prompt of body.custom_prompts) {
      // Validate each prompt
      if (!prompt.prompt_type || !prompt.prompt_content) {
        continue; // Skip invalid prompts
      }

      // Update existing or create new prompt
      if (prompt.id) {
        // First check if this prompt belongs to this bot
        const existingPrompt = await db.bot_Training.findFirst({
          where: {
            id: prompt.id,
            bot_id: botId
          }
        });

        if (existingPrompt) {
          // Update existing prompt
          const updated = await db.bot_Training.update({
            where: { id: prompt.id },
            data: {
              prompt_type: prompt.prompt_type,
              prompt_content: prompt.prompt_content,
              category: prompt.category || null,
              context: prompt.context || null
            }
          });
          results.push(updated);
        } else {
          // ID doesn't match this bot, create new
          const created = await db.bot_Training.create({
            data: {
              bot_id: botId,
              prompt_type: prompt.prompt_type,
              prompt_content: prompt.prompt_content,
              category: prompt.category || null,
              context: prompt.context || null
            }
          });
          results.push(created);
        }
      } else {
        // Create new prompt
        const created = await db.bot_Training.create({
          data: {
            bot_id: botId,
            prompt_type: prompt.prompt_type,
            prompt_content: prompt.prompt_content,
            category: prompt.category || null,
            context: prompt.context || null
          }
        });
        results.push(created);
      }
    }

    // For admin, add bot owner information
    if (isAdmin && (bot as any).creator) {
      const creator = (bot as any).creator;
      return NextResponse.json({ 
        custom_prompts: results,
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

    return NextResponse.json({ custom_prompts: results }, { status: 200 });
  } catch (error) {
    console.error("Error updating custom prompts:", error);
    return NextResponse.json(
      { error: "Error updating custom prompts" },
      { status: 500 }
    );
  }
}

// DELETE: Remove specific prompt
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

    // Parse URL to get prompt ID
    const url = new URL(req.url);
    const promptId = url.searchParams.get("promptId");
    
    if (!promptId) {
      return NextResponse.json(
        { error: "Prompt ID is required" },
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

    // Check if prompt exists and belongs to this bot
    const prompt = await db.bot_Training.findFirst({
      where: {
        id: parseInt(promptId),
        bot_id: botId
      }
    });

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt not found or not associated with this bot" },
        { status: 404 }
      );
    }

    // Delete the prompt
    await db.bot_Training.delete({
      where: { id: parseInt(promptId) }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting prompt:", error);
    return NextResponse.json(
      { error: "Error deleting prompt" },
      { status: 500 }
    );
  }
}