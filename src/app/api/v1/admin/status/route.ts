import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { error } = await requirePermission('vps:read');
  if (error) return error;

  try {
    const [services, incidents] = await Promise.all([
      prisma.statusPageService.findMany({
        orderBy: { sortOrder: 'asc' },
        include: {
          _count: { select: { incidents: true } },
          incidents: {
            where: { status: { in: ['investigating', 'identified', 'monitoring'] } },
            orderBy: { startedAt: 'desc' },
            take: 5,
          },
        },
      }),
      prisma.statusIncident.findMany({
        where: { status: { in: ['investigating', 'identified', 'monitoring', 'resolved'] } },
        orderBy: { startedAt: 'desc' },
        take: 10,
        include: { service: true, updates: { orderBy: { createdAt: 'desc' }, take: 3 } },
      }),
    ]);

    return NextResponse.json({ services, incidents });
  } catch (error) {
    console.error('Get status data error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch status data' } },
      { status: 500 }
    );
  }
}