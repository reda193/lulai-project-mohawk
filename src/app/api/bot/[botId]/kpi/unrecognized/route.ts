import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const unrecognizedQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().int().positive().optional().default(100),
  minFrequency: z.number().int().positive().optional().default(1)
});

// GET: Fetch unrecognized queries data for a specific bot
export async function GET(
  req: Request,
  context: any,
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

    // Authenticate the user
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

    // Check if user is an admin
    const isAdmin = user.role === 'ADMIN';
    console.log(`User ${user.email} has admin status: ${isAdmin}`);

    // Parse and validate query parameters
    const url = new URL(req.url);
    const validated = unrecognizedQuerySchema.safeParse({
      startDate: url.searchParams.get('startDate') || undefined,
      endDate: url.searchParams.get('endDate') || undefined,
      limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit') as string) : 100,
      minFrequency: url.searchParams.get('minFrequency') ? parseInt(url.searchParams.get('minFrequency') as string) : 1
    });

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validated.error.format() },
        { status: 400 }
      );
    }

    const { startDate, endDate, limit, minFrequency } = validated.data;
    
    // Parse dates if provided
    const startDateTime = startDate ? new Date(startDate) : undefined;
    const endDateTime = endDate ? new Date(endDate) : undefined;

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

    // Build where clause for date filtering
    const dateFilter: any = {};
    if (startDateTime) {
      dateFilter.first_seen_at = {
        ...(dateFilter.first_seen_at || {}),
        gte: startDateTime
      };
    }
    if (endDateTime) {
      dateFilter.last_seen_at = {
        ...(dateFilter.last_seen_at || {}),
        lte: endDateTime
      };
    }

    // Get unrecognized queries from the database
    const unrecognizedQueries = await db.unrecognizedQueries.findMany({
      where: {
        message: {
          conversation: {
            bot_id: botId
          }
        },
        frequency: {
          gte: minFrequency
        },
        ...dateFilter
      },
      orderBy: {
        frequency: 'desc'
      },
      take: limit,
      include: {
        message: {
          select: {
            conversation_id: true
          }
        }
      }
    });

    // Get total count of unrecognized queries
    const totalUnrecognizedQueries = await db.unrecognizedQueries.count({
      where: {
        message: {
          conversation: {
            bot_id: botId
          }
        },
        ...dateFilter
      }
    });
    
    // Get total occurrences (sum of frequencies)
    const totalOccurrences = await db.unrecognizedQueries.aggregate({
      where: {
        message: {
          conversation: {
            bot_id: botId
          }
        },
        ...dateFilter
      },
      _sum: {
        frequency: true
      }
    });

    // Get total number of user messages for comparison
    const totalUserMessages = await db.conv_Messages.count({
      where: {
        conversation: {
          bot_id: botId
        },
        sender_type: "USER",
        ...(startDateTime || endDateTime ? {
          sent_at: {
            ...(startDateTime ? { gte: startDateTime } : {}),
            ...(endDateTime ? { lte: endDateTime } : {})
          }
        } : {})
      }
    });
    
    // Calculate fallback rate
    const fallbackRate = totalUserMessages > 0 
      ? (totalOccurrences._sum.frequency || 0) / totalUserMessages * 100 
      : 0;

    // Get word frequency data for word cloud
    const wordFrequencyData = generateWordFrequencyData(unrecognizedQueries);
    
    // Group by top categories (simple implementation)
    const categories = categorizeQueries(unrecognizedQueries);

    // Create bot info object with creator details for admin
    const botInfo = {
      id: bot.id,
      name: bot.bot_name
    };
    
    // For admin view, add owner information if available
    if (isAdmin && (bot as any).creator) {
      const creator = (bot as any).creator;
      (botInfo as any).owner = {
        id: creator.userId,
        email: creator.email,
        name: creator.first_name && creator.last_name 
          ? `${creator.first_name} ${creator.last_name}`
          : undefined
      };
    }

    return NextResponse.json({
      summary: {
        totalUnrecognizedQueries,
        totalOccurrences: totalOccurrences._sum.frequency || 0,
        totalUserMessages,
        fallbackRate,
        uniqueQueriesCount: unrecognizedQueries.length
      },
      topQueries: unrecognizedQueries.map(query => ({
        id: query.id,
        text: query.query_text,
        frequency: query.frequency,
        firstSeen: query.first_seen_at,
        lastSeen: query.last_seen_at,
        conversationId: query.message.conversation_id
      })),
      wordCloudData: wordFrequencyData,
      categories,
      bot: botInfo
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching unrecognized queries data:", error);
    return NextResponse.json(
      { error: "Error fetching unrecognized queries data" },
      { status: 500 }
    );
  }
}

// Helper function to generate word frequency data for word cloud
function generateWordFrequencyData(unrecognizedQueries: any[]): Array<{ text: string, value: number }> {
  // Combine all query texts
  const allText = unrecognizedQueries.map(q => q.query_text).join(' ').toLowerCase();
  
  // Define common stop words to exclude
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'against', 'between', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down', 'of', 'off', 'over', 'under',
    'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any',
    'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
    'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now'
  ]);
  
  // Split into words and count occurrences
  const wordCounts: Record<string, number> = {};
  
  // Extract words using regex
  const words = allText.match(/\b(\w+)\b/g) || [];
  
  // Count words (excluding stop words and single characters)
  words.forEach(word => {
    if (!stopWords.has(word) && word.length > 1) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });
  
  // Convert to array and sort by frequency
  const wordFrequencyArray = Object.entries(wordCounts)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 50); // Limit to top 50 words
  
  return wordFrequencyArray;
}

// Helper function to categorize queries into topics
function categorizeQueries(unrecognizedQueries: any[]): Array<{ category: string, count: number, percentage: number }> {
  // Define category keywords
  const categories: Record<string, string[]> = {
    'Product': ['product', 'feature', 'use', 'work', 'function'],
    'Pricing': ['price', 'cost', 'payment', 'pay', 'subscription', 'plan', 'billing'],
    'Technical': ['error', 'issue', 'problem', 'broken', 'bug', 'fix', 'trouble'],
    'Account': ['account', 'login', 'password', 'sign', 'email', 'profile'],
    'Integration': ['integrate', 'api', 'connect', 'integration', 'sync'],
    'Other': []
  };
  
  // Count queries in each category
  const categoryCounts: Record<string, number> = {};
  Object.keys(categories).forEach(category => {
    categoryCounts[category] = 0;
  });
  
  // Categorize each query
  unrecognizedQueries.forEach(query => {
    const text = query.query_text.toLowerCase();
    let matched = false;
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (category === 'Other') continue; // Skip "Other" in the matching phase
      
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          categoryCounts[category] += query.frequency;
          matched = true;
          break;
        }
      }
      
      if (matched) break;
    }
    
    // If no category matched, count as "Other"
    if (!matched) {
      categoryCounts['Other'] += query.frequency;
    }
  });
  
  // Calculate total
  const total = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
  
  // Format result
  const result = Object.entries(categoryCounts)
    .map(([category, count]) => ({
      category,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count);
  
  return result;
}