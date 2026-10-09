'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, XCircle, Info, RefreshCw, ExternalLink, Clock, Mail, Rss, Webhook } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const statusColors: Record<string, { bg: string; text: string; dot: string; icon: React.ReactNode }> = {
  OPERATIONAL: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500', icon: <CheckCircle className="h-4 w-4" /> },
  DEGRADED_PERFORMANCE: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500', icon: <AlertTriangle className="h-4 w-4" /> },
  PARTIAL_OUTAGE: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500', icon: <AlertCircle className="h-4 w-4" /> },
  MAJOR_OUTAGE: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500', icon: <XCircle className="h-4 w-4" /> },
  UNDER_MAINTENANCE: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500', icon: <Info className="h-4 w-4" /> },
};

const incidentColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  INVESTIGATING: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: <Info className="h-3 w-3" /> },
  IDENTIFIED: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', icon: <AlertTriangle className="h-3 w-3" /> },
  MONITORING: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', icon: <Clock className="h-3 w-3" /> },
  RESOLVED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: <CheckCircle className="h-3 w-3" /> },
  POSTMORTEM: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', icon: <ExternalLink className="h-3 w-3" /> },
};

const impactColors: Record<string, { bg: string; text: string }> = {
  NONE: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300' },
  MINOR: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  MAJOR: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
  CRITICAL: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
};

interface StatusService {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  incidents: StatusIncident[];
}

interface StatusIncident {
  id: string;
  title: string;
  description: string;
  status: string;
  impact: string;
  startedAt: string;
  resolvedAt: string | null;
}

interface StatusData {
  overallStatus: string;
  services: StatusService[];
  lastUpdated: string;
}

export default function StatusClient() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch('/api/status');
        if (!response.ok) throw new Error('Failed to fetch status');
        const result = await response.json();
        setData(result);
        setLastRefresh(new Date());
      } catch (err) {
        setError('Failed to load system status. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/status');
      if (!response.ok) throw new Error('Failed to fetch status');
      const result = await response.json();
      setData(result);
      setLastRefresh(new Date());
    } catch (err) {
      setError('Failed to refresh status.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="animate-in">
        <section className="py-20 lg:py-28 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-6">
                System Status
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Real-time status of all NOTIXCLOUD services.
              </p>
            </div>
          </Container>
        </section>
        <section className="py-20" aria-labelledby="status-loading">
          <Container>
            <div id="status-loading" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" aria-busy="true">
              {[...Array(4)].map((_, i) => (
                <Card key={i} variant="bordered">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
                      <div>
                        <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-3/4 animate-pulse" />
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2 animate-pulse mt-1" />
                      </div>
                    </div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="animate-in">
        <section className="py-20 lg:py-28 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-6">
                System Status
              </h1>
            </div>
          </Container>
        </section>
        <section className="py-20" aria-labelledby="status-error">
          <Container>
            <div id="status-error" className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Unable to Load Status</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">{error}</p>
              <Button onClick={handleRefresh} loading={loading}>
                <RefreshCw className="h-4 w-4 mr-2" /> Retry
              </Button>
            </div>
          </Container>
        </section>
      </div>
    );
  }

  if (!data) return null;

  const overallStatusColors = statusColors[data.overallStatus] || statusColors.OPERATIONAL;

  return (
    <div className="animate-in">
      {/* Hero */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950" aria-labelledby="status-hero-heading">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium mb-6">
              <span className={cn('h-2 w-2 rounded-full', overallStatusColors.dot)} aria-hidden="true" />
              <span className="capitalize">{data.overallStatus.toLowerCase().replace(/_/g, ' ')}</span>
              <span className="text-slate-500 dark:text-slate-400 ml-2">|</span>
              <span>Last updated: {lastRefresh ? lastRefresh.toLocaleTimeString() : new Date().toLocaleTimeString()}</span>
              <Button variant="ghost" size="sm" onClick={handleRefresh} loading={loading} className="ml-2">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <h1 id="status-hero-heading" className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
              System Status
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
              Real-time monitoring of all NOTIXCLOUD infrastructure and services.
            </p>
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl" style={{ backgroundColor: overallStatusColors.bg.replace('dark:', '') }}>
              <span className={cn('h-3 w-3 rounded-full', overallStatusColors.dot)} aria-hidden="true" />
              <span className={cn('font-semibold', overallStatusColors.text)}>
                All Systems {data.overallStatus === 'OPERATIONAL' ? 'Operational' : data.overallStatus.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* Services Grid */}
      <section className="py-20 lg:py-28 bg-white dark:bg-slate-950" aria-labelledby="services-heading">
        <Container>
          <div className="mb-12">
            <h2 id="services-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Service Status
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
              Current status of all platform services. Click a service to view incident history.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </Container>
      </section>

      {/* Recent Incidents */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900" aria-labelledby="incidents-heading">
        <Container>
          <div className="mb-12">
            <h2 id="incidents-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Recent Incidents
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
              Latest incidents and maintenance events across all services.
            </p>
          </div>

          <div className="space-y-4">
            {data.services.flatMap((s) => s.incidents.map((i) => ({ ...i, serviceName: s.name }))).slice(0, 10).map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
            {data.services.flatMap((s) => s.incidents).length === 0 && (
              <Card variant="bordered">
                <CardContent className="pt-6 pb-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Recent Incidents</h3>
                  <p className="text-slate-600 dark:text-slate-400">All systems have been operating normally.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </Container>
      </section>

      {/* Subscribe */}
      <section className="py-20 lg:py-28 bg-white dark:bg-slate-950" aria-labelledby="subscribe-heading">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="subscribe-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Stay Informed
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              Subscribe to status updates via email, RSS, or webhook to get notified about incidents and maintenance.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button variant="outline" className="w-full">
                <Mail className="h-4 w-4 mr-2" /> Email Updates
              </Button>
              <Button variant="outline" className="w-full">
                <Rss className="h-4 w-4 mr-2" /> RSS Feed
              </Button>
              <Button variant="outline" className="w-full">
                <Webhook className="h-4 w-4 mr-2" /> Webhook
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

function ServiceCard({ service }: { service: StatusService }) {
  const colors = statusColors[service.status] || statusColors.OPERATIONAL;

  return (
    <Card variant="bordered" hover className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <span className={cn('h-2.5 w-2.5 rounded-full', colors.dot)} aria-hidden="true" />
              {service.name}
            </CardTitle>
            {service.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{service.description}</p>
            )}
          </div>
          <Badge variant="outline" className={cn(colors.bg, colors.text)}>
            {colors.icon}
            <span className="capitalize">{service.status.toLowerCase().replace(/_/g, ' ')}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        {service.incidents.length > 0 ? (
          <div className="space-y-3">
            {service.incidents.slice(0, 2).map((incident) => (
              <div key={incident.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className={cn('flex-shrink-0 mt-0.5', incidentColors[incident.status]?.bg, incidentColors[incident.status]?.text, 'rounded-full p-1')}>
                    {incidentColors[incident.status]?.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{incident.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {new Date(incident.startedAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline" size="sm" className={cn(impactColors[incident.impact]?.bg, impactColors[incident.impact]?.text)}>
                    {incident.impact}
                  </Badge>
                </div>
              </div>
            ))}
            {service.incidents.length > 2 && (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                +{service.incidents.length - 2} more incidents
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-2">
              <CheckCircle className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">No recent incidents</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function IncidentCard({ incident }: { incident: StatusIncident & { serviceName: string } }) {
  const statusColors_ = incidentColors[incident.status] || incidentColors.INVESTIGATING;
  const impactColors_ = impactColors[incident.impact] || impactColors.NONE;

  return (
    <Card variant="bordered">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={cn('inline-flex items-center justify-center w-8 h-8 rounded-full', statusColors_.bg, statusColors_.text)}>
                {statusColors_.icon}
              </span>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{incident.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{incident.serviceName}</p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 ml-11">{incident.description}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Badge variant="outline" className={cn(statusColors_.bg, statusColors_.text)}>
              {incident.status.replace(/_/g, ' ')}
            </Badge>
            <Badge variant="outline" className={cn(impactColors_.bg, impactColors_.text)}>
              {incident.impact} Impact
            </Badge>
            <div className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
              <Clock className="h-4 w-4 inline mr-1" aria-hidden="true" />
              Started: {new Date(incident.startedAt).toLocaleString()}
              {incident.resolvedAt && (
                <> &middot; Resolved: {new Date(incident.resolvedAt).toLocaleString()}</>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}