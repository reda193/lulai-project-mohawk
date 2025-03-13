import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  context: any
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const botId = context.params.botId;

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

    // Bot exists and belongs to the current user
    return NextResponse.json(
      { message: "Bot ownership verified" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error verifying bot ownership:", error);
    return NextResponse.json(
      { error: "Error verifying bot ownership" },
      { status: 500 }
    );
  }
}