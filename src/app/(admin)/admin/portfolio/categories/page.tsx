import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { redirect } from 'next/navigation';
import AdminPortfolioCategoriesClient from './AdminPortfolioCategoriesClient';

export const metadata = {
  title: 'Portfolio Categories | NOTIXCLOUD Admin',
  description: 'Manage portfolio categories',
};

interface SearchParams {
  page?: string;
  search?: string;
  isActive?: string;
  sort?: string;
  order?: string;
}

async function getCategories(searchParams: SearchParams) {
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

  const [categories, total] = await Promise.all([
    prisma.portfolioCategory.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order },
      include: { _count: { select: { items: true } } },
    }),
    prisma.portfolioCategory.count({ where }),
  ]);

  return {
    categories,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export default async function AdminPortfolioCategoriesPage({
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

  const data = await getCategories(searchParams);

  return <AdminPortfolioCategoriesClient initialData={data} searchParams={searchParams} />;
}