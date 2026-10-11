import { Metadata } from 'next';
import { requireRole } from '@/lib/auth/utils/permissions';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AdminResourcesClient from './AdminResourcesClient';

export const metadata: Metadata = {
  title: 'Node Resources | Infrastructure',
};

export default async function AdminResourcesPage() {
  const { user, error } = await requireRole('ADMIN');
  if (error) redirect('/login');

  const nodes = await prisma.vPSNode.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      metrics: { orderBy: { timestamp: 'desc' }, take: 100 },
      servers: { select: { id: true, name: true, allocatedCpu: true, allocatedRam: true, allocatedDisk: true, status: true } },
    },
  });

  return <AdminResourcesClient nodes={nodes} />;
}