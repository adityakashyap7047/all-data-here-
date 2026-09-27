import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { redirect } from 'next/navigation';
import AdminSettingsClient from './AdminSettingsClient';

export const metadata = {
  title: 'Settings | NOTIXCLOUD Admin',
  description: 'Configure platform settings',
};

async function getSettings() {
  const settings = await prisma.setting.findMany({
    orderBy: { category: 'asc' },
  });

  const grouped = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, typeof settings>);

  return grouped;
}

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const { error } = await requirePermission('settings:read');
  if (error) {
    redirect('/dashboard');
  }

  const data = await getSettings();

  return <AdminSettingsClient initialSettings={data} />;
}