import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { redirect } from 'next/navigation';
import AdminTicketsClient from './AdminTicketsClient';

export const metadata = {
  title: 'Support Tickets | NOTIXCLOUD Admin',
  description: 'Manage support tickets',
};

interface SearchParams {
  page?: string;
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: string;
  sort?: string;
  order?: string;
}

async function getTickets(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1');
  const limit = 20;
  const skip = (page - 1) * limit;
  const search = searchParams.search || '';
  const status = searchParams.status || '';
  const priority = searchParams.priority || '';
  const category = searchParams.category || '';
  const assignedTo = searchParams.assignedTo || '';
  const sort = searchParams.sort || 'createdAt';
  const order = searchParams.order || 'desc';

  const where = {
    ...(search && {
      OR: [
        { subject: { contains: search, mode: 'insensitive' as const } },
        { user: { email: { contains: search, mode: 'insensitive' as const } } },
        { user: { name: { contains: search, mode: 'insensitive' as const } } },
      ],
    }),
    ...(status && { status: status as any }),
    ...(priority && { priority: priority as any }),
    ...(category && { category: category as any }),
    ...(assignedTo && { assignedTo: assignedTo === 'unassigned' ? null : assignedTo }),
  };

  const [tickets, total, staff] = await Promise.all([
    prisma.ticket.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order },
      include: {
        user: { select: { id: true, email: true, name: true } },
        assignedToUser: { select: { id: true, email: true, name: true } },
        _count: { select: { messages: true } },
        messages: { take: 1, orderBy: { createdAt: 'desc' }, select: { message: true, createdAt: true, isStaff: true } },
      },
    }),
    prisma.ticket.count({ where }),
    prisma.user.findMany({
      where: { role: { in: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'] } },
      select: { id: true, email: true, name: true },
    }),
  ]);

  return {
    tickets,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    staff,
  };
}

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const { error } = await requirePermission('tickets:read');
  if (error) {
    redirect('/dashboard');
  }

  const data = await getTickets(searchParams);

  return <AdminTicketsClient initialData={data} searchParams={searchParams} />;
}