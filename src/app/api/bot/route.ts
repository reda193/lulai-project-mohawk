// app/api/bot/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schema
const createBotSchema = z.object({
    bot_name: z.string().min(1, "Bot name is required"),
    description: z.string().min(1, "Description is required"),
    purpose: z.string().min(1, "Purpose is required"),
    model_type: z.enum([
        "GPT_3_5_TURBO",
        "GPT_4",
        "CLAUDE_3_OPUS",
        "CLAUDE_3_SONNET",
        "CLAUDE_3_HAIKU",
        "GEMINI_PRO"
    ], {
        required_error: "Model type is required",
    })
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        console.log("Session", JSON.stringify(session));
        if (!session || !session.user.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();

        const validatedData = createBotSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json(
                { error: "Invalid data", details: validatedData.error.issues },
                { status: 400 }
            );
        }

        // Get user id from session
        const user = await db.user.findUnique({
            where: { email: session.user.email! }
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Check if bot with same name exists for this user
        const existingBot = await db.bot.findFirst({
            where: {
                bot_name: validatedData.data.bot_name,
                creator_id: user.userId
            }
        });

        if (existingBot) {
            return NextResponse.json(
                { error: "A bot with this name already exists" },
                { status: 409 }  // 409 Conflict status code
            );
        }

        // Create bot
        const bot = await db.bot.create({
            data: {
                ...validatedData.data,
                creator_id: user.userId,
            },
        });

        return NextResponse.json(
            { message: "Bot created successfully", bot },
            { status: 201 }
        );

    } catch (error) {
        console.error("Error creating bot:", error);
        return NextResponse.json(
            { error: "Error creating bot" },
            { status: 500 }
        );
    }
}

export async function GET(_req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = await db.user.findUnique({
            where: { email: session.user.email! }
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const bots = await db.bot.findMany({
            where: {
                creator_id: user.userId
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return NextResponse.json(bots);

    } catch (error) {
        console.error("Error fetching bots:", error);
        return NextResponse.json(
            { error: "Error fetching bots" },
            { status: 500 }
        );
    }
}