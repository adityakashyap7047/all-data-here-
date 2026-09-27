import Link from 'next/link';
import { Server, Shield, Zap, Globe, Database, Lock, ArrowRight, CheckCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Server,
    title: 'High Performance VPS',
    description: 'NVMe SSD storage, latest gen CPUs, and dedicated resources for maximum performance.',
    highlight: '99.9% uptime SLA',
  },
  {
    icon: Shield,
    title: 'DDoS Protection',
    description: 'Enterprise-grade DDoS mitigation included free on all plans. Automatic detection and mitigation.',
    highlight: 'Always-on protection',
  },
  {
    icon: Zap,
    title: 'Instant Provisioning',
    description: 'Your server is ready in seconds, not minutes. Automated provisioning via API or dashboard.',
    highlight: 'Ready in < 60 seconds',
  },
  {
    icon: Globe,
    title: 'Global Locations',
    description: 'Deploy in 6+ data centers worldwide. Low latency for your users wherever they are.',
    highlight: 'US, EU, APAC regions',
  },
  {
    icon: Database,
    title: 'Automated Backups',
    description: 'Daily automated backups with 7-day retention. One-click restore from dashboard or API.',
    highlight: '7-day retention free',
  },
  {
    icon: Lock,
    title: 'Full Root Access',
    description: 'Complete control over your server. Install any OS, configure any software, run any workload.',
    highlight: 'KVM virtualization',
  },
];

const stats = [
  { value: '99.99%', label: 'Uptime SLA' },
  { value: '6+', label: 'Global Locations' },
  { value: '10k+', label: 'Active Servers' },
  { value: '24/7', label: 'Expert Support' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 sm:py-32 lg:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-notix-accent/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-notix-accent/10 border border-notix-accent/20 text-notix-accent text-sm font-medium mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-notix-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-notix-accent"></span>
              </span>
              New: Minecraft Server Hosting Now Available
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-notix-text mb-6 animate-slide-up">
              Powerful Infrastructure.
              <br />
              <span className="gradient-text">Built for Your Projects.</span>
            </h1>
            <p className="text-lg sm:text-xl text-notix-textMuted mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
              High-performance VPS hosting, Minecraft servers, and cloud infrastructure. 
              Enterprise-grade hardware, global locations, and 99.9% uptime SLA.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Link href="/register">
                <Button size="xl" className="w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="xl" variant="outline" className="w-full sm:w-auto">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center card-base animate-slide-up" style={{ animationDelay: `${300 + i * 100}ms` }}>
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-notix-textMuted text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32 bg-notix-surface/30 border-y border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-notix-text mb-4">Everything You Need to Scale</h2>
            <p className="text-lg text-notix-textMuted">Enterprise features included on every plan. No hidden costs, no surprises.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={feature.title} className="card-hover group animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-12 h-12 rounded-xl bg-notix-accent/10 flex items-center justify-center mb-6 group-hover:bg-notix-accent/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-notix-accent" />
                </div>
                <h3 className="text-xl font-semibold text-notix-text mb-3">{feature.title}</h3>
                <p className="text-notix-textMuted mb-4">{feature.description}</p>
                <div className="flex items-center gap-2 text-notix-accent text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>{feature.highlight}</span>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="card-base gradient-border text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-notix-text mb-4">Ready to Deploy?</h2>
            <p className="text-notix-textMuted mb-8 max-w-2xl mx-auto">
              Join thousands of developers who trust NOTIXCLOUD for their infrastructure. 
              Start with a 7-day free trial, no credit card required.
            </p>
            <Link href="/register">
              <Button size="xl">
                Create Free Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}