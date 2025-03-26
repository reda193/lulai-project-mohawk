// app/api/admin/subscriptions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const searchParamsSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  planType: z.string().optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 10).optional(),
});

// GET: Fetch subscription data for admin dashboard
export async function GET(req: NextRequest) {
  try {
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
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    const rawParams = {
      search: url.searchParams.get('search') || undefined,
      status: url.searchParams.get('status') || undefined,
      planType: url.searchParams.get('planType') || undefined,
      page: url.searchParams.get('page') || '1',
      limit: url.searchParams.get('limit') || '10',
    };

    const { search, status, planType, page = 1, limit = 10 } = searchParamsSchema.parse(rawParams);

    // Build the query conditions
    const whereConditions: any = {};

    // Add status filter if provided
    if (status) {
      whereConditions.status = status;
    }

    // Add plan type filter if provided
    if (planType) {
      whereConditions.plan_type = planType;
    }

    // Add search conditions if search term provided
    let userConditions = {};
    if (search) {
      // Check if search looks like an ID
      if (/^\d+$/.test(search)) {
        userConditions = {
          OR: [
            { id: parseInt(search) },
            { userId: search }
          ]
        };
      } else {
        // Otherwise search by email
        userConditions = {
          email: {
            contains: search,
            mode: 'insensitive'
          }
        };
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await db.subscription.count({
      where: {
        ...whereConditions,
        user: userConditions
      }
    });

    // Fetch subscriptions with related data
    const subscriptions = await db.subscription.findMany({
      where: {
        ...whereConditions,
        user: userConditions
      },
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            email: true,
            first_name: true,
            last_name: true,
            verified: true,
            lastLogin: true,
            bots: {
              select: {
                id: true,
                bot_name: true
              }
            }
          }
        },
        subscription_items: true
      },
      skip,
      take: limit,
      orderBy: {
        updated_at: 'desc'
      }
    });

    // Get subscription stats
    const stats = await getSubscriptionStats();

    // Get pending/problem subscriptions
    const problemSubscriptions = await db.subscription.findMany({
      where: {
        OR: [
          { status: 'PAST_DUE' },
          { status: 'INCOMPLETE' },
          { status: 'UNPAID' }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true
          }
        }
      },
      take: 5,
      orderBy: {
        updated_at: 'desc'
      }
    });

    return NextResponse.json({
      subscriptions,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      },
      stats,
      problemSubscriptions
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching subscription data:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription data" },
      { status: 500 }
    );
  }
}

// Helper function to get subscription statistics
async function getSubscriptionStats() {
  // Get total counts by plan type
  const planStats = await db.subscription.groupBy({
    by: ['plan_type'],
    where: {
      status: 'ACTIVE'
    },
    _count: {
      id: true
    }
  });

  // Get total counts by status
  const statusStats = await db.subscription.groupBy({
    by: ['status'],
    _count: {
      id: true
    }
  });

  // Get total revenue calculation (this is a placeholder - in real app this might be more complex)
  // Here we're simplifying by counting subscription items
  const activeSubscriptions = await db.subscription.count({
    where: {
      status: 'ACTIVE'
    }
  });

  const basicPlans = await db.subscription.count({
    where: {
      status: 'ACTIVE',
      plan_type: 'BASIC'
    }
  });

  const proPlans = await db.subscription.count({
    where: {
      status: 'ACTIVE',
      plan_type: 'PRO'
    }
  });

  // Format the plan stats into a more usable structure
  const formattedPlanStats = {
    FREE: 0,
    BASIC: 0,
    PRO: 0
  };

  planStats.forEach(stat => {
    formattedPlanStats[stat.plan_type] = stat._count.id;
  });

  // Format the status stats into a more usable structure
  const formattedStatusStats = {
    ACTIVE: 0,
    PAST_DUE: 0,
    CANCELED: 0,
    INCOMPLETE: 0,
    INCOMPLETE_EXPIRED: 0,
    TRIALING: 0,
    UNPAID: 0
  };

  statusStats.forEach(stat => {
    formattedStatusStats[stat.status] = stat._count.id;
  });

  return {
    totalActive: activeSubscriptions,
    byPlan: formattedPlanStats,
    byStatus: formattedStatusStats,
    // Simplified revenue calculation - in real app you would use actual price data
    estimatedMonthlyRevenue: (basicPlans * 15) + (proPlans * 39) // Assuming $15 for Basic and $39 for Pro
  };
}