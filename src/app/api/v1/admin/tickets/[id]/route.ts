import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const updateTicketSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'WAITING_STAFF', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL']).optional(),
  assignedTo: z.string().cuid().optional().nullable(),
  category: z.enum(['GENERAL', 'BILLING', 'TECHNICAL', 'VPS', 'NETWORK', 'SECURITY', 'ABUSE', 'SALES', 'FEATURE_REQUEST']).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requirePermission('tickets:read');
  if (error) return error;

  try {
    const { id } = await params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true } },
        assignedToUser: { select: { id: true, email: true, name: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { user: { select: { id: true, email: true, name: true } } },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Ticket not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Get ticket error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch ticket' } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requirePermission('tickets:write');
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateTicketSchema.parse(body);

    const existingTicket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!existingTicket) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Ticket not found' } },
        { status: 404 }
      );
    }

    const updateData: any = { ...data };
    if (data.status === 'RESOLVED' && existingTicket.status !== 'RESOLVED') {
      updateData.closedAt = new Date();
    } else if (data.status === 'CLOSED' && existingTicket.status !== 'CLOSED') {
      updateData.closedAt = new Date();
    } else if (data.status && data.status !== 'RESOLVED' && data.status !== 'CLOSED') {
      updateData.closedAt = null;
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, email: true, name: true } },
        assignedToUser: { select: { id: true, email: true, name: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'TICKET_UPDATED',
        entity: 'Ticket',
        entityId: id,
        oldData: existingTicket,
        newData: updatedTicket,
      },
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Update ticket error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update ticket' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requirePermission('tickets:delete');
  if (error) return error;

  try {
    const { id } = await params;

    const existingTicket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!existingTicket) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Ticket not found' } },
        { status: 404 }
      );
    }

    await prisma.ticket.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'TICKET_DELETED',
        entity: 'Ticket',
        entityId: id,
        oldData: { subject: existingTicket.subject, status: existingTicket.status },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete ticket error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete ticket' } },
      { status: 500 }
    );
  }
}