import { Metadata } from 'next';
import ServersClient from './ServersClient';

export const metadata: Metadata = {
  title: 'Servers',
  description: 'Manage your VPS servers',
};

export default function ServersPage() {
  return <ServersClient />;
}