'use client';

import { useState } from 'react';
import { Check, Server, HardDrive, Cpu, Network, Shield, Database, Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small projects and personal websites',
    monthlyPrice: 5.99,
    yearlyPrice: 59.99,
    cpu: 1,
    ram: 2,
    storage: 40,
    bandwidth: 2,
    features: [
      '1 vCPU Core',
      '2 GB RAM',
      '40 GB NVMe SSD',
      '2 TB Bandwidth',
      '1 IPv4 Address',
      'DDoS Protection',
      'Full Root Access',
      'API Access',
      '99.9% Uptime SLA',
    ],
    highlight: 'Most Popular for Starters',
    popular: false,
  },
  {
    id: 'standard',
    name: 'Standard',
    description: 'Great for growing applications and small businesses',
    monthlyPrice: 11.99,
    yearlyPrice: 119.99,
    cpu: 2,
    ram: 4,
    storage: 80,
    bandwidth: 4,
    features: [
      '2 vCPU Cores',
      '4 GB RAM',
      '80 GB NVMe SSD',
      '4 TB Bandwidth',
      '1 IPv4 Address',
      'DDoS Protection',
      'Full Root Access',
      'API Access',
      '99.9% Uptime SLA',
      'Free Daily Backups',
    ],
    highlight: 'Best Value',
    popular: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For demanding applications and medium businesses',
    monthlyPrice: 23.99,
    yearlyPrice: 239.99,
    cpu: 4,
    ram: 8,
    storage: 160,
    bandwidth: 8,
    features: [
      '4 vCPU Cores',
      '8 GB RAM',
      '160 GB NVMe SSD',
      '8 TB Bandwidth',
      '1 IPv4 Address',
      'DDoS Protection',
      'Full Root Access',
      'API Access',
      '99.9% Uptime SLA',
      'Free Daily Backups',
      'Priority Support',
    ],
    highlight: 'For Growing Teams',
    popular: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Maximum performance for critical workloads',
    monthlyPrice: 47.99,
    yearlyPrice: 479.99,
    cpu: 8,
    ram: 16,
    storage: 320,
    bandwidth: 16,
    features: [
      '8 vCPU Cores',
      '16 GB RAM',
      '320 GB NVMe SSD',
      '16 TB Bandwidth',
      '2 IPv4 Addresses',
      'DDoS Protection',
      'Full Root Access',
      'API Access',
      '99.99% Uptime SLA',
      'Free Daily Backups',
      'Priority Support',
      'Dedicated IP',
    ],
    highlight: 'Mission Critical',
    popular: false,
  },
];

const addons = [
  { name: 'Additional IPv4', price: 2.00, unit: '/mo' },
  { name: 'cPanel License', price: 15.00, unit: '/mo' },
  { name: 'Plesk License', price: 10.00, unit: '/mo' },
  { name: 'Managed Services', price: 49.00, unit: '/mo' },
  { name: 'Load Balancer', price: 10.00, unit: '/mo' },
  { name: 'Private Network', price: 5.00, unit: '/mo' },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="min-h-screen">
      <section className="py-16 sm:py-24 bg-notix-surface/30 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-notix-text mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-notix-textMuted mb-8">
              No hidden fees. No setup costs. Cancel anytime. All prices in USD.
            </p>
            <div className="inline-flex items-center gap-4 p-1 bg-notix-surface rounded-lg border border-white/10">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all',
                  billingCycle === 'monthly'
                    ? 'bg-notix-accent text-notix-bg shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                    : 'text-notix-textMuted hover:text-notix-text'
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all',
                  billingCycle === 'yearly'
                    ? 'bg-notix-accent text-notix-bg shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                    : 'text-notix-textMuted hover:text-notix-text'
                )}
              >
                Yearly
                <span className="ml-2 px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">Save 17%</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                className={cn(
                  'relative card-base flex flex-col',
                  plan.popular && 'gradient-border shadow-[0_0_40px_rgba(6,182,212,0.15)]'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-notix-accent text-notix-bg text-xs font-medium rounded-full">
                    {plan.highlight}
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-notix-text">{plan.name}</h3>
                  <p className="text-notix-textMuted text-sm mt-1">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-notix-text">
                      ${billingCycle === 'monthly' ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12)}
                    </span>
                    <span className="text-notix-textMuted">/mo</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-sm text-green-400 mt-1">
                      Billed ${plan.yearlyPrice}/year
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className={cn('w-5 h-5 flex-shrink-0 text-notix-accent', plan.id === 'starter' && i > 7 && 'text-notix-textMuted/30')} />
                      <span className={cn('text-sm', plan.id === 'starter' && i > 7 ? 'text-notix-textMuted/50' : 'text-notix-textMuted')}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  asChild
                >
                  <a href={`/register?plan=${plan.id}`}>
                    Get Started
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-notix-surface/30 border-y border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-notix-text mb-12">Add-ons & Extras</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {addons.map((addon) => (
              <div key={addon.name} className="card-base flex items-center justify-between">
                <span className="text-notix-text">{addon.name}</span>
                <span className="text-notix-accent font-medium">
                  ${addon.price}{addon.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="card-base gradient-border">
            <h2 className="text-3xl font-bold text-center text-notix-text mb-12">Need Something Custom?</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <Crown className="w-12 h-12 text-notix-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-notix-text mb-2">Custom Configurations</h3>
                <p className="text-notix-textMuted">Need more resources? We can build custom VPS configurations tailored to your exact requirements.</p>
              </div>
              <div>
                <Server className="w-12 h-12 text-notix-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-notix-text mb-2">Dedicated Servers</h3>
                <p className="text-notix-textMuted">For maximum performance and isolation. Full hardware dedicated to your workloads.</p>
              </div>
              <div>
                <Shield className="w-12 h-12 text-notix-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-notix-text mb-2">Enterprise SLA</h3>
                <p className="text-notix-textMuted">99.99% uptime guarantee, priority support, dedicated account manager, and custom contracts.</p>
              </div>
            </div>
            <div className="text-center mt-10">
              <Button variant="outline" size="lg" asChild>
                <a href="/contact">Contact Sales</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}