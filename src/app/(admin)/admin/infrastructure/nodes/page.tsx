import { Metadata } from 'next';
import { requireRole } from '@/lib/auth/utils/permissions';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AdminNodesClient from './AdminNodesClient';

export const metadata: Metadata = {
  title: 'Connected Nodes | Infrastructure',
};

export default async function AdminNodesPage() {
  const { user, error } = await requireRole('ADMIN');
  if (error) redirect('/login');

  const [nodes, total] = await Promise.all([
    prisma.vPSNode.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { servers: true } },
        metrics: { orderBy: { timestamp: 'desc' }, take: 1 },
      },
    }),
    prisma.vPSNode.count(),
  ]);

  return <AdminNodesClient nodes={nodes} total={total} />;
}