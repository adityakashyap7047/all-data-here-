import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const updateIncidentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']).optional(),
  severity: z.enum(['minor', 'major', 'critical']).optional(),
  resolvedAt: z.string().datetime().optional().nullable(),
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
    const data = updateIncidentSchema.parse(body);

    const existingIncident = await prisma.statusIncident.findUnique({
      where: { id },
    });

    if (!existingIncident) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Incident not found' } },
        { status: 404 }
      );
    }

    const updateData = {
      ...data,
      resolvedAt: data.resolvedAt ? new Date(data.resolvedAt) : (data.status === 'resolved' && !existingIncident.resolvedAt ? new Date() : existingIncident.resolvedAt),
    };

    const updatedIncident = await prisma.statusIncident.update({
      where: { id },
      data: updateData,
      include: { service: true, updates: { orderBy: { createdAt: 'desc' } } },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'STATUS_INCIDENT_UPDATED',
        entity: 'StatusIncident',
        entityId: id,
        oldData: existingIncident,
        newData: updatedIncident,
      },
    });

    return NextResponse.json(updatedIncident);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Update incident error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update incident' } },
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

    const existingIncident = await prisma.statusIncident.findUnique({
      where: { id },
    });

    if (!existingIncident) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Incident not found' } },
        { status: 404 }
      );
    }

    await prisma.statusIncident.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'STATUS_INCIDENT_DELETED',
        entity: 'StatusIncident',
        entityId: id,
        oldData: { title: existingIncident.title, serviceId: existingIncident.serviceId },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete incident error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete incident' } },
      { status: 500 }
    );
  }
}