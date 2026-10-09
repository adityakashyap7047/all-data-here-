import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const plans = await prisma.vPSPlan.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
      },
      include: {
        locations: {
          where: {
            available: true,
            location: {
              status: 'ACTIVE',
              deletedAt: null,
            },
          },
          include: {
            location: {
              select: {
                id: true,
                name: true,
                slug: true,
                displayName: true,
                country: true,
                countryCode: true,
                city: true,
                isFeatured: true,
              },
            },
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    const formattedPlans = plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      shortDescription: plan.shortDescription,
      cpuCores: plan.cpuCores,
      ramGb: plan.ramGb,
      storageGb: plan.storageGb,
      storageType: plan.storageType,
      bandwidthTb: plan.bandwidthTb,
      ipv4Addresses: plan.ipv4Addresses,
      ipv6Addresses: plan.ipv6Addresses,
      monthlyPriceCents: plan.monthlyPriceCents,
      quarterlyPriceCents: plan.quarterlyPriceCents,
      semiAnnualPriceCents: plan.semiAnnualPriceCents,
      annualPriceCents: plan.annualPriceCents,
      biennialPriceCents: plan.biennialPriceCents,
      triennialPriceCents: plan.triennialPriceCents,
      setupFeeCents: plan.setupFeeCents,
      currency: plan.currency,
      features: plan.features,
      limitations: plan.limitations,
      isPopular: plan.isPopular,
      status: plan.status,
      locations: plan.locations.map((pl) => ({
        id: pl.location.id,
        name: pl.location.name,
        slug: pl.location.slug,
        displayName: pl.location.displayName,
        country: pl.location.country,
        countryCode: pl.location.countryCode,
        city: pl.location.city,
        isFeatured: pl.location.isFeatured,
        available: pl.available,
        stock: pl.stock,
        customPriceCents: pl.customPriceCents,
      })),
    }));

    return NextResponse.json({ plans: formattedPlans });
  } catch (error) {
    console.error('Error fetching VPS plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch VPS plans' },
      { status: 500 }
    );
  }
}