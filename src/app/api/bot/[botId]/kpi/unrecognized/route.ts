import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const queryFilterSchema = z.object({
  botId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  sortBy: z.enum(['frequency', 'first_seen_at', 'last_seen_at']).default('frequency'),
  sortDirection: z.enum(['asc', 'desc']).default('desc')
});

// GET: List all unrecognized queries across user's bots
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
    const validated = queryFilterSchema.safeParse({
      botId: url.searchParams.get('botId'),
      startDate: url.searchParams.get('startDate'),
      endDate: url.searchParams.get('endDate'),
      limit: url.searchParams.get('limit'),
      page: url.searchParams.get('page'),
      sortBy: url.searchParams.get('sortBy') || 'frequency',
      sortDirection: url.searchParams.get('sortDirection') || 'desc'
    });

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validated.error.format() },
        { status: 400 }
      );
    }

    const { botId, startDate, endDate, limit, page, sortBy, sortDirection } = validated.data;

    // Default to last 30 days if no dates provided
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    
    const startDateTime = startDate ? new Date(startDate) : defaultStartDate;
    const endDateTime = endDate ? new Date(endDate) : new Date();

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
        queries: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        }
      }, { status: botId ? 404 : 200 });
    }

    const botIds = bots.map(bot => bot.id);

    // Build the query for unrecognized queries
    const queryCondition = {
      message: {
        conversation: {
          bot_id: {
            in: botIds
          },
          start_time: {
            gte: startDateTime,
            lte: endDateTime
          }
        }
      }
    };

    // Count total matching queries for pagination
    const totalQueries = await db.unrecognizedQueries.count({
      where: queryCondition
    });

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(totalQueries / limit);

    // Fetch paginated queries
    const queries = await db.unrecognizedQueries.findMany({
      where: queryCondition,
      orderBy: {
        [sortBy]: sortDirection
      },
      skip,
      take: limit,
      include: {
        message: {
          select: {
            conversation: {
              select: {
                bot_id: true
              }
            }
          }
        }
      }
    });

    // Map bot names to queries
    const botsMap = bots.reduce((map, bot) => {
      map[bot.id] = bot.bot_name;
      return map;
    }, {} as Record<string, string>);

    // Format the queries
    const formattedQueries = queries.map(query => ({
      id: query.id,
      query: query.query_text,
      frequency: query.frequency,
      botId: query.message.conversation.bot_id,
      botName: botsMap[query.message.conversation.bot_id] || 'Unknown Bot',
      firstSeen: query.first_seen_at,
      lastSeen: query.last_seen_at
    }));

    // Group by query text to combine frequencies across bots
    const queryGroups: Record<string, {
      query: string,
      totalFrequency: number,
      byBot: Record<string, {
        botId: string,
        botName: string,
        frequency: number,
        firstSeen: Date,
        lastSeen: Date
      }>
    }> = {};

    formattedQueries.forEach(q => {
      if (!queryGroups[q.query]) {
        queryGroups[q.query] = {
          query: q.query,
          totalFrequency: 0,
          byBot: {}
        };
      }

      queryGroups[q.query].totalFrequency += q.frequency;

      if (!queryGroups[q.query].byBot[q.botId]) {
        queryGroups[q.query].byBot[q.botId] = {
          botId: q.botId,
          botName: q.botName,
          frequency: 0,
          firstSeen: q.firstSeen,
          lastSeen: q.lastSeen
        };
      }

      queryGroups[q.query].byBot[q.botId].frequency += q.frequency;

      // Update first seen if this instance is earlier
      if (q.firstSeen < queryGroups[q.query].byBot[q.botId].firstSeen) {
        queryGroups[q.query].byBot[q.botId].firstSeen = q.firstSeen;
      }

      // Update last seen if this instance is later
      if (q.lastSeen > queryGroups[q.query].byBot[q.botId].lastSeen) {
        queryGroups[q.query].byBot[q.botId].lastSeen = q.lastSeen;
      }
    });

    // Convert to array and format for response
    const groupedQueries = Object.values(queryGroups).map(group => ({
      query: group.query,
      totalFrequency: group.totalFrequency,
      bots: Object.values(group.byBot).map(bot => ({
        id: bot.botId,
        name: bot.botName,
        frequency: bot.frequency,
        firstSeen: bot.firstSeen,
        lastSeen: bot.lastSeen
      }))
    }));

    // Sort grouped queries according to sort parameters
    groupedQueries.sort((a, b) => {
      if (sortBy === 'frequency') {
        return sortDirection === 'desc' 
          ? b.totalFrequency - a.totalFrequency 
          : a.totalFrequency - b.totalFrequency;
      }
      
      // For date-based sorting, use the earliest/latest date across all bots
      if (sortBy === 'first_seen_at') {
        const aDate = Math.min(...a.bots.map(b => new Date(b.firstSeen).getTime()));
        const bDate = Math.min(...b.bots.map(b => new Date(b.firstSeen).getTime()));
        return sortDirection === 'desc' ? bDate - aDate : aDate - bDate;
      }
      
      if (sortBy === 'last_seen_at') {
        const aDate = Math.max(...a.bots.map(b => new Date(b.lastSeen).getTime()));
        const bDate = Math.max(...b.bots.map(b => new Date(b.lastSeen).getTime()));
        return sortDirection === 'desc' ? bDate - aDate : aDate - bDate;
      }
      
      return 0;
    });

    return NextResponse.json({
      queries: groupedQueries,
      pagination: {
        page,
        limit,
        total: totalQueries,
        totalPages
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching unrecognized queries:", error);
    return NextResponse.json(
      { error: "Error fetching unrecognized queries" },
      { status: 500 }
    );
  }
}

// POST: Bulk action to add unrecognized queries to training
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
    
    const { botId, queryIds, action } = body;

    if (!botId || !queryIds || !Array.isArray(queryIds) || !action) {
      return NextResponse.json(
        { error: "Invalid request. botId, queryIds array, and action are required" },
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

    // Get the unrecognized queries by ID
    const queries = await db.unrecognizedQueries.findMany({
      where: {
        id: { in: queryIds },
        message: {
          conversation: {
            bot_id: botId
          }
        }
      }
    });

    if (queries.length === 0) {
      return NextResponse.json(
        { error: "No valid queries found to process" },
        { status: 404 }
      );
    }

    // Process queries based on action
    if (action === 'add_to_training') {
      // Add queries to training data
      const trainingEntries = queries.map(query => ({
        bot_id: botId,
        prompt_type: 'UNRECOGNIZED_QUERY',
        prompt_content: query.query_text,
        category: 'Auto-Added',
        context: `Auto-added from unrecognized query (ID: ${query.id})`,
        created_at: new Date(),
        updated_at: new Date()
      }));

      // Create training entries
      await db.bot_Training.createMany({
        data: trainingEntries
      });

      // Update training coverage
      const coverage = await db.training_Coverage.findFirst({
        where: { bot_id: botId },
        orderBy: { measure_at: 'desc' }
      });

      if (coverage) {
        await db.training_Coverage.create({
          data: {
            bot_id: botId,
            total_unique_queries: coverage.total_unique_queries,
            covered_intents: coverage.covered_intents + queries.length,
            measure_at: new Date()
          }
        });
      }

      return NextResponse.json({
        message: `${queries.length} queries added to training data`,
        addedQueries: queries.map(q => q.query_text)
      }, { status: 200 });
    } 
    else if (action === 'ignore') {
      // Mark queries as ignored (delete them)
      await db.unrecognizedQueries.deleteMany({
        where: {
          id: { in: queryIds }
        }
      });

      return NextResponse.json({
        message: `${queries.length} queries marked as ignored`,
        ignoredQueries: queries.map(q => q.query_text)
      }, { status: 200 });
    } 
    else {
      return NextResponse.json(
        { error: "Invalid action. Supported actions: 'add_to_training', 'ignore'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error processing unrecognized queries:", error);
    return NextResponse.json(
      { error: "Error processing unrecognized queries" },
      { status: 500 }
    );
  }
}