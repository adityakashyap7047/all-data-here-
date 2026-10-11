import { Metadata } from 'next';
import { requireRole } from '@/lib/auth/utils/permissions';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AdminDeploymentsClient from './AdminDeploymentsClient';

export const metadata: Metadata = {
  title: 'Server Deployments | Infrastructure',
};

export default async function AdminDeploymentsPage() {
  const { user, error } = await requireRole('ADMIN');
  if (error) redirect('/login');

  const [nodes, servers, total] = await Promise.all([
    prisma.vPSNode.findMany({
      where: { status: 'ONLINE' },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { servers: true } },
      },
    }),
    prisma.minecraftServer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        node: { select: { id: true, name: true, hostname: true, status: true } },
      },
    }),
    prisma.minecraftServer.count(),
  ]);

  return <AdminDeploymentsClient nodes={nodes} servers={servers} total={total} />;
}