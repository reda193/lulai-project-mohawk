// app/api/bot/[botId]/qa/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Q&A item schema matching Prisma model
const qaItemSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  category: z.string().optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

// Batch QA schema for multiple QA items
const batchQASchema = z.array(qaItemSchema);

export async function POST(
  req: NextRequest,
  context: { params: { botId: string } }
) {
  console.log("POST request received for bot QA creation");

  // Get botId from params
  const params = await context.params;
  const botId = params.botId;

  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user.email) {
      console.log("Unauthorized: No session or email");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("Creating QA for bot:", botId);

    // Get user details
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
    console.log("Received QA data:", data);

    // Check if this is a batch operation (multiple QA items)
    const isBatchOperation = Array.isArray(data);
    
    if (isBatchOperation) {
      // Validate batch data
      const validatedBatchData = batchQASchema.safeParse(data);
      
      if (!validatedBatchData.success) {
        console.log("Batch data validation failed:", validatedBatchData.error.issues);
        return NextResponse.json(
          { 
            error: "Invalid batch data", 
            details: validatedBatchData.error.issues 
          },
          { status: 400 }
        );
      }
      
      // Create multiple QA records
      try {
        // Create an array of QA records to be inserted
        const createPromises = validatedBatchData.data.map(item => 
          db.bot_QA.create({
            data: {
              bot_id: botId,
              ...item
            }
          })
        );
        
        // Execute all creates
        const newQAs = await Promise.all(createPromises);

        return NextResponse.json(
          { 
            message: `${newQAs.length} QA items created successfully`, 
            qa_items: newQAs 
          },
          { status: 201 }
        );
      } catch (dbError) {
        console.error("Database error during batch operation:", dbError);
        return NextResponse.json(
          { 
            error: "Database error while creating QA batch", 
            details: String(dbError),
            fullError: dbError
          },
          { status: 500 }
        );
      }
    } else {
      // Single QA item
      // Validate the data
      const validatedData = qaItemSchema.safeParse(data);

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

      // Create new QA record
      try {
        const newQA = await db.bot_QA.create({
          data: {
            bot_id: botId,
            ...validatedData.data
          }
        });

        return NextResponse.json(
          { 
            message: "QA item created successfully", 
            qa_item: newQA 
          },
          { status: 201 }
        );
      } catch (dbError) {
        console.error("Database error:", dbError);
        return NextResponse.json(
          { 
            error: "Database error while creating QA", 
            details: String(dbError),
            fullError: dbError
          },
          { status: 500 }
        );
      }
    }

  } catch (error) {
    console.error("Comprehensive error creating QA:", error);
    return NextResponse.json(
      { 
        error: "Error creating QA", 
        details: String(error),
        errorType: error ? error.constructor.name : 'Unknown',
        errorStack: error instanceof Error ? error.stack : 'No stack trace available'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve QA data
export async function GET(
  req: NextRequest,
  context: { params: { botId: string } }
) {
  console.log("GET request received for bot QA");

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

    // Get query parameters for filtering
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const isActive = url.searchParams.get('is_active');
    
    // Build where clause
    const whereClause: any = {
      bot_id: botId
    };
    
    if (category) {
      whereClause.category = category;
    }
    
    if (isActive !== null) {
      whereClause.is_active = isActive === 'true';
    }

    // Retrieve all QA for this bot with filters
    const qaItems = await db.bot_QA.findMany({
      where: whereClause,
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json(
      { qa_items: qaItems },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error retrieving bot QA:", error);
    return NextResponse.json(
      { 
        error: "Error retrieving bot QA", 
        details: String(error) 
      },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update a QA item
export async function PATCH(
  req: NextRequest,
  context: { params: { botId: string } }
) {
  console.log("PATCH request received for bot QA update");

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
    const { id, ...updateData } = data;
    
    if (!id) {
      return NextResponse.json(
        { error: "QA ID is required" },
        { status: 400 }
      );
    }

    // Validate the update data
    const validatedData = qaItemSchema.partial().safeParse(updateData);

    if (!validatedData.success) {
      return NextResponse.json(
        { 
          error: "Invalid data", 
          details: validatedData.error.issues 
        },
        { status: 400 }
      );
    }

    // Update the QA record
    const updatedQA = await db.bot_QA.update({
      where: {
        id: id,
        bot_id: botId
      },
      data: validatedData.data
    });

    return NextResponse.json(
      { 
        message: "QA updated successfully",
        qa_item: updatedQA
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating bot QA:", error);
    return NextResponse.json(
      { 
        error: "Error updating bot QA", 
        details: String(error) 
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove a QA item
export async function DELETE(
  req: NextRequest,
  context: { params: { botId: string } }
) {
  console.log("DELETE request received for bot QA");

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

    const { id } = await req.json();
    
    if (!id) {
      return NextResponse.json(
        { error: "QA ID is required" },
        { status: 400 }
      );
    }

    // Delete the QA record
    await db.bot_QA.delete({
      where: {
        id: id,
        bot_id: botId
      }
    });

    return NextResponse.json(
      { message: "QA deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting bot QA:", error);
    return NextResponse.json(
      { 
        error: "Error deleting bot QA", 
        details: String(error) 
      },
      { status: 500 }
    );
  }
}