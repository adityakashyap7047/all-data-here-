'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Server,
  Play,
  Square,
  RotateCcw,
  RefreshCw,
  Monitor,
  HardDrive,
  Cpu,
  MemoryStick,
  Globe,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
};

const statusColors: Record<string, { bg: string; text: string; dot: string; icon: React.ReactNode }> = {
  running: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500', icon: <CheckCircle className="h-3 w-3" /> },
  stopped: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', dot: 'bg-slate-500', icon: <Square className="h-3 w-3" /> },
  starting: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  stopping: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  restarting: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500', icon: <RotateCcw className="h-3 w-3 animate-spin" /> },
  reinstalling: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500', icon: <RefreshCw className="h-3 w-3 animate-spin" /> },
  error: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500', icon: <XCircle className="h-3 w-3" /> },
  creating: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', dot: 'bg-indigo-500', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
};

const billingColors: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  past_due: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
  cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
  expired: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300' },
  trial: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
};

interface ServerData {
  id: string;
  name: string;
  hostname: string;
  status: string;
  ipv4?: string;
  ipv6?: string;
  specs: {
    cpuCores: number;
    ramMb: number;
    storageGb: number;
    bandwidthTb: number;
    ipv4Count: number;
    ipv6Count: number;
  };
  location: string;
  osTemplate: string;
  osVersion?: string;
  billingStatus: string;
  nextDueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface ServerActionState {
  action: string | null;
  loading: boolean;
  error: string | null;
  success: string | null;
}

export default function ServerDetailClient() {
  const params = useParams();
  const serverId = params.id as string;
  const [server, setServer] = useState<ServerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionState, setActionState] = useState<ServerActionState>({
    action: null,
    loading: false,
    error: null,
    success: null,
  });
  const [showConsole, setShowConsole] = useState(false);
  const [consoleUrl, setConsoleUrl] = useState<string | null>(null);

  const fetchServer = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/dashboard/servers/${serverId}`);
      if (!response.ok) throw new Error('Failed to fetch server');
      const data = await response.json();
      setServer(data.server);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const loadServer = async () => {
      try {
        const response = await fetch(`/api/dashboard/servers/${serverId}`);
        if (!response.ok) throw new Error('Failed to fetch server');
        const data = await response.json();
        if (mounted) {
          setServer(data.server);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load server');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    loadServer();
    return () => { mounted = false; };
  }, [serverId]);

  const handleAction = async (action: string, confirmMessage?: string) => {
    if (confirmMessage && !window.confirm(confirmMessage)) return;

    setActionState({ action, loading: true, error: null, success: null });

    try {
      const response = await fetch(`/api/dashboard/servers/${serverId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Action failed');
      }

      setActionState({ action, loading: false, error: null, success: data.message || `${action} completed successfully` });
      fetchServer();
    } catch (err) {
      setActionState({ action, loading: false, error: err instanceof Error ? err.message : 'Action failed', success: null });
    }
  };

  const handleConsole = async () => {
    setActionState({ action: 'console', loading: true, error: null, success: null });
    try {
      const response = await fetch(`/api/dashboard/servers/${serverId}/console`);
      if (!response.ok) throw new Error('Failed to get console');
      const data = await response.json();
      if (data.url) {
        setConsoleUrl(data.url);
        setShowConsole(true);
      }
      setActionState({ action: 'console', loading: false, error: null, success: 'Console opened in new tab' });
    } catch (err) {
      setActionState({ action: 'console', loading: false, error: err instanceof Error ? err.message : 'Failed to open console', success: null });
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={mockUser}>
        <div className="animate-in space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Loading...</h1>
            </div>
          </div>
          <ServerDetailSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !server) {
    return (
      <DashboardLayout user={mockUser}>
        <div className="animate-in text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Unable to Load Server</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error || 'Server not found'}</p>
          <Link href="/dashboard/servers">
            <Button>Back to Servers</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const colors = statusColors[server.status] || statusColors.running;
  const billingColor = billingColors[server.billingStatus] || billingColors.active;

  const isActionable = ['running', 'stopped'].includes(server.status) && !actionState.loading;
  const isDestructiveAction = ['reinstall', 'destroy'].includes(actionState.action || '');

  return (
    <DashboardLayout user={mockUser}>
      <div className="space-y-6 animate-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link href="/dashboard/servers" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mb-2 inline-flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to Servers
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{server.name}</h1>
              <Badge variant="outline" className={cn(colors.bg, colors.text, 'gap-1.5')}>
                {colors.icon}
                <span className="capitalize">{server.status}</span>
              </Badge>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{server.hostname}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isActionable && server.status === 'stopped' && (
              <Button onClick={() => handleAction('start', 'Start this server?')} icon={<Play className="h-4 w-4" />} loading={actionState.action === 'start' && actionState.loading}>
                Start
              </Button>
            )}
            {isActionable && server.status === 'running' && (
              <Button variant="outline" onClick={() => handleAction('stop', 'Stop this server?')} icon={<Square className="h-4 w-4" />} loading={actionState.action === 'stop' && actionState.loading}>
                Stop
              </Button>
            )}
            {isActionable && server.status === 'running' && (
              <Button variant="outline" onClick={() => handleAction('restart', 'Restart this server?')} icon={<RotateCcw className="h-4 w-4" />} loading={actionState.action === 'restart' && actionState.loading}>
                Restart
              </Button>
            )}
            {isActionable && (
              <Button variant="outline" onClick={handleConsole} icon={<Monitor className="h-4 w-4" />} loading={actionState.action === 'console' && actionState.loading}>
                Console
              </Button>
            )}
            {isActionable && (
              <Button variant="outline" onClick={() => handleAction('reinstall', 'This will ERASE all data on the server. Are you sure?')} icon={<RefreshCw className="h-4 w-4" />} loading={actionState.action === 'reinstall' && actionState.loading}>
                Reinstall
              </Button>
            )}
          </div>
        </div>

        {(actionState.error || actionState.success) && (
          <div className={cn(
            'p-4 rounded-lg flex items-center justify-between gap-4 animate-in',
            actionState.error
              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
          )}>
            <div className="flex items-center gap-3">
              {actionState.error ? <XCircle className="h-5 w-5 text-red-600" /> : <CheckCircle className="h-5 w-5 text-green-600" />}
              <span className={actionState.error ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}>
                {actionState.error || actionState.success}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActionState({ action: null, loading: false, error: null, success: null })}>
              Dismiss
            </Button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatItem label="vCPU" value={server.specs.cpuCores} icon={<Cpu className="h-5 w-5" />} color="indigo" />
                  <StatItem label="RAM" value={`${server.specs.ramMb / 1024} GB`} icon={<MemoryStick className="h-5 w-5" />} color="blue" />
                  <StatItem label="Storage" value={`${server.specs.storageGb} GB`} icon={<HardDrive className="h-5 w-5" />} color="green" />
                  <StatItem label="Bandwidth" value={`${server.specs.bandwidthTb} TB`} icon={<Globe className="h-5 w-5" />} color="purple" />
                </div>

                <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white mb-3">Network</h4>
                    <dl className="space-y-2 text-sm">
                      {server.ipv4 && (
                        <div className="flex justify-between">
                          <dt className="text-slate-500 dark:text-slate-400">Primary IPv4</dt>
                          <dd className="font-mono text-slate-900 dark:text-white">{server.ipv4}</dd>
                        </div>
                      )}
                      {server.ipv6 && (
                        <div className="flex justify-between">
                          <dt className="text-slate-500 dark:text-slate-400">Primary IPv6</dt>
                          <dd className="font-mono text-slate-900 dark:text-white">{server.ipv6}</dd>
                        </div>
                      )}
                      {!server.ipv4 && !server.ipv6 && (
                        <p className="text-slate-500 dark:text-slate-400">No IP addresses assigned</p>
                      )}
                    </dl>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white mb-3">System</h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-slate-500 dark:text-slate-400">OS</dt>
                        <dd className="text-slate-900 dark:text-white">{server.osTemplate} {server.osVersion ? `(${server.osVersion})` : ''}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500 dark:text-slate-400">Location</dt>
                        <dd className="text-slate-900 dark:text-white">{server.location}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500 dark:text-slate-400">Created</dt>
                        <dd className="text-slate-900 dark:text-white">{new Date(server.createdAt).toLocaleDateString()}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500 dark:text-slate-400">Last Updated</dt>
                        <dd className="text-slate-900 dark:text-white">{new Date(server.updatedAt).toLocaleDateString()}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Console Access</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Access your server&apos;s console via VNC. This provides out-of-band access even if the network is down.
                  </p>
                  <Button onClick={handleConsole} icon={<Monitor className="h-4 w-4" />} loading={actionState.action === 'console' && actionState.loading} className="w-full sm:w-auto">
                    {actionState.action === 'console' && actionState.loading ? 'Opening Console...' : 'Launch Console'}
                  </Button>
                  {consoleUrl && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      Console URL: <a href={consoleUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-mono">{consoleUrl}</a>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Billing</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
                    <Badge variant="outline" className={cn(billingColor.bg, billingColor.text)}>
                      {server.billingStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                  {server.nextDueDate && (
                    <div className="text-right">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Next Payment</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{new Date(server.nextDueDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Plan</p>
                    <p className="font-semibold text-slate-900 dark:text-white">Custom VPS</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Monthly Cost</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{formatPrice(4500)}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Link href="/dashboard/billing">
                    <Button variant="outline" className="w-full">Manage Billing</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-700 dark:text-red-400">Delete Server</p>
                      <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                        This action is irreversible. All data will be permanently deleted.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleAction('destroy', 'PERMANENTLY DELETE this server? Type the server name to confirm.')}
                      icon={<Trash2 className="h-4 w-4" />}
                      loading={actionState.action === 'destroy' && actionState.loading}
                    >
                      Delete Server
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatItem({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  const colors = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
      <div className="flex items-center justify-between">
        <div className={cn('p-2 rounded-lg', colors[color])}>{icon}</div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
}

function ServerDetailSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card variant="bordered">
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg animate-pulse">
                  <div className="h-5 w-5 rounded bg-slate-200 dark:bg-slate-700 mb-3" />
                  <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded mt-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card variant="bordered">
          <CardContent className="pt-6 space-y-4 animate-pulse">
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { cn } from '@/lib/utils';