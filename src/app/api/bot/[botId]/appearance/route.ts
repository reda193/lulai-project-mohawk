// app/api/bot/[botId]/appearance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

// Define interfaces for our response types
interface OwnerInfo {
  id: string;
  email: string;
  name?: string;
}

interface AppearanceResponse {
  id: number;
  bot_id: string;
  company_logo: string | null;
  bot_avatar: string | null;
  accent_color: string | null;
  widget_icon: string | null;
  widget_position: string | null;
  input_placeholder: string | null;
  branding_enabled: boolean;
  widget_open_by_default: boolean;
  starter_questions: boolean | null;
  owner?: OwnerInfo;
}

// Appearance update schema matching Prisma model
const updateAppearanceSchema = z.object({
  company_logo: z.string().optional().nullable(),
  bot_avatar: z.string().optional().nullable(),
  accent_color: z.string().optional().nullable(),
  widget_icon: z.string().optional().nullable(),
  widget_position: z.string().optional().nullable(),
  input_placeholder: z.string().optional().nullable(),
  branding_enabled: z.boolean().optional(),
  widget_open_by_default: z.boolean().optional(),
  starter_questions: z.boolean().optional().nullable(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

// GET: Fetch bot appearance settings
export async function GET(
  req: NextRequest,
  context: any
) {
  console.log("GET request received for bot appearance");
  
  // Get the bot ID from the route parameters
  const params = await context.params;
  const botId = params.botId;
  
  if (!botId) {
    return NextResponse.json(
      { error: "Bot ID is required" },
      { status: 400 }
    );
  }

  try {
    // Authenticate the user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.email) {
      console.log("Unauthorized: No session or email");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      console.log("User not found for email:", session.user.email);
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
    let creator = null;
    
    if (isAdmin) {
      console.log('Admin access - skipping ownership check');
      // Admin can access any bot
      bot = await db.bot.findFirst({
        where: { id: botId },
        include: {
          appearance: true
        }
      });
      
      // Get creator information if needed
      if (bot) {
        creator = await db.user.findUnique({
          where: { userId: bot.creator_id },
          select: {
            userId: true,
            email: true,
            first_name: true,
            last_name: true,
            role: true
          }
        });
      }
    } else {
      console.log('Regular user access - checking ownership');
      // Regular users can only access their own bots
      bot = await db.bot.findFirst({
        where: {
          id: botId,
          creator_id: user.userId
        },
        include: {
          appearance: true
        }
      });
    }

    if (!bot) {
      console.log("Bot not found or unauthorized:", botId);
      return NextResponse.json(
        { error: "Bot not found or unauthorized" },
        { status: 404 }
      );
    }

    // Get the appearance settings
    let appearanceData;
    
    if (bot.appearance && bot.appearance.length > 0) {
      // Use existing appearance
      appearanceData = bot.appearance[0];
    } else {
      // Return default values if no appearance settings exist
      appearanceData = {
        id: 0,
        bot_id: botId,
        company_logo: null,
        bot_avatar: null,
        accent_color: null,
        widget_icon: 'message',
        widget_position: 'bottom-right',
        input_placeholder: 'Type a message...',
        branding_enabled: true,
        widget_open_by_default: false,
        starter_questions: true
      };
    }

    // Create response object with proper typing
    const responseObject: AppearanceResponse = {
      ...appearanceData
    };

    // For admin, add owner information in the response
    if (isAdmin && creator) {
      responseObject.owner = {
        id: creator.userId,
        email: creator.email,
        name: creator.first_name && creator.last_name 
          ? `${creator.first_name} ${creator.last_name}`
          : undefined
      };
    }

    console.log("Returning appearance settings for bot:", botId);
    return NextResponse.json(responseObject, { status: 200 });
  } catch (error) {
    console.error("Error fetching appearance settings:", error);
    return NextResponse.json(
      { 
        error: "Error fetching appearance settings",
        details: String(error),
        errorType: error ? error.constructor.name : 'Unknown'
      },
      { status: 500 }
    );
  }
}

// PATCH: Update bot appearance settings (for JSON data without file uploads)
export async function PATCH(
  req: NextRequest,
  context: any
) {
  console.log("PATCH request received for bot appearance update");
  
  // Get the bot ID from the route parameters
  const params = await context.params;
  const botId = params.botId;
  
  if (!botId) {
    return NextResponse.json(
      { error: "Bot ID is required" },
      { status: 400 }
    );
  }

  try {
    // Authenticate the user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.email) {
      console.log("Unauthorized: No session or email");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      console.log("User not found for email:", session.user.email);
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
    let creator = null;
    
    if (isAdmin) {
      console.log('Admin access - skipping ownership check');
      // Admin can access any bot
      bot = await db.bot.findFirst({
        where: { id: botId },
        include: {
          appearance: true
        }
      });
      
      // Get creator information if needed
      if (bot) {
        creator = await db.user.findUnique({
          where: { userId: bot.creator_id },
          select: {
            userId: true,
            email: true,
            first_name: true,
            last_name: true,
            role: true
          }
        });
      }
    } else {
      console.log('Regular user access - checking ownership');
      // Regular users can only access their own bots
      bot = await db.bot.findFirst({
        where: {
          id: botId,
          creator_id: user.userId
        },
        include: {
          appearance: true
        }
      });
    }

    if (!bot) {
      console.log("Bot not found or unauthorized:", botId);
      return NextResponse.json(
        { error: "Bot not found or unauthorized" },
        { status: 404 }
      );
    }

    // Parse the request body
    const body = await req.json();
    console.log("Received JSON data:", body);
    
    // Validate the data
    const validatedData = updateAppearanceSchema.safeParse(body);

    if (!validatedData.success) {
      console.log("Data validation failed:", validatedData.error.issues);
      return NextResponse.json(
        { 
          error: "Invalid data", 
          details: validatedData.error.issues 
        },
        { status: 400 }
      );
    }

    // Ensure we have data to update
    if (Object.keys(validatedData.data).length === 0) {
      console.log("No valid data to update");
      return NextResponse.json(
        { error: "No valid data provided for update" },
        { status: 400 }
      );
    }

    // Update or create appearance record
    let updatedAppearance;
    
    try {
      if (bot.appearance && bot.appearance.length > 0) {
        // Update existing appearance
        updatedAppearance = await db.bot_Appearance.update({
          where: { bot_id: botId },
          data: validatedData.data
        });
      } else {
        // Create new appearance record
        updatedAppearance = await db.bot_Appearance.create({
          data: {
            bot_id: botId,
            ...validatedData.data
          }
        });
      }

      // Create response object with proper typing
      const responseObject: AppearanceResponse = {
        ...updatedAppearance
      };

      // For admin, add owner information in the response
      if (isAdmin && creator) {
        responseObject.owner = {
          id: creator.userId,
          email: creator.email,
          name: creator.first_name && creator.last_name 
            ? `${creator.first_name} ${creator.last_name}`
            : undefined
        };
      }

      console.log("Successfully updated appearance for bot:", botId);
      return NextResponse.json(responseObject, { status: 200 });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { 
          error: "Database error while updating appearance", 
          details: String(dbError)
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating appearance settings:", error);
    return NextResponse.json(
      { 
        error: "Error updating appearance settings",
        details: String(error),
        errorType: error ? error.constructor.name : 'Unknown'
      },
      { status: 500 }
    );
  }
}

// POST: Handle file uploads for appearance settings
export async function POST(
  req: NextRequest,
  context: any 
) {
  console.log("POST request received for bot appearance update");

  // Correctly await params
  const params = await context.params;
  const botId = params.botId;

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.email) {
      console.log("Unauthorized: No session or email");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("Updating appearance for bot:", botId);

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      console.log("User not found for email:", session.user.email);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is an admin
    const isAdmin = user.role === 'ADMIN';
    console.log(`User ${user.email} has admin status: ${isAdmin}`);

    // If admin, skip bot ownership check
    let existingBot;
    let creator = null;
    
    if (isAdmin) {
      console.log('Admin access - skipping ownership check');
      // Admin can access any bot
      existingBot = await db.bot.findFirst({
        where: { id: botId },
        include: {
          appearance: true
        }
      });
      
      // Get creator information if needed
      if (existingBot) {
        creator = await db.user.findUnique({
          where: { userId: existingBot.creator_id },
          select: {
            userId: true,
            email: true,
            first_name: true,
            last_name: true,
            role: true
          }
        });
      }
    } else {
      console.log('Regular user access - checking ownership');
      // Regular users can only access their own bots
      existingBot = await db.bot.findFirst({
        where: {
          id: botId,
          creator_id: user.userId
        },
        include: {
          appearance: true
        }
      });
    }

    if (!existingBot) {
      console.log("Bot not found or unauthorized:", botId);
      return NextResponse.json(
        { error: "Bot not found or unauthorized" },
        { status: 404 }
      );
    }

    // Process the request data
    const formData = await req.formData();
    console.log("Received form data keys:", Array.from(formData.keys()));

    let appearanceData: any = {};

    // Process text fields
    const textFields = [
      'accent_color', 'widget_icon', 'widget_position', 
      'input_placeholder'
    ];
    
    textFields.forEach(field => {
      const value = formData.get(field);
      console.log(`Processing text field ${field}:`, value);
      if (value !== null && value !== undefined) {
        appearanceData[field] = value.toString().trim() || null;
      }
    });

    // Process boolean fields
    const booleanFields = [
      'branding_enabled', 'widget_open_by_default', 'starter_questions'
    ];
    
    booleanFields.forEach(field => {
      const value = formData.get(field);
      console.log(`Processing boolean field ${field}:`, value);
      if (value !== null && value !== undefined) {
        // Explicitly convert to boolean
        const stringValue = value.toString().toLowerCase();
        appearanceData[field] = stringValue === 'true' || stringValue === '1';
      }
    });

    // Process file uploads
    const fileFields = ['company_logo', 'bot_avatar'];
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', botId);
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Handle file uploads
    for (const field of fileFields) {
      const file = formData.get(field) as File | null;
      console.log(`Processing file field ${field}:`, file ? `File: ${file.name}, size: ${file.size}` : 'No file');
      
      if (file && file.size > 0) {
        const uniqueFilename = `${field}_${uuidv4()}${path.extname(file.name)}`;
        const filePath = path.join(uploadDir, uniqueFilename);
        const relativePath = `/uploads/${botId}/${uniqueFilename}`;
        
        // Save file
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);
        
        // Add path to database data
        appearanceData[field] = relativePath;
      }
    }

    console.log("Appearance data to save:", appearanceData);

    // Validate the data
    const validatedData = updateAppearanceSchema.safeParse(appearanceData);

    if (!validatedData.success) {
      console.log("Data validation failed:", validatedData.error.issues);
      return NextResponse.json(
        { 
          error: "Invalid data", 
          details: validatedData.error.issues 
        },
        { status: 400 }
      );
    }

    // Ensure we have data to update
    if (Object.keys(validatedData.data).length === 0) {
      console.log("No valid data to update");
      return NextResponse.json(
        { error: "No valid data provided for update" },
        { status: 400 }
      );
    }

    // Update or create appearance record
    let updatedAppearance;
    
    try {
      if (existingBot.appearance && existingBot.appearance.length > 0) {
        // Update existing appearance
        updatedAppearance = await db.bot_Appearance.update({
          where: { bot_id: botId },
          data: validatedData.data
        });
      } else {
        // Create new appearance record
        updatedAppearance = await db.bot_Appearance.create({
          data: {
            bot_id: botId,
            ...validatedData.data
          }
        });
      }

      // Create a properly typed response object
      const appearanceResponse: AppearanceResponse = {
        ...updatedAppearance
      };

      // For admin, add owner information to the response object
      if (isAdmin && creator) {
        appearanceResponse.owner = {
          id: creator.userId,
          email: creator.email,
          name: creator.first_name && creator.last_name 
            ? `${creator.first_name} ${creator.last_name}`
            : undefined
        };
      }

      // Create the final response
      const responseObject = {
        message: "Bot appearance updated successfully", 
        appearance: appearanceResponse
      };

      return NextResponse.json(responseObject, { status: 200 });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { 
          error: "Database error while updating appearance", 
          details: String(dbError),
          fullError: dbError
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Comprehensive error updating bot appearance:", error);
    return NextResponse.json(
      { 
        error: "Error updating bot appearance", 
        details: String(error),
        errorType: error ? error.constructor.name : 'Unknown',
        errorStack: error instanceof Error ? error.stack : 'No stack trace available'
      },
      { status: 500 }
    );
  }
}