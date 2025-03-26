// app/api/admin/bot/[botId]/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  context: any,
) {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Check if user is admin
  if (session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
  }
  
  const params = await context.params;
  const botId = params.botId;
  
  if (!botId) {
    return NextResponse.json({ error: "Bot ID is required" }, { status: 400 });
  }
  
  try {
    // Fetch bot details with creator info - no ownership check needed for admins
    const bot = await db.bot.findUnique({
      where: {
        id: botId
      },
      include: {
        creator: {
          select: {
            userId: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true
          }
        },
        appearance: true
      }
    });
    
    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }
    
    // Format owner info for the admin view
    const owner = {
      id: bot.creator.userId,
      name: `${bot.creator.first_name || ''} ${bot.creator.last_name || ''}`.trim() || null,
      email: bot.creator.email,
      role: bot.creator.role
    };
    
    return NextResponse.json({ 
      bot,
      owner
    });
  } catch (error) {
    console.error("Error fetching bot details:", error);
    return NextResponse.json(
      { error: "Failed to fetch bot details" },
      { status: 500 }
    );
  }
}