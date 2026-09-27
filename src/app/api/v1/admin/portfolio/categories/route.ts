import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const categoryQuerySchema = z.object({
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
    const params = categoryQuerySchema.parse(Object.fromEntries(searchParams));

    const page = params.page;
    const limit = params.limit;
    const skip = (page - 1) * limit;
    const search = params.search || '';
    const isActive = params.isActive;
    const sort = params.sort;
    const order = params.order;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { slug: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(isActive !== undefined && { isActive }),
    };

    const [categories, total] = await Promise.all([
      prisma.portfolioCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: { _count: { select: { items: true } } },
      }),
      prisma.portfolioCategory.count({ where }),
    ]);

    return NextResponse.json({
      categories,
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
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch categories' } },
      { status: 500 }
    );
  }
}

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function POST(request: Request) {
  const { user, error } = await requirePermission('vps:write');
  if (error) return error;

  try {
    const body = await request.json();
    const data = createCategorySchema.parse(body);

    const existingCategory = await prisma.portfolioCategory.findUnique({
      where: { slug: data.slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'Category with this slug already exists' } },
        { status: 409 }
      );
    }

    const category = await prisma.portfolioCategory.create({
      data,
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PORTFOLIO_CATEGORY_CREATED',
        entity: 'PortfolioCategory',
        entityId: category.id,
        newData: { name: category.name, slug: category.slug },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create category' } },
      { status: 500 }
    );
  }
}