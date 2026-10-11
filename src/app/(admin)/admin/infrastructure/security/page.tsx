import { Metadata } from 'next';
import { requireRole } from '@/lib/auth/utils/permissions';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AdminSecurityClient from './AdminSecurityClient';

export const metadata: Metadata = {
  title: 'Security Settings | Infrastructure',
};

export default async function AdminSecurityPage() {
  const { user, error } = await requireRole('ADMIN');
  if (error) redirect('/login');

  const nodes = await prisma.vPSNode.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      hostname: true,
      status: true,
      firewallConfigured: true,
      tlsConfigured: true,
      authType: true,
      hostKeyFingerprint: true,
      sshPort: true,
      sshUsername: true,
    },
  });

  return <AdminSecurityClient nodes={nodes} />;
}