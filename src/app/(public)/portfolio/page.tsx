import Link from 'next/link';
import { 
  Server, Database, Code, Users, Globe, Shield,
  ArrowRight, CheckCircle, Star, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const caseStudies = [
  {
    id: 'saas-scale',
    company: 'TechFlow SaaS',
    industry: 'B2B Software',
    logo: 'TF',
    challenge: 'Scaling from 10k to 1M+ users with unpredictable traffic spikes',
    solution: 'Auto-scaling VPS cluster with load balancers, managed PostgreSQL, and Redis caching',
    results: [
      '99.99% uptime achieved',
      '60% cost reduction vs previous cloud',
      'Sub-100ms response times globally',
      'Zero-downtime deployments',
    ],
    technologies: ['Next.js', 'PostgreSQL', 'Redis', 'Kubernetes', 'Terraform'],
    metrics: { uptime: '99.99%', latency: '<100ms', savings: '60%', users: '1M+' },
  },
  {
    id: 'gaming-platform',
    company: 'GameVerse Studios',
    industry: 'Gaming',
    logo: 'GV',
    challenge: 'Hosting 500+ game servers with DDoS protection for competitive tournaments',
    solution: 'Dedicated game server hosting with Anycast DDoS protection, custom kernel tuning',
    results: [
      'Zero successful DDoS attacks',
      'Support for 10k concurrent players',
      'Automated server provisioning <30s',
      'Global latency <50ms',
    ],
    technologies: ['Linux', 'Docker', 'Custom Kernel', 'Anycast', 'Prometheus'],
    metrics: { uptime: '100%', ddos: '0 attacks', players: '10k+', latency: '<50ms' },
  },
  {
    id: 'ecommerce-peak',
    company: 'StyleHub Commerce',
    industry: 'E-commerce',
    logo: 'SH',
    challenge: 'Handling Black Friday traffic spikes of 50x normal volume',
    solution: 'Horizontal scaling with managed Kubernetes, CDN integration, database read replicas',
    results: [
      'Handled 50x traffic spike',
      'Zero cart abandonment due to performance',
      'Auto-scaled from 5 to 200 nodes',
      'Saved $200k vs over-provisioning',
    ],
    technologies: ['Kubernetes', 'MySQL', 'Redis', 'Cloudflare', 'Helm'],
    metrics: { traffic: '50x spike', savings: '$200k', nodes: '5→200', conversion: '99.9%' },
  },
  {
    id: 'fintech-compliance',
    company: 'PayFlow Financial',
    industry: 'FinTech',
    logo: 'PF',
    challenge: 'PCI-DSS compliant infrastructure for payment processing',
    solution: 'Isolated VPC with encrypted storage, audit logging, dedicated compliance support',
    results: [
      'PCI-DSS Level 1 certified',
      'SOC 2 Type II compliant',
      'Encrypted data at rest and in transit',
      'Automated compliance reporting',
    ],
    technologies: ['Vault', 'Encrypted Volumes', 'Audit Logs', 'Private Network', 'SIEM'],
    metrics: { compliance: 'PCI-DSS L1', audit: 'SOC 2', encryption: 'AES-256', reports: 'Automated' },
  },
];

const testimonials = [
  {
    quote: "NOTIXCLOUD's infrastructure reliability has been game-changing for our platform. We've scaled 100x without a single infrastructure-related outage.",
    author: 'Sarah Chen',
    role: 'CTO',
    company: 'TechFlow SaaS',
    avatar: 'SC',
  },
  {
    quote: "The DDoS protection is bulletproof. During our championship tournament, we faced multiple attacks and not a single player experienced lag or disconnect.",
    author: 'Marcus Rodriguez',
    role: 'VP Engineering',
    company: 'GameVerse Studios',
    avatar: 'MR',
  },
  {
    quote: "Black Friday used to be our biggest infrastructure nightmare. With NOTIXCLOUD's auto-scaling, we handled 50x traffic and saved $200k in over-provisioning costs.",
    author: 'Emily Watson',
    role: 'Head of Platform',
    company: 'StyleHub Commerce',
    avatar: 'EW',
  },
  {
    quote: "Compliance is non-negotiable in FinTech. NOTIXCLOUD's dedicated compliance team and audit-ready infrastructure got us PCI-DSS certified in record time.",
    author: 'David Park',
    role: 'Security Lead',
    company: 'PayFlow Financial',
    avatar: 'DP',
  },
];

const trustBadges = [
  { name: 'SOC 2 Type II', icon: Shield },
  { name: 'PCI-DSS Level 1', icon: Shield },
  { name: 'ISO 27001', icon: Shield },
  { name: 'GDPR Compliant', icon: Globe },
  { name: 'HIPAA Ready', icon: Database },
  { name: '99.99% SLA', icon: Zap },
];

export default function PortfolioPage() {
  return (
    <div className="min-h-screen">
      <section className="py-20 sm:py-28 bg-notix-surface/30 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-notix-text mb-6">
              Trusted by Innovators Worldwide
            </h1>
            <p className="text-lg text-notix-textMuted mb-10">
              From startups to enterprises, teams choose NOTIXCLOUD for reliable, scalable infrastructure.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-notix-textMuted/50">
              {trustBadges.map((badge) => (
                <div key={badge.name} className="flex items-center gap-2">
                  <badge.icon className="w-5 h-5" />
                  <span className="text-sm">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-notix-text mb-16">Case Studies</h2>
          <div className="space-y-12">
            {caseStudies.map((study, index) => (
              <article key={study.id} className="card-base grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5">
                  <div className="aspect-video rounded-xl bg-gradient-to-br from-notix-accent/10 to-blue-500/10 border border-white/10 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-xl bg-notix-accent/20 flex items-center justify-center">
                      <span className="text-2xl font-bold text-notix-accent">{study.logo}</span>
                    </div>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-notix-surface border border-white/10 flex items-center justify-center">
                        <span className="text-xl font-bold text-notix-accent">{study.logo}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-notix-text">{study.company}</h3>
                        <p className="text-sm text-notix-textMuted">{study.industry}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/5">
                      <h4 className="text-sm font-medium text-notix-textMuted uppercase tracking-wider mb-3">Results</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(study.metrics).map(([key, value]) => (
                          <div key={key} className="text-center p-3 bg-notix-surface/50 rounded-lg">
                            <div className="text-2xl font-bold text-notix-accent">{value}</div>
                            <div className="text-xs text-notix-textMuted capitalize">{key}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {study.technologies.map((tech) => (
                        <span key={tech} className="px-3 py-1 text-xs bg-notix-surface border border-white/10 rounded text-notix-textMuted">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-notix-text mb-4">{study.company} - {study.industry}</h3>
                    <p className="text-notix-textMuted text-lg">{study.challenge}</p>
                  </div>
                  <div className="bg-notix-surface/50 rounded-xl p-6 border border-white/5">
                    <h4 className="font-semibold text-notix-text mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-notix-accent" />
                      Solution
                    </h4>
                    <p className="text-notix-textMuted mb-6">{study.solution}</p>
                    <div className="flex flex-wrap gap-2">
                      {study.technologies.map((tech) => (
                        <span key={tech} className="px-3 py-1 text-sm bg-notix-accent/10 border border-notix-accent/20 rounded text-notix-accent">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-notix-text mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      Key Outcomes
                    </h4>
                    <ul className="space-y-2">
                      {study.results.map((result) => (
                        <li key={result} className="flex items-center gap-3 text-notix-textMuted">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                          <span>{result}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link href={`/case-studies/${study.id}`} className="inline-flex items-center gap-2 text-notix-accent hover:underline font-medium mt-4">
                    Read Full Case Study
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-notix-surface/30 border-y border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-notix-text mb-16">What Our Customers Say</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.author} className="card-hover p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-notix-textMuted mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-notix-accent/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-notix-accent">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <p className="font-medium text-notix-text">{testimonial.author}</p>
                    <p className="text-sm text-notix-textMuted">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="card-base gradient-border text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-notix-text mb-4">Ready to Join Them?</h2>
            <p className="text-notix-textMuted mb-8 max-w-2xl mx-auto">
              Start your free trial today. No credit card required. Deploy in 60 seconds.
            </p>
            <Link href="/register">
              <Button size="xl">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}