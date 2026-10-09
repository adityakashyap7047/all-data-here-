import { Metadata } from 'next';
import PortfolioClient from './PortfolioClient';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Explore projects built on NOTIXCLOUD infrastructure. Discord bots, websites, dashboards, automation, IoT projects, and software solutions.',
};

export default function PortfolioPage() {
  return <PortfolioClient />;
}