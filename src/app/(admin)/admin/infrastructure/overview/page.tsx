import { Metadata } from 'next';
import { requireRole } from '@/lib/auth/utils/permissions';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AdminInfrastructureOverviewClient from './AdminInfrastructureOverviewClient';

export const metadata: Metadata = {
  title: 'VPS Overview | Infrastructure',
};

export default async function AdminInfrastructureOverviewPage() {
  const { user, error } = await requireRole('ADMIN');
  if (error) redirect('/login');

  const [
    totalNodes,
    onlineNodes,
    maintenanceNodes,
    offlineNodes,
    totalServers,
    runningServers,
    totalCpuCores,
    totalRam,
    totalDisk,
    usedRam,
    usedDisk,
    nodes,
  ] = await Promise.all([
    prisma.vPSNode.count(),
    prisma.vPSNode.count({ where: { status: 'ONLINE' } }),
    prisma.vPSNode.count({ where: { status: 'MAINTENANCE' } }),
    prisma.vPSNode.count({ where: { status: 'OFFLINE' } }),
    prisma.minecraftServer.count(),
    prisma.minecraftServer.count({ where: { status: 'RUNNING' } }),
    prisma.vPSNode.aggregate({ _sum: { cpuCores: true } }),
    prisma.vPSNode.aggregate({ _sum: { totalRam: true } }),
    prisma.vPSNode.aggregate({ _sum: { totalDisk: true } }),
    prisma.vPSNode.aggregate({ _sum: { allocatedRam: true } }),
    prisma.vPSNode.aggregate({ _sum: { allocatedDisk: true } }),
    prisma.vPSNode.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        _count: { select: { servers: true } },
        metrics: { orderBy: { timestamp: 'desc' }, take: 1 },
      },
    }),
  ]);

  const stats = {
    totalNodes,
    onlineNodes,
    maintenanceNodes,
    offlineNodes,
    totalServers,
    runningServers,
    totalCpuCores: totalCpuCores._sum.cpuCores || 0,
    totalRam: totalRam._sum.totalRam || 0,
    totalDisk: totalDisk._sum.totalDisk || 0,
    usedRam: usedRam._sum.allocatedRam || 0,
    usedDisk: usedDisk._sum.allocatedDisk || 0,
  };

  return <AdminInfrastructureOverviewClient stats={stats} nodes={nodes} />;
}