import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schema for updates - all fields optional
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


export async function PATCH(
    req: Request,
    context: { params: { botId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

         // First store await params
         const param = await context.params;
         // Then retrieve the botId
         const botId = await param.botId;
 

        // Get current user
        const user = await db.user.findUnique({
            where: { email: session.user.email! }
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
