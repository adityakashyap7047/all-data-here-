import { Metadata } from 'next';
import { requireRole } from '@/lib/auth/utils/permissions';
import { redirect } from 'next/navigation';
import AdminAddVPSClient from './AdminAddVPSClient';

export const metadata: Metadata = {
  title: 'Add VPS Node | Infrastructure',
};

export default async function AdminAddVPSPage() {
  const { user, error } = await requireRole('ADMIN');
  if (error) redirect('/login');

  return <AdminAddVPSClient />;
}