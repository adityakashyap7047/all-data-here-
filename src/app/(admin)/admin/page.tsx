import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/utils/permissions';
import { redirect } from 'next/navigation';
import AdminDashboardClient from './AdminDashboardClient';

export const metadata = {
  title: 'Dashboard | NOTIXCLOUD Admin',
  description: 'Admin dashboard overview',
};

async function getDashboardStats() {
  const [
    totalUsers,
    activeCustomers,
    activeServers,
    pendingOrders,
    completedPayments,
    openTickets,
    recentUsers,
    recentOrders,
    recentTickets,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.vPSInstance.count({ where: { status: 'RUNNING' } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    }),
    prisma.ticket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS', 'WAITING_STAFF'] } } }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, name: true } } },
    }),
    prisma.ticket.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, name: true } } },
    }),
  ]);

  return {
    totalUsers,
    activeCustomers,
    activeServers,
    pendingOrders,
    totalRevenue: Number(completedPayments._sum.amount || 0),
    openTickets,
    recentUsers,
    recentOrders,
    recentTickets,
  };
}

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const { error } = await requireRole('ADMIN');
  if (error) {
    redirect('/dashboard');
  }

  const stats = await getDashboardStats();

  return <AdminDashboardClient initialStats={stats} />;
}