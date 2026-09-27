import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const updatePortfolioSchema = z.object({
  categoryId: z.string().cuid().optional(),
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional().nullable(),
  content: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
  url: z.string().url().optional().nullable(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requirePermission('vps:write');
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const data = updatePortfolioSchema.parse(body);

    const existingItem = await prisma.portfolioItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Portfolio item not found' } },
        { status: 404 }
      );
    }

    if (data.slug && data.slug !== existingItem.slug) {
      const slugExists = await prisma.portfolioItem.findUnique({
        where: { slug: data.slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: { code: 'CONFLICT', message: 'Portfolio item with this slug already exists' } },
          { status: 409 }
        );
      }
    }

    const updateData = {
      ...data,
      image: data.image ?? existingItem.image,
      url: data.url ?? existingItem.url,
      ...(data.isActive === true && !existingItem.isActive && { publishedAt: new Date() }),
    };

    const updatedItem = await prisma.portfolioItem.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PORTFOLIO_ITEM_UPDATED',
        entity: 'PortfolioItem',
        entityId: id,
        oldData: existingItem,
        newData: updatedItem,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Update portfolio item error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update portfolio item' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requirePermission('vps:delete');
  if (error) return error;

  try {
    const { id } = await params;

    const existingItem = await prisma.portfolioItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Portfolio item not found' } },
        { status: 404 }
      );
    }

    await prisma.portfolioItem.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PORTFOLIO_ITEM_DELETED',
        entity: 'PortfolioItem',
        entityId: id,
        oldData: { title: existingItem.title, slug: existingItem.slug },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete portfolio item error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete portfolio item' } },
      { status: 500 }
    );
  }
}