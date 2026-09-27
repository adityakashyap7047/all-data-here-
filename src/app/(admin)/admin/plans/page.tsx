import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { redirect } from 'next/navigation';
import AdminPlansClient from './AdminPlansClient';

export const metadata = {
  title: 'VPS Plans | NOTIXCLOUD Admin',
  description: 'Manage VPS plans',
};

interface SearchParams {
  page?: string;
  search?: string;
  isActive?: string;
  sort?: string;
  order?: string;
}

async function getPlans(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1');
  const limit = 20;
  const skip = (page - 1) * limit;
  const search = searchParams.search || '';
  const isActive = searchParams.isActive;
  const sort = searchParams.sort || 'sortOrder';
  const order = searchParams.order || 'asc';

  const where = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { slug: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(isActive !== undefined && { isActive: isActive === 'true' }),
  };

  const [plans, total] = await Promise.all([
    prisma.vPSPlan.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order },
      include: {
        _count: { select: { instances: true } },
      },
    }),
    prisma.vPSPlan.count({ where }),
  ]);

  return {
    plans,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export default async function AdminPlansPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const { error } = await requirePermission('vps:write');
  if (error) {
    redirect('/dashboard');
  }

  const data = await getPlans(searchParams);

  return <AdminPlansClient initialData={data} searchParams={searchParams} />;
}