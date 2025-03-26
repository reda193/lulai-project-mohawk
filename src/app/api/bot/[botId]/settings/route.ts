// File: app/api/bot/[botId]/settings/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET: Fetch bot general settings
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
          description: true,
          purpose: true,
          company_size: true,
          company_type: true,
          use_case_category: true,
          use_case_description: true,
          target_audience: true,
          privacy_level: true,
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
          description: true,
          purpose: true,
          company_size: true,
          company_type: true,
          use_case_category: true,
          use_case_description: true,
          target_audience: true,
          privacy_level: true,
          model_type: true,
        }
      });
    }

    if (!bot) {
      return NextResponse.json(
        { error: "Bot not found or unauthorized" },
        { status: 404 }
      );
    }

    // For admin, add owner information in the response
    if (isAdmin && (bot as any).creator) {
      const creator = (bot as any).creator;
      const botResponse = {
        ...bot,
        owner: {
          id: creator.userId,
          email: creator.email,
          name: creator.first_name && creator.last_name 
            ? `${creator.first_name} ${creator.last_name}`
            : undefined
        }
      };
      

      
      return NextResponse.json(botResponse, { status: 200 });
    }

    return NextResponse.json(bot, { status: 200 });
  } catch (error) {
    console.error("Error fetching bot settings:", error);
    return NextResponse.json(
      { error: "Error fetching bot settings" },
      { status: 500 }
    );
  }
}

// PATCH: Update bot general settings
export async function PATCH(
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

    // Parse the request body
    const body = await req.json();
    
    // Validate required fields
    if (!body.bot_name || body.bot_name.trim() === '') {
      return NextResponse.json(
        { error: "Bot name is required" },
        { status: 400 }
      );
    }

    // Create an object with only the fields we want to update
    const updateData: any = {};
    
    // Only add fields that are present in the request
    if (body.bot_name !== undefined) updateData.bot_name = body.bot_name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.purpose !== undefined) updateData.purpose = body.purpose;
    if (body.company_size !== undefined) updateData.company_size = body.company_size;
    if (body.company_type !== undefined) updateData.company_type = body.company_type;
    if (body.use_case_category !== undefined) updateData.use_case_category = body.use_case_category;
    if (body.use_case_description !== undefined) updateData.use_case_description = body.use_case_description;
    if (body.target_audience !== undefined) updateData.target_audience = body.target_audience;
    if (body.privacy_level !== undefined) updateData.privacy_level = body.privacy_level;
    if (body.model_type !== undefined) updateData.model_type = body.model_type;

    // Update the bot settings
    const updatedBot = await db.bot.update({
      where: { id: botId },
      data: updateData,
      select: {
        id: true,
        bot_name: true,
        description: true,
        purpose: true,
        company_size: true,
        company_type: true,
        use_case_category: true,
        use_case_description: true,
        target_audience: true,
        privacy_level: true,
        model_type: true,
        creator_id: true
      }
    });

    // For admin responses, include owner information
    if (isAdmin) {
      const creator = await db.user.findUnique({
        where: { userId: updatedBot.creator_id },
        select: {
          userId: true,
          email: true,
          first_name: true,
          last_name: true
        }
      });
      
      if (creator) {
        const responseBot = {
          ...updatedBot,
          owner: {
            id: creator.userId,
            email: creator.email,
            name: creator.first_name && creator.last_name 
              ? `${creator.first_name} ${creator.last_name}`
              : undefined
          }
        };
        
        return NextResponse.json(responseBot, { status: 200 });
      }
    }

    // Remove creator_id from regular response
    delete (updatedBot as any).creator_id;
    return NextResponse.json(updatedBot, { status: 200 });
  } catch (error) {
    console.error("Error updating bot settings:", error);
    return NextResponse.json(
      { error: "Error updating bot settings" },
      { status: 500 }
    );
  }
}