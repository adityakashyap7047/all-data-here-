import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const faqQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  sort: z.string().default('sortOrder'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export async function GET(request: Request) {
  const { error } = await requirePermission('vps:read');
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const params = faqQuerySchema.parse(Object.fromEntries(searchParams));

    const page = params.page;
    const limit = params.limit;
    const skip = (page - 1) * limit;
    const search = params.search || '';
    const category = params.category || '';
    const isActive = params.isActive;
    const sort = params.sort;
    const order = params.order;

    const where = {
      ...(search && {
        OR: [
          { question: { contains: search, mode: 'insensitive' as const } },
          { answer: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(category && { category }),
      ...(isActive !== undefined && { isActive }),
    };

    const [faqs, total, categories] = await Promise.all([
      prisma.fAQ.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
      }),
      prisma.fAQ.count({ where }),
      prisma.fAQ.groupBy({
        by: ['category'],
        where: { isActive: true },
        _count: true,
      }),
    ]);

    return NextResponse.json({
      faqs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      categories: categories.map(c => c.category),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Get FAQs error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch FAQs' } },
      { status: 500 }
    );
  }
}

const createFAQSchema = z.object({
  question: z.string().min(1).max(500),
  answer: z.string().min(1),
  category: z.string().min(1).max(100),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function POST(request: Request) {
  const { user, error } = await requirePermission('vps:write');
  if (error) return error;

  try {
    const body = await request.json();
    const data = createFAQSchema.parse(body);

    const faq = await prisma.fAQ.create({
      data,
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'FAQ_CREATED',
        entity: 'FAQ',
        entityId: faq.id,
        newData: { question: faq.question, category: faq.category },
      },
    });

    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Create FAQ error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create FAQ' } },
      { status: 500 }
    );
  }
}