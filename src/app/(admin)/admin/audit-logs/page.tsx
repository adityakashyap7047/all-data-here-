import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { redirect } from 'next/navigation';
import AdminAuditLogsClient from './AdminAuditLogsClient';

export const metadata = {
  title: 'Audit Logs | NOTIXCLOUD Admin',
  description: 'View administrative audit logs',
};

interface SearchParams {
  page?: string;
  search?: string;
  action?: string;
  entity?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  order?: string;
}

async function getAuditLogs(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1');
  const limit = 50;
  const skip = (page - 1) * limit;
  const search = searchParams.search || '';
  const action = searchParams.action || '';
  const entity = searchParams.entity || '';
  const userId = searchParams.userId || '';
  const dateFrom = searchParams.dateFrom || '';
  const dateTo = searchParams.dateTo || '';
  const sort = searchParams.sort || 'createdAt';
  const order = searchParams.order || 'desc';

  const where = {
    ...(search && {
      OR: [
        { action: { contains: search, mode: 'insensitive' as const } },
        { entity: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(action && { action: { contains: action, mode: 'insensitive' as const } }),
    ...(entity && { entity: { contains: entity, mode: 'insensitive' as const } }),
    ...(userId && { userId }),
    ...(dateFrom && { createdAt: { gte: new Date(dateFrom) } }),
    ...(dateTo && { createdAt: { lte: new Date(dateTo) } }),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const { error } = await requirePermission('audit:read');
  if (error) {
    redirect('/dashboard');
  }

  const data = await getAuditLogs(searchParams);

  return <AdminAuditLogsClient initialData={data} searchParams={searchParams} />;
}