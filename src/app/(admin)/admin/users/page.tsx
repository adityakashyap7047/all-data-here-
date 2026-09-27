import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/utils/permissions';
import { redirect } from 'next/navigation';
import AdminUsersClient from './AdminUsersClient';

export const metadata = {
  title: 'Users | NOTIXCLOUD Admin',
  description: 'Manage users',
};

interface SearchParams {
  page?: string;
  search?: string;
  role?: string;
  sort?: string;
  order?: string;
}

async function getUsers(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1');
  const limit = 20;
  const skip = (page - 1) * limit;
  const search = searchParams.search || '';
  const role = searchParams.role || '';
  const sort = searchParams.sort || 'createdAt';
  const order = searchParams.order || 'desc';

  const where = {
    ...(search && {
      OR: [
        { email: { contains: search, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(role && { role: role as any }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        twoFactorEnabled: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { vpsInstances: true, orders: true, tickets: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const { error } = await requireRole('ADMIN');
  if (error) {
    redirect('/dashboard');
  }

  const data = await getUsers(searchParams);

  return <AdminUsersClient initialData={data} searchParams={searchParams} />;
}