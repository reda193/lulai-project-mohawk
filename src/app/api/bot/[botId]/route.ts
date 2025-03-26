// app/api/bot/[botId]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateBotSchema = z.object({
    bot_name: z.string().min(1, "Bot name is required").optional(),
    description: z.string().optional(),
    purpose: z.string().optional(),
    company_size: z.string().optional(),
    company_type: z.string().optional(),
    use_case_category: z.string().optional(),
    use_case_description: z.string().optional(),
    target_audience: z.string().optional(),
    privacy_level: z.string().optional(),
    model_type: z.enum([
        "GPT_3_5_TURBO",
        "GPT_4",
        "CLAUDE_3_OPUS",
        "CLAUDE_3_SONNET",
        "CLAUDE_3_HAIKU",
        "GEMINI_PRO"
    ]).optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update"
});

// GET request handler to fetch a specific bot
export async function GET(
    req: Request,
    context: { params: Promise<{ botId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        
        const param = await context.params;
        const botId = await param.botId;
        
        // Find the user
        const user = await db.user.findUnique({
            where: { email: session.user.email! }
        });
        
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }
        
        // IMPORTANT: First check if user is an admin
        // Check directly from the user record in the database
        const isAdmin = user.role === 'ADMIN';
        
        console.log(`User ${user.email} has admin status: ${isAdmin}`);
        
        // If admin, skip all other security checks and fetch any bot
        if (isAdmin) {
            console.log('Admin user detected - fetching bot without creator check');
            
            const bot = await db.bot.findUnique({
                where: { id: botId },
                include: {
                    appearance: true,
                    bot_qa: true,
                    bot_training: true,
                    training_coverage: true,
                    creator: {
                        select: {
                            userId: true,
                            email: true,
                            first_name: true,
                            last_name: true,
                            role: true
                        }
                    }
                }
            });
            
            if (!bot) {
                return NextResponse.json(
                    { error: "Bot not found" },
                    { status: 404 }
                );
            }
            
            return NextResponse.json({ bot }, { status: 200 });
        } 
        
        // If not admin, continue with normal security check
        console.log('Regular user - checking creator_id');
        const bot = await db.bot.findFirst({
            where: {
                id: botId,
                creator_id: user.userId
            },
            include: {
                appearance: true,
                bot_qa: true,
                bot_training: true,
                training_coverage: true
            }
        });
        
        if (!bot) {
            return NextResponse.json(
                { error: "Bot not found or unauthorized" },
                { status: 404 }
            );
        }
        
        return NextResponse.json({ bot }, { status: 200 });
        
    } catch (error) {
        console.error("Error fetching bot:", error);
        return NextResponse.json(
            { error: "Error fetching bot" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: Request,
    context: { params: Promise<{ botId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const param = await context.params;
        const botId = await param.botId;
        
        const user = await db.user.findUnique({
            where: { email: session.user.email! }
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // IMPORTANT: First check if user is an admin
        const isAdmin = user.role === 'ADMIN';
        
        let existingBot;
        
        // If admin, can update any bot
        if (isAdmin) {
            existingBot = await db.bot.findUnique({
                where: { id: botId }
            });
        } else {
            // Regular user can only update their own bots
            existingBot = await db.bot.findFirst({
                where: {
                    id: botId,
                    creator_id: user.userId
                }
            });
        }

        if (!existingBot) {
            return NextResponse.json(
                { error: "Bot not found or unauthorized" },
                { status: 404 }
            );
        }

        // Parse request body
        const body = await req.json();
        const validatedData = updateBotSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json(
                { error: "Invalid data", details: validatedData.error.issues },
                { status: 400 }
            );
        }

        // Update bot
        const updatedBot = await db.bot.update({
            where: { id: botId },
            data: validatedData.data
        });

        return NextResponse.json(
            { message: "Bot updated successfully", bot: updatedBot },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating bot:", error);
        return NextResponse.json(
            { error: "Error updating bot" },
            { status: 500 }
        );
    }
}