// File: app/admin/support/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Get user from session
  const user = await db.user.findUnique({
    where: { email: session.user?.email as string },
  });

  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  }

  try {
    // Get ticket counts by status
    const [
      openTickets,
      inProgressTickets,
      resolvedTickets,
      avgResponseTime,
      tickets
    ] = await Promise.all([
      // Open tickets count
      db.ticket.count({
        where: { status: 'OPEN' }
      }),
      // In Progress tickets count
      db.ticket.count({
        where: { status: 'IN_PROGRESS' }
      }),
      // Resolved tickets count
      db.ticket.count({
        where: { status: 'RESOLVED' }
      }),
      // Average response time calculation
      db.ticket.aggregate({
        where: {
          response_time: {
            not: null
          }
        },
        _avg: {
          response_time: true
        }
      }),
      // Get recent tickets for the table
      db.ticket.findMany({
        take: 10,
        orderBy: { created_at: 'desc' },
        include: {
          client: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            }
          },
          solved_by: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            }
          },
          bot: {
            select: {
              id: true,
              bot_name: true,
            }
          }
        }
      })
    ]);

    // Calculate average response time in hours
    const avgResponseTimeInSeconds = avgResponseTime._avg.response_time || 0;
    const avgResponseTimeInHours = (avgResponseTimeInSeconds / 3600).toFixed(1);

    return NextResponse.json({
      dashboard: {
        openTickets,
        inProgressTickets,
        resolvedTickets,
        avgResponseTime: avgResponseTimeInHours,
      },
      tickets
    });
  } catch (error) {
    console.error('Error fetching ticket dashboard:', error);
    return NextResponse.json(
      { message: 'Error fetching ticket data' }, 
      { status: 500 }
    );
  }
}