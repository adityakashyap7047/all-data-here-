import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional().nullable(),
  icon: z.string().optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
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
    const data = updateCategorySchema.parse(body);

    const existingCategory = await prisma.portfolioCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Category not found' } },
        { status: 404 }
      );
    }

    if (data.slug && data.slug !== existingCategory.slug) {
      const slugExists = await prisma.portfolioCategory.findUnique({
        where: { slug: data.slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: { code: 'CONFLICT', message: 'Category with this slug already exists' } },
          { status: 409 }
        );
      }
    }

    const updatedCategory = await prisma.portfolioCategory.update({
      where: { id },
      data: {
        ...data,
        icon: data.icon ?? existingCategory.icon,
        color: data.color ?? existingCategory.color,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PORTFOLIO_CATEGORY_UPDATED',
        entity: 'PortfolioCategory',
        entityId: id,
        oldData: existingCategory,
        newData: updatedCategory,
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Update category error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update category' } },
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

    const existingCategory = await prisma.portfolioCategory.findUnique({
      where: { id },
      include: { _count: { select: { items: true } } },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Category not found' } },
        { status: 404 }
      );
    }

    if (existingCategory._count.items > 0) {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'Cannot delete category with existing items' } },
        { status: 409 }
      );
    }

    await prisma.portfolioCategory.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PORTFOLIO_CATEGORY_DELETED',
        entity: 'PortfolioCategory',
        entityId: id,
        oldData: { name: existingCategory.name, slug: existingCategory.slug },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete category' } },
      { status: 500 }
    );
  }
}