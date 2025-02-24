import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const coverageFilterSchema = z.object({
  botId: z.string().optional(),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
});

// GET: Get training coverage statistics for user's bots
export async function GET(req: Request) {
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

    // Parse and validate query parameters
    const url = new URL(req.url);
    const validated = coverageFilterSchema.safeParse({
      botId: url.searchParams.get('botId'),
      limit: url.searchParams.get('limit')
    });

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validated.error.format() },
        { status: 400 }
      );
    }

    const { botId, limit } = validated.data;

    // Get user's bots or specific bot
    const botsCondition = botId 
      ? { id: botId, creator_id: user.userId }
      : { creator_id: user.userId };

    const bots = await db.bot.findMany({
      where: botsCondition,
      select: {
        id: true,
        bot_name: true
      }
    });

    if (bots.length === 0) {
      return NextResponse.json({
        message: botId ? "Bot not found or unauthorized" : "No bots found for this user",
        coverage: []
      }, { status: botId ? 404 : 200 });
    }

    // Get coverage data for each bot
    const coverageData = await Promise.all(bots.map(async (bot) => {
      // Get historical coverage records
      const coverageHistory = await db.training_Coverage.findMany({
        where: { bot_id: bot.id },
        orderBy: { measure_at: 'desc' },
        take: limit
      });

      // Calculate current coverage percentage
      const latestCoverage = coverageHistory[0] || null;
      const coveragePercentage = latestCoverage && latestCoverage.total_unique_queries > 0
        ? (latestCoverage.covered_intents / latestCoverage.total_unique_queries) * 100
        : 0;

      // Get count of bot's training data entries
      const trainingCount = await db.bot_Training.count({
        where: { bot_id: bot.id }
      });

      // Get count of bot's QA entries
      const qaCount = await db.bot_QA.count({
        where: { bot_id: bot.id }
      });

      // Get unrecognized queries count
      const unrecognizedCount = await db.unrecognizedQueries.count({
        where: {
          message: {
            conversation: {
              bot_id: bot.id
            }
          }
        }
      });

      return {
        botId: bot.id,
        botName: bot.bot_name,
        currentCoverage: {
          percentage: coveragePercentage,
          coveredIntents: latestCoverage?.covered_intents || 0,
          totalUniqueQueries: latestCoverage?.total_unique_queries || 0,
          lastMeasured: latestCoverage?.measure_at || null
        },
        trainingData: {
          trainingEntries: trainingCount,
          qaEntries: qaCount,
          unrecognizedQueries: unrecognizedCount,
          total: trainingCount + qaCount
        },
        history: coverageHistory.map(record => ({
          date: record.measure_at,
          totalQueries: record.total_unique_queries,
          coveredIntents: record.covered_intents,
          percentage: record.total_unique_queries > 0
            ? (record.covered_intents / record.total_unique_queries) * 100
            : 0
        }))
      };
    }));

    // Calculate system-wide averages
    const overallStats = coverageData.reduce((stats, bot) => {
      stats.totalBots++;
      stats.totalTrainingEntries += bot.trainingData.trainingEntries;
      stats.totalQaEntries += bot.trainingData.qaEntries;
      stats.totalUnrecognizedQueries += bot.trainingData.unrecognizedQueries;
      
      if (bot.currentCoverage.totalUniqueQueries > 0) {
        stats.totalPercentage += bot.currentCoverage.percentage;
        stats.botsWithCoverage++;
      }
      
      return stats;
    }, {
      totalBots: 0,
      totalTrainingEntries: 0,
      totalQaEntries: 0,
      totalUnrecognizedQueries: 0,
      totalPercentage: 0,
      botsWithCoverage: 0
    });

    const averageCoverage = overallStats.botsWithCoverage > 0
      ? overallStats.totalPercentage / overallStats.botsWithCoverage
      : 0;

    return NextResponse.json({
      bots: coverageData,
      summary: {
        totalBots: overallStats.totalBots,
        averageCoverage: averageCoverage.toFixed(2),
        totalTrainingEntries: overallStats.totalTrainingEntries,
        totalQaEntries: overallStats.totalQaEntries,
        totalUnrecognizedQueries: overallStats.totalUnrecognizedQueries
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching training coverage:", error);
    return NextResponse.json(
      { error: "Error fetching training coverage" },
      { status: 500 }
    );
  }
}

// POST: Update training coverage for a specific bot
export async function POST(req: Request) {
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

    // Parse request body
    const body = await req.json();
    const { botId } = body;

    if (!botId) {
      return NextResponse.json(
        { error: "Bot ID is required" },
        { status: 400 }
      );
    }

    // Check if bot exists and belongs to user
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

    // Get all unrecognized queries for this bot
    const unrecognizedQueries = await db.unrecognizedQueries.findMany({
      where: {
        message: {
          conversation: {
            bot_id: botId
          }
        }
      },
      distinct: ['query_text'],
      select: {
        query_text: true
      }
    });

    // Count unique unrecognized queries
    const totalUniqueQueries = unrecognizedQueries.length;

    // Count covered intents (training + QA)
    const trainingCount = await db.bot_Training.count({
      where: { bot_id: botId }
    });

    const qaCount = await db.bot_QA.count({
      where: { bot_id: botId }
    });

    const coveredIntents = trainingCount + qaCount;

    // Create new coverage record
    const newCoverage = await db.training_Coverage.create({
      data: {
        bot_id: botId,
        total_unique_queries: totalUniqueQueries,
        covered_intents: coveredIntents,
        measure_at: new Date()
      }
    });

    // Calculate coverage percentage
    const coveragePercentage = totalUniqueQueries > 0
      ? (coveredIntents / totalUniqueQueries) * 100
      : 0;

    return NextResponse.json({
      message: "Training coverage updated successfully",
      coverage: {
        id: newCoverage.id,
        botId: newCoverage.bot_id,
        totalUniqueQueries: newCoverage.total_unique_queries,
        coveredIntents: newCoverage.covered_intents,
        percentage: coveragePercentage.toFixed(2),
        measureAt: newCoverage.measure_at
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating training coverage:", error);
    return NextResponse.json(
      { error: "Error updating training coverage" },
      { status: 500 }
    );
  }
}