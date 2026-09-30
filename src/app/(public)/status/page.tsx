'use client';

import { useState, useEffect } from 'react';
import { 
  Server, Database, Network, Cloud, 
  CheckCircle, AlertCircle, XCircle, 
  RefreshCw, Clock, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatRelativeTime, formatDate } from '@/lib/utils';

function StatusIcon({ config }: { config: { icon: any; color: string } }) {
  const Icon = config.icon;
  return <Icon className={`w-5 h-5 ${config.color}`} />;
}

interface ComponentStatus {
  id: string;
  name: string;
  description: string;
  status: 'operational' | 'degraded' | 'partial_outage' | 'major_outage';
  lastUpdated: string;
}

interface Incident {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'minor' | 'major' | 'critical';
  components: string[];
  createdAt: string;
  updatedAt: string;
  updates: Array<{
    timestamp: string;
    status: string;
    message: string;
  }>;
}

const mockComponents: ComponentStatus[] = [
  { id: 'api', name: 'API', description: 'REST API and GraphQL endpoints', status: 'operational', lastUpdated: new Date().toISOString() },
  { id: 'dashboard', name: 'Customer Dashboard', description: 'Web dashboard and control panel', status: 'operational', lastUpdated: new Date().toISOString() },
  { id: 'billing', name: 'Billing & Payments', description: 'Invoice generation and payment processing', status: 'operational', lastUpdated: new Date().toISOString() },
  { id: 'provisioning', name: 'VPS Provisioning', description: 'Server creation and management', status: 'operational', lastUpdated: new Date().toISOString() },
  { id: 'compute-us-east', name: 'Compute - US East (NYC)', description: 'Virtual machines in New York', status: 'operational', lastUpdated: new Date().toISOString() },
  { id: 'compute-us-west', name: 'Compute - US West (SFO)', description: 'Virtual machines in San Francisco', status: 'operational', lastUpdated: new Date().toISOString() },
  { id: 'compute-eu-central', name: 'Compute - EU Central (FRA)', description: 'Virtual machines in Frankfurt', status: 'operational', lastUpdated: new Date().toISOString() },
  { id: 'compute-ap-south', name: 'Compute - AP South (SIN)', description: 'Virtual machines in Singapore', status: 'operational', lastUpdated: new Date().toISOString() },
  { id: 'network', name: 'Network & CDN', description: 'Global network, DDoS protection, load balancing', status: 'operational', lastUpdated: new Date().toISOString() },
  { id: 'storage', name: 'Block Storage', description: 'Persistent volumes and snapshots', status: 'operational', lastUpdated: new Date().toISOString() },
  { id: 'backups', name: 'Backup Service', description: 'Automated and manual backups', status: 'operational', lastUpdated: new Date().toISOString() },
  { id: 'monitoring', name: 'Monitoring & Alerts', description: 'Metrics collection and alerting', status: 'operational', lastUpdated: new Date().toISOString() },
];

const mockIncidents: Incident[] = [
  {
    id: 'inc-001',
    title: 'Elevated API latency in EU Central',
    status: 'monitoring',
    severity: 'minor',
    components: ['api', 'compute-eu-central'],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updates: [
      { timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), status: 'monitoring', message: 'Latency has returned to normal. Continuing to monitor.' },
      { timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(), status: 'identified', message: 'Identified network congestion on upstream provider. Traffic rerouted.' },
      { timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(), status: 'investigating', message: 'Investigating elevated API response times in EU Central region.' },
    ],
  },
  {
    id: 'inc-002',
    title: 'Scheduled maintenance - Network upgrades',
    status: 'resolved',
    severity: 'major',
    components: ['network', 'compute-us-east', 'compute-us-west'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updates: [
      { timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'resolved', message: 'Maintenance completed successfully. All systems operational.' },
      { timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(), status: 'monitoring', message: 'Maintenance in progress. Monitoring for any issues.' },
      { timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), status: 'investigating', message: 'Scheduled maintenance window started. Upgrading core network infrastructure.' },
    ],
  },
];

const statusConfig = {
  operational: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Operational' },
  degraded: { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Degraded Performance' },
  partial_outage: { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Partial Outage' },
  major_outage: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Major Outage' },
};

const incidentStatusConfig = {
  investigating: { color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Investigating' },
  identified: { color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Identified' },
  monitoring: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Monitoring' },
  resolved: { color: 'text-green-400', bg: 'bg-green-500/10', label: 'Resolved' },
};

const severityConfig = {
  minor: { color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  major: { color: 'text-orange-400', bg: 'bg-orange-500/10' },
  critical: { color: 'text-red-400', bg: 'bg-red-500/10' },
};

export default function StatusPage() {
  const [components, setComponents] = useState<ComponentStatus[]>(mockComponents);
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLastRefresh(new Date());
    setIsLoading(false);
  };

  const overallStatus = components.some(c => c.status === 'major_outage') ? 'major_outage' :
    components.some(c => c.status === 'partial_outage') ? 'partial_outage' :
    components.some(c => c.status === 'degraded') ? 'degraded' : 'operational';

  return (
    <div className="min-h-screen">
      <section className="py-16 sm:py-24 bg-notix-surface/30 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-notix-text mb-4">System Status</h1>
              <p className="text-lg text-notix-textMuted">Real-time infrastructure status and incident history</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg',
                statusConfig[overallStatus].bg
              )}>
                <StatusIcon config={statusConfig[overallStatus]} />
                <span className={cn('font-medium', statusConfig[overallStatus].color)}>
                  All Systems {statusConfig[overallStatus].label}
                </span>
              </div>
              <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')} />
                Refresh
              </Button>
            </div>
          </div>
          <div className="mt-8 flex items-center gap-4 text-sm text-notix-textMuted">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Last updated: {formatRelativeTime(lastRefresh)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Next scheduled maintenance: {formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-notix-text mb-8">Component Status</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {components.map((component) => {
              const config = statusConfig[component.status];
              const Icon = config.icon;
              return (
                <div key={component.id} className="card-base hover:shadow-[0_10px_40px_rgba(0,0,0,0.3)] transition-all">
                  <div className="flex items-start gap-4">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', config.bg)}>
                      <Icon className={cn('w-5 h-5', config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-notix-text truncate">{component.name}</h3>
                      <p className="text-sm text-notix-textMuted mt-1">{component.description}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className={cn('px-2 py-1 rounded text-xs font-medium', config.bg, config.color)}>
                          {config.label}
                        </span>
                        <span className="text-xs text-notix-textMuted/50">
                          Updated {formatRelativeTime(component.lastUpdated)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-notix-surface/30 border-y border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-notix-text mb-8">Recent Incidents</h2>
          <div className="space-y-6">
            {incidents.map((incident) => {
              const statusConfigInc = incidentStatusConfig[incident.status];
              const severityConfigInc = severityConfig[incident.severity];
              return (
                <div key={incident.id} className="card-base">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className={cn('px-3 py-1 rounded text-sm font-medium', statusConfigInc.bg, statusConfigInc.color)}>
                        {statusConfigInc.label}
                      </span>
                      <span className={cn('px-3 py-1 rounded text-sm font-medium', severityConfigInc.bg, severityConfigInc.color)}>
                        {incident.severity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-notix-textMuted">
                      <Clock className="w-4 h-4" />
                      <span>Created {formatRelativeTime(incident.createdAt)}</span>
                      <span>•</span>
                      <span>Updated {formatRelativeTime(incident.updatedAt)}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-notix-text mb-2">{incident.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {incident.components.map((comp) => (
                      <span key={comp} className="px-2 py-1 text-xs bg-notix-bg rounded border border-white/10 text-notix-textMuted">
                        {comp}
                      </span>
                    ))}
                  </div>
                  <details className="group">
                    <summary className="flex items-center gap-2 text-notix-accent hover:underline cursor-pointer">
                      <span>View timeline ({incident.updates.length} updates)</span>
                      <AlertCircle className="w-4 h-4" />
                    </summary>
                    <div className="mt-4 space-y-4 border-l-2 border-white/10 pl-4">
                      {incident.updates.map((update, i) => (
                        <div key={i} className="relative pb-4 last:pb-0">
                          <div className="absolute left-[-10px] top-1 w-2 h-2 rounded-full bg-notix-accent" />
                          <div className="text-sm text-notix-textMuted mb-1">{formatDate(update.timestamp, { hour: '2-digit', minute: '2-digit' })}</div>
                          <div className="flex items-center gap-2">
                            <span className={cn('px-2 py-0.5 rounded text-xs font-medium', statusConfigInc.bg, statusConfigInc.color)}>
                              {update.status}
                            </span>
                            <span className="text-notix-text">{update.message}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-notix-text mb-4">Subscribe to Updates</h2>
          <p className="text-notix-textMuted mb-8 max-w-2xl mx-auto">
            Get notified via email, webhook, or RSS when we create, update, or resolve incidents.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <a href="/subscribe">Email Notifications</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/status/rss.xml">RSS Feed</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/api/status/webhook">Webhook Setup</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}