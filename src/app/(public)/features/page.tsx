import { 
  Server, Shield, Zap, Globe, Database, Lock, 
  Terminal, Monitor, GitBranch, Key, 
  Cpu, HardDrive, Network, Cloud,
  ArrowRight, CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const featureCategories = [
  {
    title: 'Compute & Performance',
    icon: Cpu,
    features: [
      { title: 'Latest Gen CPUs', desc: 'AMD EPYC & Intel Xeon Scalable processors for maximum performance.' },
      { title: 'NVMe SSD Storage', desc: 'Enterprise-grade NVMe drives with 10x the speed of traditional SSDs.' },
      { title: 'Dedicated Resources', desc: 'No noisy neighbors. Your CPU, RAM, and I/O are guaranteed.' },
      { title: 'KVM Virtualization', desc: 'Full hardware virtualization with near-bare-metal performance.' },
    ],
  },
  {
    title: 'Network & Connectivity',
    icon: Network,
    features: [
      { title: 'Global Anycast Network', desc: '6+ data centers with Anycast routing for lowest latency.' },
      { title: 'DDoS Protection', desc: 'Always-on, automatic DDoS mitigation up to 1 Tbps included free.' },
      { title: 'Private Networking', desc: 'Secure VLANs between your servers across all locations.' },
      { title: 'Multiple IPs', desc: 'Additional IPv4/IPv6 addresses available on demand.' },
    ],
  },
  {
    title: 'Storage & Data',
    icon: HardDrive,
    features: [
      { title: 'Automated Backups', desc: 'Daily incremental backups with 7-day retention. One-click restore.' },
      { title: 'Snapshot Backups', desc: 'Instant snapshots before changes. Revert in seconds.' },
      { title: 'Offsite Replication', desc: 'Backups replicated to geographically separate facility.' },
      { title: 'Custom ISO Mount', desc: 'Mount any ISO for custom OS installations or recovery.' },
    ],
  },
  {
    title: 'Developer Experience',
    icon: Terminal,
    features: [
      { title: 'REST API & CLI', desc: 'Full programmatic control. Terraform provider available.' },
      { title: 'Cloud-Init Support', desc: 'Automate server configuration on first boot.' },
      { title: 'SSH Key Management', desc: 'Add/remove SSH keys per server or globally.' },
      { title: 'Web Console Access', desc: 'Browser-based VNC/Serial console for emergency access.' },
    ],
  },
];

const osTemplates = [
  { name: 'Ubuntu 22.04 LTS', icon: 'ubuntu', type: 'linux' },
  { name: 'Ubuntu 20.04 LTS', icon: 'ubuntu', type: 'linux' },
  { name: 'Debian 12', icon: 'debian', type: 'linux' },
  { name: 'Debian 11', icon: 'debian', type: 'linux' },
  { name: 'CentOS Stream 9', icon: 'centos', type: 'linux' },
  { name: 'Rocky Linux 9', icon: 'rocky', type: 'linux' },
  { name: 'AlmaLinux 9', icon: 'alma', type: 'linux' },
  { name: 'Fedora 39', icon: 'fedora', type: 'linux' },
  { name: 'Windows Server 2022', icon: 'windows', type: 'windows' },
  { name: 'Windows Server 2019', icon: 'windows', type: 'windows' },
];

const integrations = [
  { name: 'Terraform', desc: 'Infrastructure as Code' },
  { name: 'Ansible', desc: 'Configuration Management' },
  { name: 'Packer', desc: 'Image Building' },
  { name: 'Kubernetes', desc: 'Container Orchestration' },
  { name: 'Docker', desc: 'Container Runtime' },
  { name: 'Prometheus', desc: 'Monitoring & Alerting' },
  { name: 'Grafana', desc: 'Visualization' },
  { name: 'Cloudflare', desc: 'CDN & DNS' },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      <section className="py-20 sm:py-28 bg-notix-surface/30 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-notix-text mb-6">
              Features That Power Your Infrastructure
            </h1>
            <p className="text-lg text-notix-textMuted">
              Enterprise-grade features included on every plan. Built for developers, scaled for teams.
            </p>
          </div>
        </div>
      </section>

      {featureCategories.map((category, catIndex) => (
        <section key={category.title} className={cn('py-20', catIndex % 2 === 0 ? 'bg-notix-bg' : 'bg-notix-surface/30')}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-notix-accent/10 border border-notix-accent/20 text-notix-accent text-sm font-medium mb-4">
                  <category.icon className="w-4 h-4" />
                  <span>{category.title}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-notix-text mb-6">
                  {category.title}
                </h2>
                <div className="space-y-6">
                  {category.features.map((feature, i) => (
                    <div key={feature.title} className="flex gap-4 card-hover p-4 rounded-xl bg-notix-surface/50 border border-white/5 group">
                      <div className="w-12 h-12 rounded-xl bg-notix-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-notix-accent/20 transition-colors">
                        <CheckCircle className="w-6 h-6 text-notix-accent" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-notix-text">{feature.title}</h3>
                        <p className="text-notix-textMuted mt-1">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-notix-accent/10 to-blue-500/10 border border-white/10 flex items-center justify-center">
                  <category.icon className="w-48 h-48 text-notix-accent/30" />
                </div>
                {category.title === 'Compute & Performance' && (
                  <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-notix-accent/5 rounded-2xl blur-3xl" />
                )}
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="py-20 bg-notix-surface/30 border-y border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-notix-text mb-4">Operating Systems</h2>
            <p className="text-lg text-notix-textMuted">Deploy any OS in seconds. Custom ISOs supported.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {osTemplates.map((os) => (
              <div key={os.name} className="card-base flex flex-col items-center gap-3 p-6">
                <div className="w-16 h-16 rounded-xl bg-notix-accent/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-notix-accent">
                    {os.icon === 'ubuntu' ? 'U' : os.icon === 'debian' ? 'D' : os.icon === 'centos' ? 'C' : os.icon === 'rocky' ? 'R' : os.icon === 'alma' ? 'A' : os.icon === 'fedora' ? 'F' : 'W'}
                  </span>
                </div>
                <span className="text-sm font-medium text-notix-text text-center">{os.name}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-notix-surface border border-white/10 text-notix-textMuted capitalize">{os.type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-notix-text mb-4">Integrations & Ecosystem</h2>
            <p className="text-lg text-notix-textMuted">Works with the tools you already use.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {integrations.map((integration) => (
              <div key={integration.name} className="card-hover p-6 text-center group">
                <div className="w-14 h-14 rounded-xl bg-notix-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-notix-accent/20 transition-colors">
                  <Cloud className="w-7 h-7 text-notix-accent" />
                </div>
                <h3 className="font-semibold text-notix-text">{integration.name}</h3>
                <p className="text-sm text-notix-textMuted mt-1">{integration.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-notix-surface/30 border-y border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="card-base gradient-border">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-notix-text mb-4">Built for Automation</h2>
                <p className="text-notix-textMuted mb-8">
                  Our API-first approach means everything in the dashboard is available via API. 
                  Terraform provider, Ansible modules, and CLI tools make infrastructure as code effortless.
                </p>
                <div className="space-y-3">
                  {[
                    'Create, manage, and destroy VPS instances',
                    'Configure networking, firewalls, and load balancers',
                    'Manage backups, snapshots, and monitoring',
                    'Automate scaling with webhooks and metrics',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-notix-accent flex-shrink-0" />
                      <span className="text-notix-textMuted">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-notix-bg rounded-xl border border-white/10 p-6 font-mono text-sm overflow-x-auto">
                <pre className="text-notix-textMuted">{`# Create a VPS with Terraform
resource "notixcloud_vps" "web" {
  name        = "web-server"
  plan_slug   = "standard"
  region      = "us-east"
  os_template = "ubuntu-22.04"
  ssh_keys    = [var.ssh_key_id]
  
  tags = {
    environment = "production"
    team        = "backend"
  }
}`}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-notix-text mb-4">Ready to Build?</h2>
          <p className="text-notix-textMuted mb-8 max-w-2xl mx-auto">
            Deploy your first server in under 60 seconds. No credit card required for trial.
          </p>
          <Link href="/register">
            <Button size="xl">
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}