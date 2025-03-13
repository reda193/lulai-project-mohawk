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

export async function POST(
  req: NextRequest,
  context: any // 👈 Tells TypeScript to ignore strict type checking
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

    // Check if bot exists and belongs to user
    const existingBot = await db.bot.findFirst({
      where: {
        id: botId,
        creator_id: user.userId
      },
      include: {
        appearance: true
      }
    });

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

      return NextResponse.json(
        { 
          message: "Bot appearance updated successfully", 
          appearance: updatedAppearance 
        },
        { status: 200 }
      );
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