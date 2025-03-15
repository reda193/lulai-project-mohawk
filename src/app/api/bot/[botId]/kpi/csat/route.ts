// app/api/bot/[botId]/kpi/csat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    const params = await context.params;
    const botId = params.botId;
    
    if (!botId) {
      return NextResponse.json(
        { error: "Bot ID is required" },
        { status: 400 }
      );
    }

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

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get('startDate') 
      ? new Date(searchParams.get('startDate')!) 
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days ago
    
    const endDate = searchParams.get('endDate') 
      ? new Date(searchParams.get('endDate')!) 
      : new Date();

    // Verify bot belongs to user
    const bot = await db.bot.findFirst({
      where: { 
        id: botId,
        creator_id: user.userId 
      }
    });

    if (!bot) {
      return NextResponse.json(
        { error: "Bot not found or unauthorized" },
        { status: 404 }
      );
    }

    // Get CSAT ratings for this bot in the date range
    const csatRatings = await db.csat.findMany({
      where: {
        conversation: {
          bot_id: botId,
          start_time: {
            gte: startDate,
            lte: endDate
          }
        }
      },
      include: {
        conversation: {
          select: {
            escalated: true
          }
        }
      }
    });

    // Calculate distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalScore = 0;

    csatRatings.forEach(csat => {
      const score = csat.rating_score;
      if (score >= 1 && score <= 5) {
        distribution[score as 1|2|3|4|5]++;
        totalScore += score;
      }
    });

    // Calculate percentages
    const totalRatings = csatRatings.length;
    const distributionPercentages = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    if (totalRatings > 0) {
      distributionPercentages[1] = (distribution[1] / totalRatings) * 100;
      distributionPercentages[2] = (distribution[2] / totalRatings) * 100;
      distributionPercentages[3] = (distribution[3] / totalRatings) * 100;
      distributionPercentages[4] = (distribution[4] / totalRatings) * 100;
      distributionPercentages[5] = (distribution[5] / totalRatings) * 100;
    }

    // Calculate satisfaction categories
    const satisfactionCategories = {
      high: csatRatings.filter(csat => csat.rating_score >= 4).length,
      medium: csatRatings.filter(csat => csat.rating_score === 3).length,
      low: csatRatings.filter(csat => csat.rating_score < 3).length
    };

    const satisfactionPercentages = totalRatings > 0 
      ? {
        high: (satisfactionCategories.high / totalRatings) * 100,
        medium: (satisfactionCategories.medium / totalRatings) * 100,
        low: (satisfactionCategories.low / totalRatings) * 100
      } 
      : { high: 0, medium: 0, low: 0 };

    return NextResponse.json({
      timeframe: {
        start: startDate,
        end: endDate
      },
      summary: {
        totalRatings,
        averageScore: totalRatings > 0 ? totalScore / totalRatings : 0,
        distribution: distributionPercentages,
        satisfaction: satisfactionPercentages,
        trend: "stable" // You could calculate this based on historical data
      },
      bot: {
        id: bot.id,
        name: bot.bot_name
      }
    });
  } catch (error) {
    console.error('Error fetching bot CSAT data:', error);
    return NextResponse.json(
      { error: "Failed to fetch bot CSAT data" },
      { status: 500 }
    );
  }
}