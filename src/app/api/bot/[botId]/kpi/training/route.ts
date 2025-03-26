// @ts-nocheck
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

interface User {
  id: number;
  name: string;
  email: string;
}

// Define more granular types for each part of our response
interface BotInfo {
  id: string;
  name: string;
  owner?: {
    id: string;
    email: string;
    name?: string;
  };
}

interface CoverageSummary {
  totalUniqueQueries: number;
  coveredIntents: number;
  coveragePercentage: number;
  latestMeasurement: Date | null;
}

interface HistoryPoint {
  date: Date;
  totalQueries: number;
  coveredIntents: number;
  coveragePercentage: number;
}

// GET: Fetch training coverage data for a specific bot
export async function GET(
  req: Request,
  context: any
) {
  try {
    const params = await context.params;
    const botId = params.botId
    
    if (!botId) {
      return NextResponse.json(
        { error: "Bot ID is required" },
        { status: 400 }
      );
    }

    // Authenticate the user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const users: User[] = [];

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is an admin
    const isAdmin = user.role === 'ADMIN';
    console.log(`User ${user.email} has admin status: ${isAdmin}`);

    // If admin, skip bot ownership check
    let bot;
    
    if (isAdmin) {
      console.log('Admin access - skipping ownership check');
      // Admin can access any bot
      bot = await db.bot.findFirst({
        where: { id: botId },
        select: {
          id: true,
          bot_name: true,
          model_type: true,
          creator_id: true
        }
      });
      
      // Get creator information if needed
      if (bot) {
        const creator = await db.user.findUnique({
          where: { userId: bot.creator_id },
          select: {
            userId: true,
            email: true,
            first_name: true,
            last_name: true,
            role: true
          }
        });
        
        if (creator) {
          // Add creator info to bot
          (bot as any).creator = creator;
        }
      }
    } else {
      console.log('Regular user access - checking ownership');
      // Regular users can only access their own bots
      bot = await db.bot.findFirst({
        where: {
          id: botId,
          creator_id: user.userId
        },
        select: {
          id: true,
          bot_name: true,
          model_type: true
        }
      });
    }

    if (!bot) {
      return NextResponse.json(
        { error: "Bot not found or unauthorized" },
        { status: 404 }
      );
    }

    // Get training coverage data from the Training_Coverage table
    const coverageData = await db.training_Coverage.findMany({
      where: {
        bot_id: botId
      },
      orderBy: {
        measure_at: 'desc'
      },
      take: 10 // Get the 10 most recent measurements
    });

    // Get latest coverage data
    const latestCoverage = coverageData.length > 0 ? coverageData[0] : null;
    
    // Function to generate recommendations with explicit return type
    const generateRecommendations = (coveragePercentage: number): string[] => {
      if (coveragePercentage < 50) {
        return [
          "Your bot needs significant training improvements. Focus on adding more examples for the most common user queries.",
          "Review unrecognized queries report to identify training gaps.",
          "Consider adding more Q&A pairs for frequently asked questions."
        ];
      } else if (coveragePercentage < 70) {
        return [
          "Your bot training is making progress but could be improved. Target the most frequent unrecognized queries.",
          "Review existing training intents for quality and variety."
        ];
      } else if (coveragePercentage < 90) {
        return [
          "Your bot training coverage is good. Focus on improving the variety of examples for each intent.",
          "Add training examples for edge cases and uncommon queries."
        ];
      } else {
        return [
          "Excellent training coverage! Continue to monitor and maintain as user queries evolve.",
          "Consider optimizing response quality for high-frequency intents."
        ];
      }
    };
    
    // Create bot info object with creator details for admin
    const botInfo: BotInfo = {
      id: bot.id,
      name: bot.bot_name
    };
    
    // For admin view, add owner information if available
    if (isAdmin && (bot as any).creator) {
      const creator = (bot as any).creator;
      botInfo.owner = {
        id: creator.userId,
        email: creator.email,
        name: creator.first_name && creator.last_name 
          ? `${creator.first_name} ${creator.last_name}`
          : undefined
      };
    }
    
    // If no coverage data exists, fetch raw data to calculate it
    if (!latestCoverage) {
      // Get total number of unique queries from conversation messages
      const uniqueQueriesCount = await db.conv_Messages.count({
        where: {
          conversation: {
            bot_id: botId
          },
          sender_type: "USER" // Only count user messages
        },
        distinct: ['message_text'] // Count only unique message texts
      });
      
      // Get all training data (intents) for this bot
      const trainingCount = await db.bot_Training.count({
        where: {
          bot_id: botId
        }
      });
      
      // Get all Q&A pairs (which also cover intents)
      const qaCount = await db.bot_QA.count({
        where: {
          bot_id: botId,
          is_active: true
        }
      });
      
      // Calculate coverage metrics
      const coveredIntents = trainingCount + qaCount;
      const coveragePercentage = uniqueQueriesCount > 0 
        ? (coveredIntents / uniqueQueriesCount) * 100 
        : 0;
      
      // Generate recommendations
      const recommendations = generateRecommendations(coveragePercentage);
      
      // Create the summary with proper typing
      const summary: CoverageSummary = {
        totalUniqueQueries: uniqueQueriesCount,
        coveredIntents: coveredIntents,
        coveragePercentage: coveragePercentage,
        latestMeasurement: null
      };
      
      // Create response using proper typing for every property
      const responseObject = {
        summary: summary,
        history: [] as HistoryPoint[],
        recommendations: recommendations,
        bot: botInfo
      };
      
      return NextResponse.json(responseObject, { status: 200 });
    }
    
    // Calculate coverage percentage
    const coveragePercentage = latestCoverage.total_unique_queries > 0 
      ? (latestCoverage.covered_intents / latestCoverage.total_unique_queries) * 100 
      : 0;
    
    // Format historical data for time series
    const historyData: HistoryPoint[] = coverageData.map(record => ({
      date: record.measure_at,
      totalQueries: record.total_unique_queries,
      coveredIntents: record.covered_intents,
      coveragePercentage: record.total_unique_queries > 0 
        ? (record.covered_intents / record.total_unique_queries) * 100 
        : 0
    })).reverse(); // Reverse to get chronological order
    
    // Generate recommendations as string[]
    const recommendations: string[] = generateRecommendations(coveragePercentage);
    
    // Create the summary with proper typing
    const summary: CoverageSummary = {
      totalUniqueQueries: latestCoverage.total_unique_queries,
      coveredIntents: latestCoverage.covered_intents,
      coveragePercentage: coveragePercentage,
      latestMeasurement: latestCoverage.measure_at
    };
    
    // Create complete response object with explicit typing for every property
    const responseObject = {
      summary: summary,
      history: historyData,
      recommendations: recommendations,
      bot: botInfo
    };
    
    return NextResponse.json(responseObject, { status: 200 });
  } catch (error) {
    console.error("Error fetching training coverage data:", error);
    return NextResponse.json(
      { error: "Error fetching training coverage data" },
      { status: 500 }
    );
  }
}