// app/api/admin/clients/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Check if user is admin - bypass verification for admins
  if (session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
  }
  
  try {
    // Get query parameters for searching
    const searchType = request.nextUrl.searchParams.get('searchType') || '';
    const searchQuery = request.nextUrl.searchParams.get('query') || '';
    
    // Base query
    let whereClause: any = {};
    
    // Apply search if provided
    if (searchQuery && searchType) {
      if (searchType === 'id') {
        whereClause = {
          id: {
            contains: searchQuery
          }
        };
      } else if (searchType === 'email') {
        whereClause = {
          OR: [
            {
              creator: {
                email: {
                  contains: searchQuery,
                  mode: 'insensitive'
                }
              }
            }
          ]
        };
      }
    }
    
    // For admins, fetch bots (treated as clients)
    const bots = await db.bot.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            userId: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true,
            subscription: {
              select: {
                plan_type: true,
                status: true
              }
            }
          }
        },
        appearance: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    // Transform to client format
    const clients = bots.map(bot => ({
      id: bot.id,
      name: bot.bot_name,
      industry: bot.company_type || 'Not specified',
      size: bot.company_size || 'Not specified',
      subscriptionPlan: bot.creator.subscription?.plan_type || 'FREE',
      status: bot.appearance?.[0]?.branding_enabled ? 'Active' : 'Inactive',
      contactEmail: bot.creator.email,
      users: [
        {
          id: bot.creator.userId,
          name: `${bot.creator.first_name || ''} ${bot.creator.last_name || ''}`.trim() || 'Unnamed User',
          email: bot.creator.email,
          role: bot.creator.role === 'ADMIN' ? 'Admin' : 'User'
        }
      ]
    }));
    
    return NextResponse.json({ clients });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

// Add search endpoint
export async function POST(request: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Check if user is admin
  if (session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
  }
  
  try {
    const body = await request.json();
    const { searchType, searchQuery } = body;
    
    if (!searchQuery) {
      return NextResponse.json({ clients: [] });
    }
    
    // Search query
    let whereClause: any = {};
    
    if (searchType === 'id') {
      whereClause = {
        id: {
          contains: searchQuery
        }
      };
    } else if (searchType === 'email') {
      whereClause = {
        OR: [
          {
            creator: {
              email: {
                contains: searchQuery,
                mode: 'insensitive'
              }
            }
          }
        ]
      };
    }
    
    const bots = await db.bot.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            userId: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true,
            subscription: {
              select: {
                plan_type: true,
                status: true
              }
            }
          }
        },
        appearance: true
      }
    });
    
    const clients = bots.map(bot => ({
      id: bot.id,
      name: bot.bot_name,
      industry: bot.company_type || 'Not specified',
      size: bot.company_size || 'Not specified',
      subscriptionPlan: bot.creator.subscription?.plan_type || 'FREE',
      status: bot.appearance?.[0]?.branding_enabled ? 'Active' : 'Inactive',
      contactEmail: bot.creator.email,
      users: [
        {
          id: bot.creator.userId,
          name: `${bot.creator.first_name || ''} ${bot.creator.last_name || ''}`.trim() || 'Unnamed User',
          email: bot.creator.email,
          role: bot.creator.role === 'ADMIN' ? 'Admin' : 'User'
        }
      ]
    }));
    
    return NextResponse.json({ clients });
  } catch (error) {
    console.error("Error searching clients:", error);
    return NextResponse.json(
      { error: "Failed to search clients" },
      { status: 500 }
    );
  }
}