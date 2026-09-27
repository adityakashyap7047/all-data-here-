import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createMessageSchema = z.object({
  message: z.string().min(1),
  isStaff: z.boolean().default(true),
  attachments: z.array(z.string()).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requirePermission('tickets:write');
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const data = createMessageSchema.parse(body);

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Ticket not found' } },
        { status: 404 }
      );
    }

    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: id,
        userId: user.id,
        message: data.message,
        isStaff: data.isStaff,
        attachments: data.attachments || [],
      },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    await prisma.ticket.update({
      where: { id },
      data: {
        status: data.isStaff ? 'WAITING_CUSTOMER' : 'WAITING_STAFF',
        updatedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'TICKET_MESSAGE_CREATED',
        entity: 'TicketMessage',
        entityId: message.id,
        newData: { ticketId: id, isStaff: data.isStaff },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Create ticket message error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create message' } },
      { status: 500 }
    );
  }
}