import { Metadata } from 'next';
import { Shield, Zap, Globe, Server, Database, Wifi, Settings, Monitor, Lock, Layers, Terminal, RefreshCw } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Card, CardContent } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Features',
  description: 'Explore NOTIXCLOUD features: NVMe storage, global locations, DDoS protection, automated backups, API access, and more.',
};

const featureCategories = [
  {
    title: 'Performance',
    icon: Zap,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    features: [
      {
        title: 'NVMe SSD Storage',
        description: 'All VPS plans use enterprise-grade NVMe SSDs for exceptional I/O performance and low latency.',
        icon: Database,
      },
      {
        title: 'High-Frequency CPUs',
        description: 'Latest generation AMD EPYC and Intel Xeon processors with high clock speeds for compute-intensive workloads.',
        icon: Cpu,
      },
      {
        title: 'Dedicated Resources',
        description: 'No overcommitment. Your CPU, RAM, and storage are guaranteed and always available.',
        icon: Server,
      },
      {
        title: '100Gbps Network',
        description: 'Premium tier bandwidth with multiple upstream providers for optimal routing and redundancy.',
        icon: NetworkWifi,
      },
    ],
  },
  {
    title: 'Reliability',
    icon: Shield,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    features: [
      {
        title: '99.9% Uptime SLA',
        description: 'Industry-leading uptime guarantee backed by financially-backed SLA with service credits.',
        icon: Shield,
      },
      {
        title: 'DDoS Protection',
        description: 'Enterprise-grade DDoS mitigation included free on all services. Automatic detection and mitigation.',
        icon: Shield,
      },
      {
        title: 'Automated Backups',
        description: 'Scheduled backups with configurable retention. One-click restore. Off-site replication available.',
        icon: RefreshCw,
      },
      {
        title: 'Proactive Monitoring',
        description: '24/7 infrastructure monitoring with automated failover and incident response.',
        icon: Monitor,
      },
    ],
  },
  {
    title: 'Global Reach',
    icon: Globe,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    features: [
      {
        title: '8+ Data Centers',
        description: 'Deploy in North America, Europe, Asia-Pacific, and Oceania for low latency worldwide.',
        icon: Globe,
      },
      {
        title: 'Anycast IP',
        description: 'Optional Anycast IP addresses for global load balancing and automatic failover.',
        icon: Globe,
      },
      {
        title: 'Private Networking',
        description: 'Secure VPC networks with VLAN isolation. Connect instances across locations privately.',
        icon: Layers,
      },
      {
        title: 'IPv6 Ready',
        description: 'Full dual-stack IPv4/IPv6 support on all locations. /64 IPv6 allocation included.',
        icon: Wifi,
      },
    ],
  },
  {
    title: 'Developer Experience',
    icon: Terminal,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    features: [
      {
        title: 'REST API & Terraform',
        description: 'Full programmatic control over infrastructure. Official Terraform provider and SDKs available.',
        icon: Terminal,
      },
      {
        title: 'Custom Control Panel',
        description: 'Modern, responsive control panel for server management, monitoring, and billing.',
        icon: Settings,
      },
      {
        title: 'Cloud-Init Support',
        description: 'Automated provisioning with cloud-init. Deploy configured servers in seconds.',
        icon: RefreshCw,
      },
      {
        title: 'SSH Key Management',
        description: 'Centralized SSH key management. Deploy keys across multiple servers instantly.',
        icon: Lock,
      },
    ],
  },
];

const technicalSpecs = [
  { category: 'Compute', specs: ['AMD EPYC / Intel Xeon', 'Up to 64 vCPU cores', 'Dedicated CPU threads', 'Nested virtualization support'] },
  { category: 'Storage', specs: ['Enterprise NVMe SSDs', 'Up to 3.2 TB per instance', 'Local RAID-10 redundancy', 'Live snapshots & clones'] },
  { category: 'Network', specs: ['100 Gbps uplink', 'Multiple Tier-1 upstreams', 'BGP anycast available', 'Private VLANs / VXLAN'] },
  { category: 'Security', specs: ['DDoS mitigation (L3-L7)', 'Hardware firewalls', 'Encrypted storage at rest', 'ISO 27001 certified DCs'] },
  { category: 'OS Support', specs: ['Ubuntu 20.04/22.04/24.04', 'Debian 11/12', 'Rocky/AlmaLinux 8/9', 'Windows Server 2019/2022', 'Custom ISO upload'] },
  { category: 'Management', specs: ['REST API + Webhooks', 'Terraform Provider', 'Ansible Collection', 'Grafana Metrics', 'Control Panel'] },
];

export default function FeaturesPage() {
  return (
    <div className="animate-in">
      {/* Hero */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950" aria-labelledby="features-hero-heading">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 id="features-hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight mb-6">
              Features That{' '}
              <span className="text-indigo-600 dark:text-indigo-400">Power Your Infrastructure</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300">
              Enterprise-grade capabilities included on every plan. No feature gating, no surprises.
            </p>
          </div>
        </Container>
      </section>

      {/* Feature Categories */}
      {featureCategories.map((category, catIndex) => (
        <section key={category.title} className="py-20 lg:py-28" aria-labelledby={`cat-${category.title.toLowerCase()}`}>
          <Container>
            <div className="flex items-center gap-4 mb-12">
              <div className={cn('inline-flex items-center justify-center w-12 h-12 rounded-xl', category.bgColor, category.color)}>
                <category.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h2 id={`cat-${category.title.toLowerCase()}`} className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                  {category.title}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {category.title === 'Performance' && 'Built for speed and throughput'}
                  {category.title === 'Reliability' && 'Enterprise-grade resilience built in'}
                  {category.title === 'Global Reach' && 'Deploy worldwide with confidence'}
                  {category.title === 'Developer Experience' && 'Tools that developers love'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {category.features.map((feature, featIndex) => (
                <Card key={feature.title} variant="bordered" hover>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <div className={cn('inline-flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0', category.bgColor, category.color)}>
                        <feature.icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      ))}

      {/* Technical Specifications */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900" aria-labelledby="tech-specs-heading">
        <Container>
          <div className="text-center mb-16">
            <h2 id="tech-specs-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Technical Specifications
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Detailed specifications for architects and engineers who need the details.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technicalSpecs.map((spec) => (
              <Card key={spec.category} variant="bordered">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" aria-hidden="true" />
                    {spec.category}
                  </h3>
                  <ul className="space-y-2" role="list">
                    {spec.specs.map((s) => (
                      <li key={s} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0 mt-1.5" aria-hidden="true" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* API & Automation */}
      <section className="py-20 lg:py-28 bg-white dark:bg-slate-950" aria-labelledby="api-heading">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 id="api-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Infrastructure as Code
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                Manage your infrastructure programmatically with our comprehensive API, official Terraform provider,
                and integrations with popular automation tools.
              </p>
              <ul className="space-y-4" role="list">
                {[
                  'RESTful API with OpenAPI 3.0 specification',
                  'Official Terraform Provider (Registry verified)',
                  'Ansible Collection for configuration management',
                  'Pulumi SDK for TypeScript, Python, Go, and .NET',
                  'Crossplane Provider for Kubernetes-native management',
                  'Grafana datasource for metrics and monitoring',
                  'Webhooks for real-time event notifications',
                  'CLI tool for quick operations',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-900 dark:bg-slate-950 rounded-xl p-6 font-mono text-sm text-green-400 overflow-x-auto">
              <pre>{`# Terraform Example
resource "notixcloud_vps" "web" {
  name        = "web-server-01"
  plan        = "standard"
  location    = "new-york"
  image       = "ubuntu-24.04"
  ssh_keys    = [ssh_key.main.fingerprint]
  user_data   = file("cloud-init.yaml")
}

resource "notixcloud_ssh_key" "main" {
  name       = "main-key"
  public_key = file("~/.ssh/id_ed25519.pub")
}`}</pre>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28" aria-labelledby="features-cta-heading">
        <Container>
          <Card variant="elevated" className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900">
            <div className="relative mx-auto max-w-3xl text-center py-12 lg:py-16 px-6">
              <h2 id="features-cta-heading" className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Build?
              </h2>
              <p className="text-indigo-100 text-lg mb-8 max-w-xl mx-auto">
                Deploy your first server in minutes. Full API access from day one.
              </p>
              <a href="/register" className="inline-flex">
                <button className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
                  Start Deploying
                </button>
              </a>
            </div>
          </Card>
        </Container>
      </section>
    </div>
  );
}

import { cn } from '@/lib/utils';