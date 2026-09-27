import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const updateVpsSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  hostname: z.string().min(3).max(64).regex(/^[a-zA-Z0-9-]+$/).optional(),
  osTemplate: z.string().optional(),
  backupEnabled: z.boolean().optional(),
  monitoringEnabled: z.boolean().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requirePermission('vps:read');
  if (error) return error;

  try {
    const { id } = await params;

    const instance = await prisma.vPSInstance.findUnique({
      where: { id },
      include: {
        plan: true,
        backups: { orderBy: { createdAt: 'desc' }, take: 10 },
        actions: { orderBy: { createdAt: 'desc' }, take: 20 },
        metrics: { orderBy: { timestamp: 'desc' }, take: 100 },
      },
    });

    if (!instance) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'VPS not found' } },
        { status: 404 }
      );
    }

    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'BILLING'].includes(user.role);
    if (instance.userId !== user.id && !isAdmin) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Not authorized to view this VPS' } },
        { status: 403 }
      );
    }

    return NextResponse.json(instance);
  } catch (error) {
    console.error('Get VPS error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch VPS' } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requirePermission('vps:write');
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateVpsSchema.parse(body);

    const instance = await prisma.vPSInstance.findUnique({
      where: { id },
    });

    if (!instance) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'VPS not found' } },
        { status: 404 }
      );
    }

    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'BILLING'].includes(user.role);
    if (instance.userId !== user.id && !isAdmin) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Not authorized to update this VPS' } },
        { status: 403 }
      );
    }

    if (data.hostname && data.hostname !== instance.hostname) {
      const existing = await prisma.vPSInstance.findFirst({
        where: { hostname: data.hostname.toLowerCase(), NOT: { id } },
      });
      if (existing) {
        return NextResponse.json(
          { error: { code: 'CONFLICT', message: 'Hostname already in use' } },
          { status: 409 }
        );
      }
    }

    const updatedInstance = await prisma.vPSInstance.update({
      where: { id },
      data,
      include: { plan: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'VPS_UPDATED',
        entity: 'VPSInstance',
        entityId: id,
        oldData: instance,
        newData: updatedInstance,
      },
    });

    return NextResponse.json(updatedInstance);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Update VPS error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update VPS' } },
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

    const instance = await prisma.vPSInstance.findUnique({
      where: { id },
    });

    if (!instance) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'VPS not found' } },
        { status: 404 }
      );
    }

    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'BILLING'].includes(user.role);
    if (instance.userId !== user.id && !isAdmin) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Not authorized to delete this VPS' } },
        { status: 403 }
      );
    }

    await prisma.vPSInstance.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'VPS_DELETED',
        entity: 'VPSInstance',
        entityId: id,
        oldData: { name: instance.name, hostname: instance.hostname },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete VPS error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete VPS' } },
      { status: 500 }
    );
  }
}