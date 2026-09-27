import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const ticketQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  category: z.string().optional(),
  assignedTo: z.string().optional(),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export async function GET(request: Request) {
  const { error } = await requirePermission('tickets:read');
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const params = ticketQuerySchema.parse(Object.fromEntries(searchParams));

    const page = params.page;
    const limit = params.limit;
    const skip = (page - 1) * limit;
    const search = params.search || '';
    const status = params.status || '';
    const priority = params.priority || '';
    const category = params.category || '';
    const assignedTo = params.assignedTo || '';
    const sort = params.sort;
    const order = params.order;

    const where = {
      ...(search && {
        OR: [
          { subject: { contains: search, mode: 'insensitive' as const } },
          { user: { email: { contains: search, mode: 'insensitive' as const } } },
          { user: { name: { contains: search, mode: 'insensitive' as const } } },
        ],
      }),
      ...(status && { status: status as any }),
      ...(priority && { priority: priority as any }),
      ...(category && { category: category as any }),
      ...(assignedTo && assignedTo !== 'unassigned' && { assignedTo }),
      ...(assignedTo === 'unassigned' && { assignedTo: null }),
    };

    const [tickets, total, staff] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          user: { select: { id: true, email: true, name: true } },
          assignedToUser: { select: { id: true, email: true, name: true } },
          _count: { select: { messages: true } },
          messages: { take: 1, orderBy: { createdAt: 'desc' }, select: { message: true, createdAt: true, isStaff: true } },
        },
      }),
      prisma.ticket.count({ where }),
      prisma.user.findMany({
        where: { role: { in: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'] } },
        select: { id: true, email: true, name: true },
      }),
    ]);

    return NextResponse.json({
      tickets,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      staff,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Get tickets error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch tickets' } },
      { status: 500 }
    );
  }
}