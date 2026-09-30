import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validateSortField, validateOrder } from '@/lib/utils/security';

const vpsQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  status: z.string().optional(),
  search: z.string().optional(),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export async function GET(request: Request) {
  const { user, error } = await requirePermission('vps:read');
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const params = vpsQuerySchema.parse(Object.fromEntries(searchParams));

    const page = params.page;
    const limit = params.limit;
    const skip = (page - 1) * limit;
    const status = params.status;
    const search = params.search || '';
    const sort = validateSortField('vps', params.sort);
    const order = validateOrder(params.order);

    const where = {
      ...(user.role === 'CUSTOMER' && { userId: user.id }),
      ...(status && { status: status as any }),
      ...(search && {
        OR: [
          { hostname: { contains: search, mode: 'insensitive' as const } },
          { ipv4Address: { contains: search } },
        ],
      }),
    };

    const [instances, total] = await Promise.all([
      prisma.vPSInstance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          plan: { select: { name: true, cpu: true, ram: true, storage: true } },
          _count: { select: { backups: true } },
        },
      }),
      prisma.vPSInstance.count({ where }),
    ]);

    return NextResponse.json({
      instances,
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
    console.error('Get VPS instances error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch VPS instances' } },
      { status: 500 }
    );
  }
}

const createVpsSchema = z.object({
  planId: z.string().cuid(),
  hostname: z.string().min(3).max(64).regex(/^[a-zA-Z0-9-]+$/),
  osTemplate: z.string().min(1),
  sshKeyId: z.string().optional(),
  billingCycle: z.enum(['monthly', 'yearly']),
});

export async function POST(request: Request) {
  const { user, error } = await requirePermission('vps:write');
  if (error) return error;

  try {
    const body = await request.json();
    const data = createVpsSchema.parse(body);

    const plan = await prisma.vPSPlan.findUnique({
      where: { id: data.planId },
    });

    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Plan not found or inactive' } },
        { status: 404 }
      );
    }

    const hostname = data.hostname.toLowerCase();
    const existingVps = await prisma.vPSInstance.findFirst({
      where: { hostname },
    });

    if (existingVps) {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'Hostname already in use' } },
        { status: 409 }
      );
    }

    const rootPassword = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0')).join('');

    const instance = await prisma.vPSInstance.create({
      data: {
        userId: user.id,
        planId: plan.id,
        hostname,
        rootPassword,
        osTemplate: data.osTemplate,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      include: { plan: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'VPS_CREATED',
        entity: 'VPSInstance',
        entityId: instance.id,
        newData: { hostname: instance.hostname, planId: plan.id, osTemplate: data.osTemplate },
      },
    });

    return NextResponse.json(instance, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Create VPS error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create VPS' } },
      { status: 500 }
    );
  }
}