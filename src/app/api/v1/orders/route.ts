import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateOrderNumber } from '@/lib/utils';

const createOrderSchema = z.object({
  items: z.array(z.object({
    type: z.enum(['VPS_PLAN', 'ADDON', 'DOMAIN', 'SSL_CERTIFICATE', 'BACKUP_SERVICE', 'MANAGED_SERVICE']),
    name: z.string().min(1),
    description: z.string().optional(),
    quantity: z.number().int().positive().default(1),
    unitPrice: z.number().positive(),
    metadata: z.record(z.unknown()).optional(),
  })).min(1),
  currency: z.string().default('USD'),
  notes: z.string().max(2000).optional(),
});

export async function POST(request: Request) {
  const { user, error } = await requirePermission('orders:write');
  if (error) return error;

  try {
    const body = await request.json();
    const data = createOrderSchema.parse(body);

    let subtotal = 0;
    for (const item of data.items) {
      subtotal += item.unitPrice * item.quantity;
    }

    const tax = subtotal * 0;
    const total = subtotal + tax;

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        orderNumber: generateOrderNumber(),
        status: 'PENDING',
        subtotal,
        tax,
        total,
        currency: data.currency,
        notes: data.notes,
        items: {
          create: data.items.map(item => ({
            type: item.type,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
            metadata: item.metadata as any,
          })),
        },
      },
      include: { items: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'ORDER_CREATED',
        entity: 'Order',
        entityId: order.id,
        newData: { orderNumber: order.orderNumber, total: Number(order.total), itemCount: order.items.length },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create order' } },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { user, error } = await requirePermission('orders:read');
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const status = searchParams.get('status');
    const orderId = searchParams.get('orderId');

    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true, invoices: true },
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
    }

    const where = {
      ...(user.role === 'CUSTOMER' && { userId: user.id }),
      ...(status && { status: status as any }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: true, _count: { select: { invoices: true } } },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch orders' } },
      { status: 500 }
    );
  }
}