import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: {
        status: 'APPROVED',
        deletedAt: null,
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 10,
      select: {
        id: true,
        authorName: true,
        authorTitle: true,
        authorCompany: true,
        authorAvatar: true,
        content: true,
        rating: true,
        isVerified: true,
        isFeatured: true,
        publishedAt: true,
      },
    });

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}