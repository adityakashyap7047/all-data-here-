import { Metadata } from 'next';
import ServerDetailClient from './ServerDetailClient';

export const metadata: Metadata = {
  title: 'Server Details',
  description: 'View and manage your VPS server',
};

export default function ServerDetailPage() {
  return <ServerDetailClient />;
}