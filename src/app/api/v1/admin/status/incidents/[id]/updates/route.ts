import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createUpdateSchema = z.object({
  message: z.string().min(1),
  status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requirePermission('vps:write');
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const data = createUpdateSchema.parse(body);

    const incident = await prisma.statusIncident.findUnique({
      where: { id },
    });

    if (!incident) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Incident not found' } },
        { status: 404 }
      );
    }

    const update = await prisma.statusIncidentUpdate.create({
      data: {
        incidentId: id,
        message: data.message,
        status: data.status,
      },
    });

    await prisma.statusIncident.update({
      where: { id },
      data: { status: data.status, ...(data.status === 'resolved' && { resolvedAt: new Date() }) },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'STATUS_INCIDENT_UPDATE_CREATED',
        entity: 'StatusIncidentUpdate',
        entityId: update.id,
        newData: { incidentId: id, message: data.message, status: data.status },
      },
    });

    return NextResponse.json(update, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Create incident update error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create incident update' } },
      { status: 500 }
    );
  }
}