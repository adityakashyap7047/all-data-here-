import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const updateFAQSchema = z.object({
  question: z.string().min(1).max(500).optional(),
  answer: z.string().min(1).optional(),
  category: z.string().min(1).max(100).optional(),
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
    const data = updateFAQSchema.parse(body);

    const existingFAQ = await prisma.fAQ.findUnique({
      where: { id },
    });

    if (!existingFAQ) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'FAQ not found' } },
        { status: 404 }
      );
    }

    const updatedFAQ = await prisma.fAQ.update({
      where: { id },
      data,
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'FAQ_UPDATED',
        entity: 'FAQ',
        entityId: id,
        oldData: existingFAQ,
        newData: updatedFAQ,
      },
    });

    return NextResponse.json(updatedFAQ);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Update FAQ error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update FAQ' } },
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

    const existingFAQ = await prisma.fAQ.findUnique({
      where: { id },
    });

    if (!existingFAQ) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'FAQ not found' } },
        { status: 404 }
      );
    }

    await prisma.fAQ.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'FAQ_DELETED',
        entity: 'FAQ',
        entityId: id,
        oldData: { question: existingFAQ.question, category: existingFAQ.category },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete FAQ' } },
      { status: 500 }
    );
  }
}