// File: app/admin/support/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET ticket by ID
export async function GET(
  req: NextRequest,
  context: any
) {
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

  const params = await context.params;
  const id = params.botId;

  try {
    const ticket = await db.ticket.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            userId: true,
            first_name: true,
            last_name: true,
            email: true,
          }
        },
        solved_by: {
          select: {
            id: true,
            userId: true,
            first_name: true,
            last_name: true,
            email: true,
          }
        },
        bot: {
          select: {
            id: true,
            bot_name: true,
            model_type: true,
          }
        },
        ticket_comments: {
          orderBy: { created_at: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                role: true,
              }
            }
          }
        },
        ticket_attachments: {
          orderBy: { created_at: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
              }
            }
          }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { message: 'Error fetching ticket details' }, 
      { status: 500 }
    );
  }
}

// UPDATE ticket
export async function PATCH(
  req: NextRequest,
  context: any
) {
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
  const params = await context.params;
  const id = params.id;
  const data = await req.json();
  
  try {
    // First check if the ticket exists
    const ticket = await db.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    // Prepare update data
    const { title, description, status, priority, type, solved_by_id } = data;
    const updateData: any = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (type) updateData.type = type;
    if (solved_by_id !== undefined) updateData.solved_by_id = solved_by_id;

    // If status is changing to RESOLVED or CLOSED, set resolved_at
    if (status && ['RESOLVED', 'CLOSED'].includes(status) && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED') {
      updateData.resolved_at = new Date();
    }

    // Update the ticket
    const updatedTicket = await db.ticket.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          }
        },
        solved_by: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { message: 'Error updating ticket' }, 
      { status: 500 }
    );
  }
}

// DELETE ticket
export async function DELETE(
  req: NextRequest,
  context: any,
) {
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
  const params = await context.params;
  const id = params.id;
  
  try {
    const ticket = await db.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    // Delete the ticket (cascading delete will remove comments and attachments)
    await db.ticket.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json(
      { message: 'Error deleting ticket' }, 
      { status: 500 }
    );
  }
}