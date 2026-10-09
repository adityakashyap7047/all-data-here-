import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const services = await prisma.statusService.findMany({
      where: {
        isPublic: true,
        deletedAt: null,
      },
      include: {
        incidents: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            startedAt: 'desc',
          },
          take: 10,
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    // Determine overall status
    const hasMajorOutage = services.some(
      (s) => s.status === 'MAJOR_OUTAGE' || s.status === 'PARTIAL_OUTAGE'
    );
    const hasDegraded = services.some(
      (s) => s.status === 'DEGRADED_PERFORMANCE'
    );
    const hasMaintenance = services.some(
      (s) => s.status === 'UNDER_MAINTENANCE'
    );

    let overallStatus = 'OPERATIONAL';
    if (hasMajorOutage) overallStatus = 'MAJOR_OUTAGE';
    else if (hasDegraded) overallStatus = 'DEGRADED_PERFORMANCE';
    else if (hasMaintenance) overallStatus = 'UNDER_MAINTENANCE';

    const formattedServices = services.map((service) => ({
      id: service.id,
      name: service.name,
      slug: service.slug,
      description: service.description,
      status: service.status,
      incidents: service.incidents.map((incident) => ({
        id: incident.id,
        title: incident.title,
        description: incident.description,
        status: incident.status,
        impact: incident.impact,
        startedAt: incident.startedAt,
        resolvedAt: incident.resolvedAt,
      })),
    }));

    return NextResponse.json({
      overallStatus,
      services: formattedServices,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}