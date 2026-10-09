import { Metadata } from 'next';
import { ArrowRight, CheckCircle, Server, Database, Shield, Zap, Globe, Cpu, HardDrive, Download, Settings, Monitor } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Minecraft Server Hosting',
  description: 'High-performance Minecraft server hosting with Java & Bedrock support, modpacks, plugins, automatic backups, and DDoS protection. Starting at $8/month.',
};

const minecraftPlans = [
  {
    id: 'mc-starter',
    name: 'Starter',
    description: 'Perfect for small private servers with friends',
    ramGb: 2,
    cpuCores: 2,
    storageGb: 10,
    playerSlots: 20,
    monthlyPriceCents: 800,
    features: [
      '2 GB RAM',
      '2 vCPU Cores',
      '10 GB NVMe Storage',
      'Up to 20 Players',
      'Java & Bedrock Support',
      'Automatic Backups',
      'DDoS Protection',
      'Modpack Support',
      'Plugin Support',
      'Web-based Control Panel',
      'Instant Setup',
      '24/7 Monitoring',
    ],
    isPopular: false,
  },
  {
    id: 'mc-standard',
    name: 'Standard',
    description: 'Great for growing communities and public servers',
    ramGb: 4,
    cpuCores: 3,
    storageGb: 20,
    playerSlots: 50,
    monthlyPriceCents: 1500,
    features: [
      '4 GB RAM',
      '3 vCPU Cores',
      '20 GB NVMe Storage',
      'Up to 50 Players',
      'Java & Bedrock Support',
      'Automatic Daily Backups',
      'DDoS Protection',
      'Modpack Support (CurseForge, FTB, etc.)',
      'Plugin Support (Spigot, Paper, Purpur)',
      'Web-based Control Panel',
      'Instant Setup',
      '24/7 Monitoring',
      'Priority Support',
    ],
    isPopular: true,
  },
  {
    id: 'mc-pro',
    name: 'Professional',
    description: 'For large communities and modded networks',
    ramGb: 8,
    cpuCores: 4,
    storageGb: 40,
    playerSlots: 100,
    monthlyPriceCents: 3000,
    features: [
      '8 GB RAM',
      '4 vCPU Cores',
      '40 GB NVMe Storage',
      'Up to 100 Players',
      'Java & Bedrock Support',
      'Automatic Hourly Backups',
      'Advanced DDoS Protection',
      'Modpack Support (All Launchers)',
      'Plugin Support (All Forks)',
      'Web-based Control Panel',
      'Instant Setup',
      '24/7 Monitoring',
      'Priority Support',
      'Custom JVM Flags',
      'Database Included (MySQL/PostgreSQL)',
    ],
    isPopular: false,
  },
  {
    id: 'mc-enterprise',
    name: 'Enterprise',
    description: 'Dedicated resources for networks and hosting providers',
    ramGb: 16,
    cpuCores: 6,
    storageGb: 80,
    playerSlots: 200,
    monthlyPriceCents: 6000,
    features: [
      '16 GB RAM',
      '6 vCPU Cores (Dedicated)',
      '80 GB NVMe Storage',
      'Up to 200+ Players',
      'Java & Bedrock Support',
      'Automatic 15-min Backups',
      'Premium DDoS Protection',
      'Unlimited Modpacks & Plugins',
      'Web-based Control Panel',
      'Instant Setup',
      '24/7 Monitoring',
      'Priority Support',
      'Custom JVM Flags',
      'Database Included (MySQL/PostgreSQL/MongoDB)',
      'Redis Cache Included',
      'Custom Domain & SSL',
      'SLA Guarantee',
    ],
    isPopular: false,
  },
];

const features = [
  {
    icon: Settings,
    title: 'One-Click Modpacks',
    description: 'Install CurseForge, FTB, Technic, and ATLauncher modpacks with a single click. No manual configuration required.',
  },
  {
    icon: Download,
    title: 'Plugin Support',
    description: 'Full support for Spigot, Paper, Purpur, and Forge plugins. Easy installation and management via control panel.',
  },
  {
    icon: Database,
    title: 'Automatic Backups',
    description: 'Scheduled backups with configurable retention. One-click restore from the control panel. Off-site storage available.',
  },
  {
    icon: Monitor,
    title: 'Real-Time Monitoring',
    description: 'Live CPU, RAM, disk, and network monitoring. Player count tracking. Alerts via Discord, email, or webhook.',
  },
  {
    icon: Cpu,
    title: 'Custom JVM Flags',
    description: 'Full control over Java arguments. Optimize for your specific modpack or plugin configuration.',
  },
  {
    icon: Globe,
    title: 'Global Low Latency',
    description: 'Deploy in 8 locations worldwide. Sub-50ms latency to major population centers. Anycast DDoS protection.',
  },
];

const serverTypes = [
  { name: 'Vanilla', description: 'Official Minecraft server', icon: Server },
  { name: 'Paper', description: 'High-performance Spigot fork', icon: Zap },
  { name: 'Purpur', description: 'Optimized Paper fork', icon: Cpu },
  { name: 'Fabric', description: 'Lightweight modding platform', icon: Settings },
  { name: 'Forge', description: 'Classic modding API', icon: HardDrive },
  { name: 'Bedrock', description: 'Cross-platform support', icon: Globe },
];

export default function MinecraftPage() {
  return (
    <div className="animate-in">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-amber-50 to-white dark:from-slate-900 dark:to-slate-950" aria-labelledby="mc-hero-heading">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-100/50 via-transparent to-transparent dark:from-amber-900/20" aria-hidden="true" />
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="warning" className="mb-4" dot>
              Java & Bedrock · Modpacks · Plugins · DDoS Protection
            </Badge>
            <h1 id="mc-hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight mb-6">
              Minecraft Server{' '}
              <span className="text-amber-600 dark:text-amber-400">Hosting</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
              Power your Minecraft community with high-performance servers. Java & Bedrock support,
              one-click modpacks, automatic backups, and enterprise DDoS protection.
            </p>
            <Link href="#plans">
              <Button size="xl" icon={<ArrowRight className="h-5 w-5" />} iconPosition="right">
                View Plans
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Plans */}
      <section id="plans" className="py-20 lg:py-28 bg-white dark:bg-slate-950" aria-labelledby="mc-plans-heading">
        <Container>
          <div className="text-center mb-12">
            <h2 id="mc-plans-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Choose Your Server
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              All plans include NVMe storage, DDoS protection, automatic backups, and our custom control panel.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {minecraftPlans.map((plan, index) => (
              <Card
                key={plan.id}
                variant={plan.isPopular ? 'outlined' : 'bordered'}
                className="relative flex flex-col"
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="warning">Best Value</Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <CardTitle>{plan.name}</CardTitle>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{plan.description}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0 pt-6">
                  <div className="px-6 mb-6 border-b border-slate-200 dark:border-slate-700 pb-6">
                    <div className="grid grid-cols-2 gap-4 text-center mb-4">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{plan.ramGb}GB</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">RAM</div>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{plan.cpuCores}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">vCPU</div>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{plan.storageGb}GB</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">NVMe</div>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{plan.playerSlots}+</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Players</div>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 justify-center">
                      <span className="text-4xl font-bold text-slate-900 dark:text-white">
                        {formatPrice(plan.monthlyPriceCents)}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">/month</span>
                    </div>
                  </div>

                  <ul className="space-y-2 px-6 mb-6 flex-1" role="list">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="px-6 pb-6">
                    <Link href={`/register?plan=${plan.id}`}>
                      <Button className="w-full" variant={plan.isPopular ? 'primary' : 'outline'}>
                        {plan.isPopular ? 'Get Started' : 'Choose Plan'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900" aria-labelledby="mc-features-heading">
        <Container>
          <div className="text-center mb-16">
            <h2 id="mc-features-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Built for Minecraft
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Every feature designed specifically for running Minecraft servers at scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={feature.title} variant="bordered" hover>
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mb-4">
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

      {/* Supported Server Types */}
      <section className="py-20 lg:py-28 bg-white dark:bg-slate-950" aria-labelledby="mc-types-heading">
        <Container>
          <div className="text-center mb-12">
            <h2 id="mc-types-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Supported Server Types
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Switch between server types instantly. All major Minecraft server software supported out of the box.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {serverTypes.map((type) => (
              <Card key={type.name} variant="bordered" className="text-center">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-4">
                    <type.icon className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{type.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{type.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Locations */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900" aria-labelledby="mc-locations-heading">
        <Container>
          <div className="text-center mb-12">
            <h2 id="mc-locations-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Global Low-Latency Locations
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
              Deploy your Minecraft server close to your players for the best experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'New York', flag: '🇺🇸', region: 'US East' },
              { name: 'Los Angeles', flag: '🇺🇸', region: 'US West' },
              { name: 'London', flag: '🇬🇧', region: 'EU West' },
              { name: 'Frankfurt', flag: '🇩🇪', region: 'EU Central' },
              { name: 'Singapore', flag: '🇸🇬', region: 'Asia Pacific' },
              { name: 'Tokyo', flag: '🇯🇵', region: 'Asia Pacific' },
              { name: 'Sydney', flag: '🇦🇺', region: 'Oceania' },
              { name: 'Toronto', flag: '🇨🇦', region: 'Canada' },
            ].map((location) => (
              <Card key={location.name} variant="bordered" className="text-center">
                <CardContent className="py-6">
                  <div className="text-3xl mb-2">{location.flag}</div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{location.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{location.region}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/locations">
              <Button variant="outline" icon={<ArrowRight className="h-4 w-4" />} iconPosition="right">
                View All Locations
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28" aria-labelledby="mc-cta-heading">
        <Container>
          <Card variant="elevated" className="relative overflow-hidden bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" aria-hidden="true" />
            <div className="relative mx-auto max-w-3xl text-center py-12 lg:py-16 px-6">
              <h2 id="mc-cta-heading" className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Start Your Minecraft Server Today
              </h2>
              <p className="text-amber-100 text-lg mb-8 max-w-xl mx-auto">
                Deploy in minutes. No setup fees. 14-day money-back guarantee.
              </p>
              <Link href="/register">
                <Button size="xl" variant="secondary" icon={<ArrowRight className="h-5 w-5" />} iconPosition="right">
                  Deploy Server
                </Button>
              </Link>
            </div>
          </Card>
        </Container>
      </section>
    </div>
  );
}