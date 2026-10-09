import { Metadata } from 'next';
import StatusClient from './StatusClient';

export const metadata: Metadata = {
  title: 'System Status',
  description: 'Real-time system status for NOTIXCLOUD services. Monitor API, Control Panel, VPS Provisioning, and more.',
};

export default function StatusPage() {
  return <StatusClient />;
}