import { Metadata } from 'next';
import RegisterClient from './RegisterClient';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create your NOTIXCLOUD account to deploy VPS, manage Minecraft servers, and access all features.',
};

export default function RegisterPage() {
  return <RegisterClient />;
}