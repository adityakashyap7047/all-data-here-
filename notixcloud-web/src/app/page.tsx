import { Metadata } from 'next';
import { ArrowRight, Server, Globe, Shield, Zap, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Powerful Infrastructure for Your Projects',
  description:
    'High-performance VPS hosting, Minecraft server hosting, and cloud infrastructure. Global locations, NVMe storage, DDoS protection, and 99.9% uptime SLA.',
};

const features = [
  {
    icon: Zap,
    title: 'NVMe Performance',
    description: 'Lightning-fast NVMe SSDs on all plans for exceptional I/O performance.',
  },
  {
    icon: Globe,
    title: 'Global Locations',
    description: 'Deploy in 8+ data centers worldwide for low latency everywhere.',
  },
  {
    icon: Shield,
    title: 'DDoS Protection',
    description: 'Enterprise-grade DDoS mitigation included free on all services.',
  },
  {
    icon: Server,
    title: '99.9% Uptime SLA',
    description: 'Industry-leading uptime guarantee with proactive monitoring.',
  },
];

const stats = [
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '8+', label: 'Global Locations' },
  { value: '100Gbps', label: 'Network Capacity' },
  { value: '24/7', label: 'Support' },
];

export default function HomePage() {
  return (
    <div className="animate-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32" aria-labelledby="hero-heading">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-100/50 via-transparent to-transparent dark:from-indigo-900/20" aria-hidden="true" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" aria-hidden="true" />
        
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6 animate-in stagger-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
              New: Singapore & Tokyo locations now available
            </div>
            
            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight mb-6 animate-in stagger-2 text-balance"
            >
              Powerful Infrastructure.<br />
              <span className="text-indigo-600 dark:text-indigo-400">Built for Your Projects.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2mx mx-auto animate-in stagger-3 text-balance">
              Deploy high-performance VPS with NVMe storage, global locations, and enterprise-grade DDoS protection.
              Simple pricing, no hidden fees, and 99.9% uptime SLA.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in stagger-4">
              <Link href="/vps">
                <Button size="xl" icon={<ArrowRight className="h-5 w-5" />} iconPosition="right">
                  Deploy Your VPS
                </Button>
              </Link>
              <Link href="/features">
                <Button variant="outline" size="xl">
                  Explore Infrastructure
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500 dark:text-slate-400 animate-in stagger-5">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-lg">{stat.value}</span>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28 bg-white dark:bg-slate-950" aria-labelledby="features-heading">
        <Container>
          <div className="text-center mb-16">
            <h2 id="features-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need to Scale
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Enterprise-grade features included on every plan, not just the expensive ones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={feature.title} variant="bordered" hover className="stagger-{index + 1}">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-4">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* VPS Plans Preview */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900" aria-labelledby="vps-heading">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12">
            <div>
              <h2 id="vps-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Choose the plan that fits your needs. All plans include NVMe storage, DDoS protection, and full root access.
              </p>
            </div>
            <Link href="/vps" className="mt-4 sm:mt-0">
              <Button variant="outline" icon={<ArrowRight className="h-4 w-4" />} iconPosition="right">
                View All Plans
              </Button>
            </Link>
          </div>

          <VPSPlansPreview />
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28" aria-labelledby="cta-heading">
        <Container>
          <Card variant="elevated" className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" aria-hidden="true" />
            <div className="relative mx-auto max-w-3xl text-center py-12 lg:py-16 px-6">
              <h2 id="cta-heading" className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Deploy?
              </h2>
              <p className="text-indigo-100 text-lg mb-8 max-w-xl mx-auto">
                Get started in minutes. No credit card required for trial. Cancel anytime.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="xl" variant="secondary" icon={<ArrowRight className="h-5 w-5" />} iconPosition="right">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="xl" variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </Container>
      </section>
    </div>
  );
}

function VPSPlansPreview() {
  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small projects and development',
      cpuCores: 1,
      ramGb: 1,
      storageGb: 25,
      bandwidthTb: 1,
      monthlyPriceCents: 500,
      features: ['1 vCPU Core', '1 GB RAM', '25 GB NVMe SSD', '1 TB Bandwidth', '1 IPv4', '1 IPv6', 'Full Root Access', '99.9% Uptime SLA'],
      isPopular: false,
    },
    {
      name: 'Standard',
      description: 'Ideal for growing websites and applications',
      cpuCores: 2,
      ramGb: 4,
      storageGb: 80,
      bandwidthTb: 3,
      monthlyPriceCents: 1500,
      features: ['2 vCPU Cores', '4 GB RAM', '80 GB NVMe SSD', '3 TB Bandwidth', '1 IPv4', '1 IPv6', 'Full Root Access', '99.9% Uptime SLA', 'Free Backups'],
      isPopular: true,
    },
    {
      name: 'Professional',
      description: 'High-performance VPS for production workloads',
      cpuCores: 4,
      ramGb: 8,
      storageGb: 160,
      bandwidthTb: 5,
      monthlyPriceCents: 3500,
      features: ['4 vCPU Cores', '8 GB RAM', '160 GB NVMe SSD', '5 TB Bandwidth', '1 IPv4', '1 IPv6', 'Full Root Access', '99.9% Uptime SLA', 'Free Backups', 'Priority Support'],
      isPopular: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan, index) => (
        <Card
          key={plan.name}
          variant={plan.isPopular ? 'outlined' : 'bordered'}
          className="relative flex flex-col"
        >
          {plan.isPopular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                Most Popular
              </span>
            </div>
          )}
          <CardContent className="flex-1 flex flex-col p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {plan.name}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {plan.description}
              </p>
            </div>
            
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">
                  {formatPrice(plan.monthlyPriceCents)}
                </span>
                <span className="text-slate-500 dark:text-slate-400">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6 flex-1" role="list">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/register">
              <Button className="w-full" variant={plan.isPopular ? 'primary' : 'outline'}>
                {plan.isPopular ? 'Get Started' : 'Choose Plan'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}