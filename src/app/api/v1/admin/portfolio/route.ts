import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const portfolioQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  sort: z.string().default('sortOrder'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export async function GET(request: Request) {
  const { error } = await requirePermission('vps:read');
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const params = portfolioQuerySchema.parse(Object.fromEntries(searchParams));

    const page = params.page;
    const limit = params.limit;
    const skip = (page - 1) * limit;
    const search = params.search || '';
    const categoryId = params.categoryId || '';
    const isActive = params.isActive;
    const isFeatured = params.isFeatured;
    const sort = params.sort;
    const order = params.order;

    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { slug: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(isActive !== undefined && { isActive }),
      ...(isFeatured !== undefined && { isFeatured }),
    };

    const [items, total, categories] = await Promise.all([
      prisma.portfolioItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: { category: { select: { id: true, name: true, slug: true } } },
      }),
      prisma.portfolioItem.count({ where }),
      prisma.portfolioCategory.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: { id: true, name: true, slug: true },
      }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      categories,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Get portfolio error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch portfolio' } },
      { status: 500 }
    );
  }
}

const createPortfolioSchema = z.object({
  categoryId: z.string().cuid(),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  content: z.string().optional(),
  image: z.string().url().optional().nullable(),
  url: z.string().url().optional().nullable(),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export async function POST(request: Request) {
  const { user, error } = await requirePermission('vps:write');
  if (error) return error;

  try {
    const body = await request.json();
    const data = createPortfolioSchema.parse(body);

    const existingItem = await prisma.portfolioItem.findUnique({
      where: { slug: data.slug },
    });

    if (existingItem) {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'Portfolio item with this slug already exists' } },
        { status: 409 }
      );
    }

    const item = await prisma.portfolioItem.create({
      data: {
        ...data,
        image: data.image || null,
        url: data.url || null,
        publishedAt: data.isActive ? new Date() : null,
      },
      include: { category: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PORTFOLIO_ITEM_CREATED',
        entity: 'PortfolioItem',
        entityId: item.id,
        newData: { title: item.title, slug: item.slug, categoryId: item.categoryId },
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Create portfolio item error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create portfolio item' } },
      { status: 500 }
    );
  }
}