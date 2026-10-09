import { Metadata } from 'next';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your NOTIXCLOUD account to manage your VPS, billing, and support tickets.',
};

export default function LoginPage() {
  return <LoginClient />;
}