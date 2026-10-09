import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const announcements = await prisma.announcement.findMany({
      where: {
        status: 'PUBLISHED',
        isPublic: true,
        deletedAt: null,
        OR: [
          { startDate: null },
          { startDate: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      orderBy: [
        { isPinned: 'desc' },
        { priority: 'desc' },
        { publishedAt: 'desc' },
      ],
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        type: true,
        priority: true,
        isPinned: true,
        startDate: true,
        endDate: true,
        publishedAt: true,
      },
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}