import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validateSortField, validateOrder } from '@/lib/utils/security';

const planQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  sort: z.string().default('sortOrder'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export async function GET(request: Request) {
  const { error } = await requirePermission('vps:read');
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const params = planQuerySchema.parse(Object.fromEntries(searchParams));

    const page = params.page;
    const limit = params.limit;
    const skip = (page - 1) * limit;
    const search = params.search || '';
    const isActive = params.isActive;
    const sort = validateSortField('plan', params.sort);
    const order = validateOrder(params.order);

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { slug: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(isActive !== undefined && { isActive }),
    };

    const [plans, total] = await Promise.all([
      prisma.vPSPlan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          _count: { select: { instances: true } },
        },
      }),
      prisma.vPSPlan.count({ where }),
    ]);

    return NextResponse.json({
      plans,
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
    console.error('Get plans error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch plans' } },
      { status: 500 }
    );
  }
}

const createPlanSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().max(1000).optional(),
  cpu: z.number().int().positive(),
  ram: z.number().int().positive(),
  storage: z.number().int().positive(),
  bandwidth: z.number().int().positive(),
  ipv4Count: z.number().int().min(0).default(1),
  ipv6Count: z.number().int().min(0).default(1),
  priceMonthly: z.number().positive(),
  priceYearly: z.number().positive().optional(),
  features: z.array(z.string()).default([]),
  location: z.string().min(1),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export async function POST(request: Request) {
  const { user, error } = await requirePermission('vps:write');
  if (error) return error;

  try {
    const body = await request.json();
    const data = createPlanSchema.parse(body);

    const existingPlan = await prisma.vPSPlan.findUnique({
      where: { slug: data.slug },
    });

    if (existingPlan) {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'Plan with this slug already exists' } },
        { status: 409 }
      );
    }

    const plan = await prisma.vPSPlan.create({
      data: {
        ...data,
        priceMonthly: data.priceMonthly,
        priceYearly: data.priceYearly,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PLAN_CREATED',
        entity: 'VPSPlan',
        entityId: plan.id,
        newData: { name: plan.name, slug: plan.slug },
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Create plan error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create plan' } },
      { status: 500 }
    );
  }
}