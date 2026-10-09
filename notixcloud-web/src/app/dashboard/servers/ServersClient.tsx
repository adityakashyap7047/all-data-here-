'use client';

import { useState, useEffect } from 'react';
import { Server, Plus, Search, Filter, MoreVertical, RefreshCw, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import { formatPrice } from '@/lib/utils';

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
};

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  running: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
  stopped: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', dot: 'bg-slate-500' },
  starting: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  stopping: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500' },
  restarting: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
  reinstalling: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
  error: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  creating: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', dot: 'bg-indigo-500' },
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
  };
  location: string;
  osTemplate: string;
  billingStatus: string;
  nextDueDate?: string;
  createdAt: string;
}

export default function ServersClient() {
  const [servers, setServers] = useState<ServerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    let mounted = true;
    const loadServers = async () => {
      try {
        const response = await fetch('/api/dashboard/servers');
        if (!response.ok) throw new Error('Failed to fetch servers');
        const data = await response.json();
        if (mounted) {
          setServers(data.servers || []);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load servers');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    loadServers();
    return () => { mounted = false; };
  }, []);

  const filteredServers = servers
    .filter((server) => {
      if (searchQuery && !server.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !server.hostname.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !server.ipv4?.includes(searchQuery)) {
        return false;
      }
      if (statusFilter !== 'all' && server.status !== statusFilter) return false;
      if (locationFilter !== 'all' && server.location !== locationFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const aVal = a[sortBy as keyof ServerData];
      const bVal = b[sortBy as keyof ServerData];
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const locations = [...new Set(servers.map((s) => s.location))];

  return (
    <DashboardLayout user={mockUser}>
      <div className="space-y-6 animate-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Servers</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your virtual private servers</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.location.reload()} loading={loading} icon={<RefreshCw className="h-4 w-4" />}>
              Refresh
            </Button>
            <Link href="/vps">
              <Button icon={<Plus className="h-4 w-4" />}>Deploy New Server</Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center justify-between">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        )}

        <Card variant="bordered">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search by name, hostname, IP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'running', label: 'Running' },
                    { value: 'stopped', label: 'Stopped' },
                    { value: 'starting', label: 'Starting' },
                    { value: 'stopping', label: 'Stopping' },
                    { value: 'restarting', label: 'Restarting' },
                    { value: 'error', label: 'Error' },
                  ]}
                  className="w-40"
                />
                <Select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Locations' },
                    ...locations.map((loc) => ({ value: loc, label: loc })),
                  ]}
                  className="w-48"
                />
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  options={[
                    { value: 'createdAt', label: 'Created Date' },
                    { value: 'name', label: 'Name' },
                    { value: 'status', label: 'Status' },
                    { value: 'location', label: 'Location' },
                  ]}
                  className="w-40"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  icon={sortOrder === 'asc' ? <ChevronDown className="h-4 w-4 rotate-180" /> : <ChevronDown className="h-4 w-4" />}
                />
              </div>
            </div>

            {loading ? (
              <ServerTableSkeleton />
            ) : filteredServers.length === 0 ? (
              <EmptyState onDeploy={() => window.location.reload()} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" role="table">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Server</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Specs</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">IP Addresses</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Billing</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredServers.map((server) => (
                      <ServerRow key={server.id} server={server} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function ServerRow({ server }: { server: ServerData }) {
  const colors = statusColors[server.status] || statusColors.running;
  const billingColors = {
    active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    past_due: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    expired: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    trial: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  };

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-4 py-4">
        <Link href={`/dashboard/servers/${server.id}`} className="group">
          <div className="flex items-center gap-3">
            <Server className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            <div>
              <p className="font-medium text-slate-900 dark:text-white truncate max-w-xs">{server.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs">{server.hostname}</p>
            </div>
          </div>
        </Link>
      </td>
      <td className="px-4 py-4">
        <Badge variant="outline" className={cn(colors.bg, colors.text, 'gap-1.5')}>
          <span className={cn('w-2 h-2 rounded-full', colors.dot)} />
          <span className="capitalize">{server.status}</span>
        </Badge>
      </td>
      <td className="px-4 py-4">
        <div className="text-sm text-slate-600 dark:text-slate-400 font-mono">
          {server.specs.cpuCores} vCPU &middot; {server.specs.ramMb / 1024} GB RAM &middot; {server.specs.storageGb} GB NVMe
        </div>
      </td>
      <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{server.location}</td>
      <td className="px-4 py-4">
        <div className="space-y-1 font-mono text-sm">
          {server.ipv4 && <span className="text-slate-600 dark:text-slate-400">{server.ipv4}</span>}
          {server.ipv6 && <span className="text-slate-500 dark:text-slate-500">{server.ipv6}</span>}
          {!server.ipv4 && !server.ipv6 && <span className="text-slate-400">No IPs assigned</span>}
        </div>
      </td>
      <td className="px-4 py-4">
        <Badge variant="outline" className={billingColors[server.billingStatus as keyof typeof billingColors] || billingColors.active}>
          {server.billingStatus.replace('_', ' ')}
          {server.nextDueDate && <span className="ml-1 text-xs">· Due {new Date(server.nextDueDate).toLocaleDateString()}</span>}
        </Badge>
      </td>
      <td className="px-4 py-4 text-right">
        <Link href={`/dashboard/servers/${server.id}`}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </Link>
      </td>
    </tr>
  );
}

function ServerTableSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <div className="h-5 w-5 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-3 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onDeploy }: { onDeploy: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 text-slate-400">
        <Server className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No servers found</h3>
      <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm mx-auto">
        Get started by deploying your first VPS server.
      </p>
      <Link href="/vps">
        <Button onClick={onDeploy} icon={<Plus className="h-4 w-4" />}>
          Deploy Server
        </Button>
      </Link>
    </div>
  );
}

import { cn } from '@/lib/utils';