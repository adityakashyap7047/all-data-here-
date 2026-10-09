import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const locations = await prisma.serverLocation.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
      },
      include: {
        plans: {
          where: {
            available: true,
            plan: {
              status: 'ACTIVE',
              deletedAt: null,
            },
          },
          include: {
            plan: {
              select: {
                id: true,
                name: true,
                slug: true,
                monthlyPriceCents: true,
                currency: true,
              },
            },
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    const formattedLocations = locations.map((location) => ({
      id: location.id,
      name: location.name,
      slug: location.slug,
      displayName: location.displayName,
      country: location.country,
      countryCode: location.countryCode,
      region: location.region,
      city: location.city,
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: location.timezone,
      isFeatured: location.isFeatured,
      networkInfo: location.networkInfo,
      features: location.features,
      plans: location.plans.map((pl) => ({
        id: pl.plan.id,
        name: pl.plan.name,
        slug: pl.plan.slug,
        monthlyPriceCents: pl.plan.monthlyPriceCents,
        currency: pl.plan.currency,
        customPriceCents: pl.customPriceCents,
        stock: pl.stock,
      })),
    }));

    return NextResponse.json({ locations: formattedLocations });
  } catch (error) {
    console.error('Error fetching server locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch server locations' },
      { status: 500 }
    );
  }
}