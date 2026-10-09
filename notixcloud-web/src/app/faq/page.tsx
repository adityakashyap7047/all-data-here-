import { Metadata } from 'next';
import FAQClient from './FAQClient';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about NOTIXCLOUD VPS hosting, Minecraft servers, billing, and more.',
};

export default function FAQPage() {
  return <FAQClient />;
}