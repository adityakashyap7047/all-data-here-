import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const auditLogQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(200).default(50),
  search: z.string().optional(),
  action: z.string().optional(),
  entity: z.string().optional(),
  userId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export async function GET(request: Request) {
  const { error } = await requirePermission('audit:read');
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const params = auditLogQuerySchema.parse(Object.fromEntries(searchParams));

    const page = params.page;
    const limit = params.limit;
    const skip = (page - 1) * limit;
    const search = params.search || '';
    const action = params.action || '';
    const entity = params.entity || '';
    const userId = params.userId || '';
    const dateFrom = params.dateFrom ? new Date(params.dateFrom) : undefined;
    const dateTo = params.dateTo ? new Date(params.dateTo) : undefined;
    const sort = params.sort;
    const order = params.order;

    const where = {
      ...(search && {
        OR: [
          { action: { contains: search, mode: 'insensitive' as const } },
          { entity: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(action && { action: { contains: action, mode: 'insensitive' as const } }),
      ...(entity && { entity: { contains: entity, mode: 'insensitive' as const } }),
      ...(userId && { userId }),
      ...(dateFrom && { createdAt: { gte: dateFrom } }),
      ...(dateTo && { createdAt: { lte: dateTo } }),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          user: { select: { id: true, email: true, name: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Get audit logs error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch audit logs' } },
      { status: 500 }
    );
  }
}