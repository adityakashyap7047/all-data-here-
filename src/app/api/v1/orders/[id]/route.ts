import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validateSortField, validateOrder } from '@/lib/utils/security';

const updateOrderSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED', 'FAILED']).optional(),
  notes: z.string().max(2000).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requirePermission('orders:read');
  if (error) return error;

  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, invoices: true, user: { select: { id: true, email: true, name: true } } },
    });

    if (!order) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      );
    }

    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'BILLING', 'SUPPORT'].includes(user.role);
    if (order.userId !== user.id && !isAdmin) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Not authorized to view this order' } },
        { status: 403 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch order' } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requirePermission('orders:write');
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateOrderSchema.parse(body);

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: data.status,
        notes: data.notes,
        ...(data.status === 'COMPLETED' && { paidAt: new Date() }),
      },
      include: { items: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'ORDER_UPDATED',
        entity: 'Order',
        entityId: id,
        oldData: { status: order.status },
        newData: { status: data.status },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update order' } },
      { status: 500 }
    );
  }
}