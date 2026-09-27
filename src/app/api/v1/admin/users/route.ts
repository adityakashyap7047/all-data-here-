import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validateSortField, validateOrder } from '@/lib/utils/security';

const userQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  search: z.string().optional(),
  role: z.string().optional(),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export async function GET(request: Request) {
  const { user, error } = await requirePermission('users:read');
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const params = userQuerySchema.parse(Object.fromEntries(searchParams));

    const page = params.page;
    const limit = params.limit;
    const skip = (page - 1) * limit;
    const search = params.search || '';
    const role = params.role || '';
    const sort = validateSortField('user', params.sort);
    const order = validateOrder(params.order);

    const where = {
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { name: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(role && { role: role as any }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          twoFactorEnabled: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { vpsInstances: true, orders: true, tickets: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
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
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch users' } },
      { status: 500 }
    );
  }
}

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100).optional(),
  password: z.string().min(8).max(100),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'BILLING', 'CUSTOMER', 'API']).default('CUSTOMER'),
});

export async function POST(request: Request) {
  const { user, error } = await requirePermission('users:write');
  if (error) return error;

  try {
    const body = await request.json();
    const data = createUserSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'User with this email already exists' } },
        { status: 409 }
      );
    }

    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(data.password, 12);

    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        role: data.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_CREATED',
        entity: 'User',
        entityId: newUser.id,
        newData: { email: newUser.email, role: newUser.role },
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create user' } },
      { status: 500 }
    );
  }
}