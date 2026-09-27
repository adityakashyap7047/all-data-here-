import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validateSortField, validateOrder } from '@/lib/utils/security';

const updatePlanSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(1000).optional(),
  cpu: z.number().int().positive().optional(),
  ram: z.number().int().positive().optional(),
  storage: z.number().int().positive().optional(),
  bandwidth: z.number().int().positive().optional(),
  ipv4Count: z.number().int().min(0).optional(),
  ipv6Count: z.number().int().min(0).optional(),
  priceMonthly: z.number().positive().optional(),
  priceYearly: z.number().positive().optional().nullable(),
  features: z.array(z.string()).optional(),
  location: z.string().min(1).optional(),
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
    const data = updatePlanSchema.parse(body);

    const existingPlan = await prisma.vPSPlan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Plan not found' } },
        { status: 404 }
      );
    }

    if (data.slug && data.slug !== existingPlan.slug) {
      const slugExists = await prisma.vPSPlan.findUnique({
        where: { slug: data.slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: { code: 'CONFLICT', message: 'Plan with this slug already exists' } },
          { status: 409 }
        );
      }
    }

    const updatedPlan = await prisma.vPSPlan.update({
      where: { id },
      data,
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PLAN_UPDATED',
        entity: 'VPSPlan',
        entityId: id,
        oldData: existingPlan,
        newData: updatedPlan,
      },
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Update plan error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update plan' } },
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

    const existingPlan = await prisma.vPSPlan.findUnique({
      where: { id },
      include: { _count: { select: { instances: true } } },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Plan not found' } },
        { status: 404 }
      );
    }

    if (existingPlan._count.instances > 0) {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'Cannot delete plan with active instances' } },
        { status: 409 }
      );
    }

    await prisma.vPSPlan.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PLAN_DELETED',
        entity: 'VPSPlan',
        entityId: id,
        oldData: { name: existingPlan.name, slug: existingPlan.slug },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete plan error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete plan' } },
      { status: 500 }
    );
  }
}