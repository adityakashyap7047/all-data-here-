import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { redirect } from 'next/navigation';
import AdminFAQClient from './AdminFAQClient';

export const metadata = {
  title: 'FAQs | NOTIXCLOUD Admin',
  description: 'Manage frequently asked questions',
};

interface SearchParams {
  page?: string;
  search?: string;
  category?: string;
  isActive?: string;
  sort?: string;
  order?: string;
}

async function getFAQs(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1');
  const limit = 20;
  const skip = (page - 1) * limit;
  const search = searchParams.search || '';
  const category = searchParams.category || '';
  const isActive = searchParams.isActive;
  const sort = searchParams.sort || 'sortOrder';
  const order = searchParams.order || 'asc';

  const where = {
    ...(search && {
      OR: [
        { question: { contains: search, mode: 'insensitive' as const } },
        { answer: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(category && { category }),
    ...(isActive !== undefined && { isActive: isActive === 'true' }),
  };

  const [faqs, total, categories] = await Promise.all([
    prisma.fAQ.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order },
    }),
    prisma.fAQ.count({ where }),
    prisma.fAQ.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: true,
    }),
  ]);

  return {
    faqs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    categories: categories.map(c => c.category),
  };
}

export default async function AdminFAQPage({
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

  const data = await getFAQs(searchParams);

  return <AdminFAQClient initialData={data} searchParams={searchParams} />;
}