// app/api/bot/[botId]/training/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Training update schema matching Prisma model
const createTrainingSchema = z.object({
  prompt_type: z.string(),
  prompt_content: z.string(),
  category: z.string().optional().nullable(),
  context: z.string().optional().nullable(),
});

export async function POST(
  req: NextRequest,
  context: { params: { botId: string } }
) {
  console.log("POST request received for bot training creation");

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

    console.log("Creating training for bot:", botId);

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
    const data = await req.json();
    console.log("Received training data:", data);

    // Validate the data
    const validatedData = createTrainingSchema.safeParse(data);

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

    // Create new training record
    try {
      const newTraining = await db.bot_Training.create({
        data: {
          bot_id: botId,
          ...validatedData.data
        }
      });

      return NextResponse.json(
        { 
          message: "Bot training created successfully", 
          training: newTraining 
        },
        { status: 201 }
      );
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { 
          error: "Database error while creating training", 
          details: String(dbError),
          fullError: dbError
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Comprehensive error creating bot training:", error);
    return NextResponse.json(
      { 
        error: "Error creating bot training", 
        details: String(error),
        errorType: error ? error.constructor.name : 'Unknown',
        errorStack: error instanceof Error ? error.stack : 'No stack trace available'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve training data
export async function GET(
  req: NextRequest,
  context: { params: { botId: string } }
) {
  console.log("GET request received for bot training");

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
      }
    });

    if (!existingBot) {
      console.log("Bot not found or unauthorized:", botId);
      return NextResponse.json(
        { error: "Bot not found or unauthorized" },
        { status: 404 }
      );
    }

    // Retrieve all training for this bot
    const training = await db.bot_Training.findMany({
      where: {
        bot_id: botId
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json(
      { training },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error retrieving bot training:", error);
    return NextResponse.json(
      { 
        error: "Error retrieving bot training", 
        details: String(error) 
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove a training item
export async function DELETE(
  req: NextRequest,
  context: { params: { botId: string } }
) {
  console.log("DELETE request received for bot training");

  // Correctly await params
  const params = await context.params;
  const botId = params.botId;

  try {
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

    // Check if bot exists and belongs to user
    const existingBot = await db.bot.findFirst({
      where: {
        id: botId,
        creator_id: user.userId
      }
    });

    if (!existingBot) {
      return NextResponse.json(
        { error: "Bot not found or unauthorized" },
        { status: 404 }
      );
    }

    const { trainingId } = await req.json();
    
    if (!trainingId) {
      return NextResponse.json(
        { error: "Training ID is required" },
        { status: 400 }
      );
    }

    // Delete the training record
    await db.bot_Training.delete({
      where: {
        id: parseInt(trainingId),
        bot_id: botId
      }
    });

    return NextResponse.json(
      { message: "Training deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting bot training:", error);
    return NextResponse.json(
      { 
        error: "Error deleting bot training", 
        details: String(error) 
      },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update a training item
export async function PATCH(
  req: NextRequest,
  context: { params: { botId: string } }
) {
  console.log("PATCH request received for bot training update");

  // Correctly await params
  const params = await context.params;
  const botId = params.botId;

  try {
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

    // Check if bot exists and belongs to user
    const existingBot = await db.bot.findFirst({
      where: {
        id: botId,
        creator_id: user.userId
      }
    });

    if (!existingBot) {
      return NextResponse.json(
        { error: "Bot not found or unauthorized" },
        { status: 404 }
      );
    }

    const data = await req.json();
    const { trainingId, ...updateData } = data;
    
    if (!trainingId) {
      return NextResponse.json(
        { error: "Training ID is required" },
        { status: 400 }
      );
    }

    // Validate the update data
    const validatedData = createTrainingSchema.partial().safeParse(updateData);

    if (!validatedData.success) {
      return NextResponse.json(
        { 
          error: "Invalid data", 
          details: validatedData.error.issues 
        },
        { status: 400 }
      );
    }

    // Update the training record
    const updatedTraining = await db.bot_Training.update({
      where: {
        id: parseInt(trainingId),
        bot_id: botId
      },
      data: validatedData.data
    });

    return NextResponse.json(
      { 
        message: "Training updated successfully",
        training: updatedTraining
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating bot training:", error);
    return NextResponse.json(
      { 
        error: "Error updating bot training", 
        details: String(error) 
      },
      { status: 500 }
    );
  }
}