import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { redirect } from 'next/navigation';
import AdminPortfolioClient from './AdminPortfolioClient';

export const metadata = {
  title: 'Portfolio | NOTIXCLOUD Admin',
  description: 'Manage portfolio items',
};

interface SearchParams {
  page?: string;
  search?: string;
  categoryId?: string;
  isActive?: string;
  isFeatured?: string;
  sort?: string;
  order?: string;
}

async function getPortfolio(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1');
  const limit = 20;
  const skip = (page - 1) * limit;
  const search = searchParams.search || '';
  const categoryId = searchParams.categoryId || '';
  const isActive = searchParams.isActive;
  const isFeatured = searchParams.isFeatured;
  const sort = searchParams.sort || 'sortOrder';
  const order = searchParams.order || 'asc';

  const where = {
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { slug: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(categoryId && { categoryId }),
    ...(isActive !== undefined && { isActive: isActive === 'true' }),
    ...(isFeatured !== undefined && { isFeatured: isFeatured === 'true' }),
  };

  const [items, total, categories] = await Promise.all([
    prisma.portfolioItem.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order },
      include: { category: true },
    }),
    prisma.portfolioItem.count({ where }),
    prisma.portfolioCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    categories,
  };
}

export default async function AdminPortfolioPage({
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

  const data = await getPortfolio(searchParams);

  return <AdminPortfolioClient initialData={data} searchParams={searchParams} />;
}