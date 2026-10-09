import { Metadata } from 'next';
import { ArrowRight, CheckCircle, Globe, Server, Database, Wifi, Shield, Cpu, HardDrive } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'VPS Hosting',
  description: 'High-performance VPS with NVMe storage, global locations, DDoS protection, and 99.9% uptime SLA. Starting at $5/month.',
};

const billingCycles = [
  { key: 'monthly', label: 'Monthly', interval: 'month' },
  { key: 'quarterly', label: 'Quarterly', interval: 'quarter', discount: '10%' },
  { key: 'semiAnnually', label: 'Semi-Annually', interval: '6 months', discount: '15%' },
  { key: 'annually', label: 'Annually', interval: 'year', discount: '20%' },
];

const planFeatures = [
  { key: 'cpuCores', label: 'CPU Cores', icon: Cpu, unit: ' vCPU' },
  { key: 'ramGb', label: 'RAM', icon: Database, unit: ' GB' },
  { key: 'storageGb', label: 'Storage', icon: HardDrive, unit: ' GB NVMe' },
  { key: 'bandwidthTb', label: 'Bandwidth', icon: NetworkWifi, unit: ' TB' },
  { key: 'ipv4Addresses', label: 'IPv4 Addresses', icon: Globe, unit: '' },
  { key: 'ipv6Addresses', label: 'IPv6 Addresses', icon: Globe, unit: '' },
];

export default function VPSPage() {
  return (
    <div className="animate-in">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950" aria-labelledby="vps-hero-heading">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="info" className="mb-4" dot>
              8 Global Locations · NVMe SSD · DDoS Protection
            </Badge>
            <h1 id="vps-hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight mb-6">
              High-Performance{' '}
              <span className="text-indigo-600 dark:text-indigo-400">VPS Hosting</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
              Deploy lightning-fast virtual private servers with dedicated resources, full root access,
              and enterprise-grade infrastructure. No hidden fees, no surprises.
            </p>
            <Link href="#plans">
              <Button size="xl" icon={<ArrowRight className="h-5 w-5" />} iconPosition="right">
                View Plans
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-20 lg:py-28 bg-white dark:bg-slate-950" aria-labelledby="plans-heading">
        <Container>
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h2 id="plans-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                  Choose Your Plan
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  All plans include NVMe storage, DDoS protection, full root access, and 99.9% uptime SLA.
                </p>
              </div>
              <BillingCycleSelector />
            </div>

            <VPSPlansGrid />
          </div>

          {/* Included Features */}
          <div className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-10">
              Included with Every Plan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Shield, title: 'DDoS Protection', desc: 'Enterprise-grade mitigation included free' },
                { icon: Server, title: '99.9% Uptime SLA', desc: 'Industry-leading uptime guarantee' },
                { icon: Globe, title: 'Global Locations', desc: 'Deploy in 8+ data centers worldwide' },
                { icon: Cpu, title: 'Full Root Access', desc: 'Complete control over your server' },
              ].map((feature) => (
                <Card key={feature.title} variant="bordered" className="text-center">
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-4">
                      <feature.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Locations CTA */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900" aria-labelledby="locations-cta-heading">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h2 id="locations-cta-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Deploy Closer to Your Users
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              Choose from 8 global data centers for optimal latency. All locations feature 100Gbps connectivity,
              DDoS protection, and redundant power.
            </p>
            <Link href="/locations">
              <Button size="lg" icon={<ArrowRight className="h-5 w-5" />} iconPosition="right">
                View All Locations
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-28 bg-white dark:bg-slate-950" aria-labelledby="vps-faq-heading">
        <Container>
          <h2 id="vps-faq-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto max-w-3xl space-y-4">
            {[
              {
                q: 'How long does provisioning take?',
                a: 'VPS instances are typically provisioned within 2-5 minutes after payment confirmation. You\'ll receive an email with root credentials once ready.',
              },
              {
                q: 'Can I upgrade my plan later?',
                a: 'Yes, you can upgrade CPU, RAM, and storage at any time from your control panel. Upgrades are instant for CPU/RAM; storage upgrades may require a brief reboot.',
              },
              {
                q: 'What operating systems are supported?',
                a: 'We support Ubuntu, Debian, CentOS, Rocky Linux, AlmaLinux, Windows Server, and custom ISOs. You can reinstall the OS anytime from the control panel.',
              },
              {
                q: 'Do you offer backups?',
                a: 'Yes, automated weekly backups are included on Standard plans and above. Professional and Enterprise plans include daily backups. You can also create manual snapshots anytime.',
              },
              {
                q: 'What is your refund policy?',
                a: 'We offer a 14-day money-back guarantee on all new VPS orders. If you\'re not satisfied, contact support within 14 days for a full refund.',
              },
            ].map((faq, index) => (
              <details key={index} className="group border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="font-medium text-slate-900 dark:text-white">{faq.q}</span>
                  <svg className="h-5 w-5 text-slate-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-slate-600 dark:text-slate-400 animate-in">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/faq">
              <Button variant="outline">View All FAQs</Button>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}

function BillingCycleSelector() {
  return (
    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
      {billingCycles.map((cycle) => (
        <button
          key={cycle.key}
          className="px-4 py-2 text-sm font-medium rounded-md transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          {cycle.label}
          {cycle.discount && <span className="ml-1 text-xs text-green-600 dark:text-green-400">({cycle.discount} off)</span>}
        </button>
      ))}
    </div>
  );
}

function VPSPlansGrid() {
  const plans = [
    {
      name: 'Starter',
      slug: 'starter',
      description: 'Perfect for small projects and development',
      cpuCores: 1,
      ramGb: 1,
      storageGb: 25,
      bandwidthTb: 1,
      ipv4Addresses: 1,
      ipv6Addresses: 1,
      monthlyPriceCents: 500,
      quarterlyPriceCents: 1350,
      semiAnnualPriceCents: 2550,
      annualPriceCents: 4800,
      features: ['1 vCPU Core', '1 GB RAM', '25 GB NVMe SSD', '1 TB Bandwidth', '1 IPv4', '1 IPv6', 'Full Root Access', '99.9% Uptime SLA'],
      limitations: 'Development/Testing only',
      isPopular: false,
      locations: ['New York', 'Los Angeles', 'London', 'Frankfurt', 'Singapore', 'Tokyo', 'Sydney', 'Toronto'],
    },
    {
      name: 'Standard',
      slug: 'standard',
      description: 'Ideal for growing websites and applications',
      cpuCores: 2,
      ramGb: 4,
      storageGb: 80,
      bandwidthTb: 3,
      ipv4Addresses: 1,
      ipv6Addresses: 1,
      monthlyPriceCents: 1500,
      quarterlyPriceCents: 4050,
      semiAnnualPriceCents: 7650,
      annualPriceCents: 14400,
      features: ['2 vCPU Cores', '4 GB RAM', '80 GB NVMe SSD', '3 TB Bandwidth', '1 IPv4', '1 IPv6', 'Full Root Access', '99.9% Uptime SLA', 'Free Weekly Backups'],
      limitations: null,
      isPopular: true,
      locations: ['New York', 'Los Angeles', 'London', 'Frankfurt', 'Singapore', 'Tokyo', 'Sydney', 'Toronto'],
    },
    {
      name: 'Professional',
      slug: 'professional',
      description: 'High-performance VPS for production workloads',
      cpuCores: 4,
      ramGb: 8,
      storageGb: 160,
      bandwidthTb: 5,
      ipv4Addresses: 1,
      ipv6Addresses: 1,
      monthlyPriceCents: 3500,
      quarterlyPriceCents: 9450,
      semiAnnualPriceCents: 17850,
      annualPriceCents: 33600,
      features: ['4 vCPU Cores', '8 GB RAM', '160 GB NVMe SSD', '5 TB Bandwidth', '1 IPv4', '1 IPv6', 'Full Root Access', '99.9% Uptime SLA', 'Free Daily Backups', 'Priority Support'],
      limitations: null,
      isPopular: false,
      locations: ['New York', 'Los Angeles', 'London', 'Frankfurt', 'Singapore', 'Tokyo', 'Sydney', 'Toronto'],
    },
    {
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'Maximum performance for demanding applications',
      cpuCores: 8,
      ramGb: 16,
      storageGb: 320,
      bandwidthTb: 10,
      ipv4Addresses: 2,
      ipv6Addresses: 2,
      monthlyPriceCents: 7500,
      quarterlyPriceCents: 20250,
      semiAnnualPriceCents: 38250,
      annualPriceCents: 72000,
      features: ['8 vCPU Cores', '16 GB RAM', '320 GB NVMe SSD', '10 TB Bandwidth', '2 IPv4', '2 IPv6', 'Full Root Access', '99.9% Uptime SLA', 'Free Daily Backups', 'Priority Support', 'Dedicated Resources'],
      limitations: null,
      isPopular: false,
      locations: ['New York', 'Los Angeles', 'London', 'Frankfurt', 'Singapore', 'Tokyo', 'Sydney', 'Toronto'],
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {plans.map((plan, index) => (
        <Card
          key={plan.name}
          variant={plan.isPopular ? 'outlined' : 'bordered'}
          className="relative flex flex-col"
        >
          {plan.isPopular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge variant="primary">Most Popular</Badge>
            </div>
          )}
          <CardHeader className="pb-4">
            <CardTitle>{plan.name}</CardTitle>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{plan.description}</p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 pt-6">
            <div className="px-6 mb-6 border-b border-slate-200 dark:border-slate-700 pb-6">
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">
                  {formatPrice(plan.monthlyPriceCents)}
                </span>
                <span className="text-slate-500 dark:text-slate-400">/month</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Billed monthly — save up to 20% annually
              </p>
            </div>

            <ul className="space-y-3 px-6 mb-6 flex-1" role="list">
              {planFeatures.map((feature) => {
                const value = plan[feature.key as keyof typeof plan] as number;
                return (
                  <li key={feature.key} className="flex items-center gap-3 text-sm">
                    <feature.icon className="h-5 w-5 text-indigo-500 flex-shrink-0" aria-hidden="true" />
                    <span className="text-slate-600 dark:text-slate-300">{feature.label}</span>
                    <span className="ml-auto font-medium text-slate-900 dark:text-white">
                      {value}{feature.unit}
                    </span>
                  </li>
                );
              })}
            </ul>

            {plan.limitations && (
              <div className="px-6 mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400">{plan.limitations}</p>
              </div>
            )}

            <div className="px-6 pb-6">
              <Link href={`/register?plan=${plan.slug}`}>
                <Button className="w-full" variant={plan.isPopular ? 'primary' : 'outline'}>
                  {plan.isPopular ? 'Get Started' : 'Choose Plan'}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}