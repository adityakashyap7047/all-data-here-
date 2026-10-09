import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
      },
      orderBy: [
        { category: 'asc' },
        { sortOrder: 'asc' },
      ],
      select: {
        id: true,
        question: true,
        answer: true,
        category: true,
        tags: true,
        viewCount: true,
        helpfulYes: true,
        helpfulNo: true,
        publishedAt: true,
      },
    });

    // Group by category
    const grouped = faqs.reduce((acc, faq) => {
      const category = faq.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(faq);
      return acc;
    }, {} as Record<string, typeof faqs>);

    return NextResponse.json({ faqs, grouped });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}