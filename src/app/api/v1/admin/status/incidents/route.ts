import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const incidentQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  search: z.string().optional(),
  serviceId: z.string().optional(),
  status: z.string().optional(),
  severity: z.string().optional(),
  sort: z.string().default('startedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export async function GET(request: Request) {
  const { error } = await requirePermission('vps:read');
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const params = incidentQuerySchema.parse(Object.fromEntries(searchParams));

    const page = params.page;
    const limit = params.limit;
    const skip = (page - 1) * limit;
    const search = params.search || '';
    const serviceId = params.serviceId || '';
    const status = params.status || '';
    const severity = params.severity || '';
    const sort = params.sort;
    const order = params.order;

    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(serviceId && { serviceId }),
      ...(status && { status }),
      ...(severity && { severity }),
    };

    const [incidents, total] = await Promise.all([
      prisma.statusIncident.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: { service: true, updates: { orderBy: { createdAt: 'desc' }, take: 3 } },
      }),
      prisma.statusIncident.count({ where }),
    ]);

    return NextResponse.json({
      incidents,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Get incidents error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch incidents' } },
      { status: 500 }
    );
  }
}

const createIncidentSchema = z.object({
  serviceId: z.string().cuid(),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']).default('investigating'),
  severity: z.enum(['minor', 'major', 'critical']).default('minor'),
});

export async function POST(request: Request) {
  const { user, error } = await requirePermission('vps:write');
  if (error) return error;

  try {
    const body = await request.json();
    const data = createIncidentSchema.parse(body);

    const incident = await prisma.statusIncident.create({
      data: {
        ...data,
        startedAt: new Date(),
      },
      include: { service: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'STATUS_INCIDENT_CREATED',
        entity: 'StatusIncident',
        entityId: incident.id,
        newData: { title: incident.title, serviceId: incident.serviceId, status: incident.status, severity: incident.severity },
      },
    });

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Create incident error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create incident' } },
      { status: 500 }
    );
  }
}