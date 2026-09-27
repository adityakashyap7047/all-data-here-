import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const updateServiceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional().nullable(),
  status: z.enum(['operational', 'degraded_performance', 'partial_outage', 'major_outage', 'maintenance']).optional(),
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
    const data = updateServiceSchema.parse(body);

    const existingService = await prisma.statusPageService.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Service not found' } },
        { status: 404 }
      );
    }

    if (data.slug && data.slug !== existingService.slug) {
      const slugExists = await prisma.statusPageService.findUnique({
        where: { slug: data.slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: { code: 'CONFLICT', message: 'Service with this slug already exists' } },
          { status: 409 }
        );
      }
    }

    const updatedService = await prisma.statusPageService.update({
      where: { id },
      data,
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'STATUS_SERVICE_UPDATED',
        entity: 'StatusPageService',
        entityId: id,
        oldData: existingService,
        newData: updatedService,
      },
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Update service error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update service' } },
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

    const existingService = await prisma.statusPageService.findUnique({
      where: { id },
      include: { _count: { select: { incidents: true } } },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Service not found' } },
        { status: 404 }
      );
    }

    if (existingService._count.incidents > 0) {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'Cannot delete service with existing incidents' } },
        { status: 409 }
      );
    }

    await prisma.statusPageService.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'STATUS_SERVICE_DELETED',
        entity: 'StatusPageService',
        entityId: id,
        oldData: { name: existingService.name, slug: existingService.slug },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete service error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete service' } },
      { status: 500 }
    );
  }
}