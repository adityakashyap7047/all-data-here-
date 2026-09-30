import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { redirect } from 'next/navigation';
import AdminStatusClient from './AdminStatusClient';

export const metadata = {
  title: 'Status Page | NOTIXCLOUD Admin',
  description: 'Manage status page services and incidents',
};

interface SearchParams {
  tab?: string;
}

async function getStatusData() {
  const [servicesRaw, incidents] = await Promise.all([
    prisma.statusPageService.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { incidents: true } },
        incidents: {
          where: { status: { in: ['investigating', 'identified', 'monitoring'] } },
          orderBy: { startedAt: 'desc' },
          take: 5,
          include: {
            updates: { orderBy: { createdAt: 'desc' }, take: 3 },
          },
        },
      },
    }),
    prisma.statusIncident.findMany({
      where: { status: { in: ['investigating', 'identified', 'monitoring', 'resolved'] } },
      orderBy: { startedAt: 'desc' },
      take: 10,
      include: { 
        service: true, 
        updates: { orderBy: { createdAt: 'desc' }, take: 3 } 
      },
    }),
  ]);

  // Add service reference to nested incidents for type compatibility
  const services = servicesRaw.map(svc => ({
    ...svc,
    incidents: svc.incidents.map(inc => ({
      ...inc,
      service: { id: svc.id, name: svc.name, slug: svc.slug },
    })),
  }));

  return { services, incidents };
}

export default async function AdminStatusPage({
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

  const data = await getStatusData();

  return <AdminStatusClient initialData={data} activeTab={searchParams.tab || 'services'} />;
}