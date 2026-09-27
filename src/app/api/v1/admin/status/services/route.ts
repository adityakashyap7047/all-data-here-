import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const serviceQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  sort: z.string().default('sortOrder'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export async function GET(request: Request) {
  const { error } = await requirePermission('vps:read');
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const params = serviceQuerySchema.parse(Object.fromEntries(searchParams));

    const page = params.page;
    const limit = params.limit;
    const skip = (page - 1) * limit;
    const search = params.search || '';
    const status = params.status || '';
    const sort = params.sort;
    const order = params.order;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { slug: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(status && { status }),
    };

    const [services, total] = await Promise.all([
      prisma.statusPageService.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: { _count: { select: { incidents: true } } },
      }),
      prisma.statusPageService.count({ where }),
    ]);

    return NextResponse.json({
      services,
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
    console.error('Get services error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch services' } },
      { status: 500 }
    );
  }
}

const createServiceSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  status: z.enum(['operational', 'degraded_performance', 'partial_outage', 'major_outage', 'maintenance']).default('operational'),
  sortOrder: z.number().int().default(0),
});

export async function POST(request: Request) {
  const { user, error } = await requirePermission('vps:write');
  if (error) return error;

  try {
    const body = await request.json();
    const data = createServiceSchema.parse(body);

    const existingService = await prisma.statusPageService.findUnique({
      where: { slug: data.slug },
    });

    if (existingService) {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'Service with this slug already exists' } },
        { status: 409 }
      );
    }

    const service = await prisma.statusPageService.create({
      data,
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'STATUS_SERVICE_CREATED',
        entity: 'StatusPageService',
        entityId: service.id,
        newData: { name: service.name, slug: service.slug, status: service.status },
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Create service error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create service' } },
      { status: 500 }
    );
  }
}