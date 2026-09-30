'use client';

import { useState } from 'react';
import { 
  Server, Plus, Search, Filter, MoreVertical,
  Play, Square, RotateCw, Terminal, Database,
  RefreshCw, Trash2, Edit, Download, ExternalLink,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const vpsInstances = [
  { id: 'vps-1', name: 'web-prod-01', hostname: 'web-prod-01', status: 'running', plan: 'Professional', location: 'US East (NYC)', ipv4: '192.0.2.1', ipv6: '2001:db8::1', os: 'Ubuntu 22.04 LTS', createdAt: '2024-01-15', expiresAt: '2024-02-15', cpu: 45, memory: 62, disk: 38, backupEnabled: true },
  { id: 'vps-2', name: 'db-primary', hostname: 'db-primary', status: 'running', plan: 'Enterprise', location: 'EU Central (FRA)', ipv4: '192.0.2.2', ipv6: '2001:db8::2', os: 'Ubuntu 22.04 LTS', createdAt: '2024-01-10', expiresAt: '2024-02-10', cpu: 23, memory: 78, disk: 55, backupEnabled: true },
  { id: 'vps-3', name: 'staging-app', hostname: 'staging-app', status: 'stopped', plan: 'Standard', location: 'US West (SFO)', ipv4: '192.0.2.3', ipv6: '2001:db8::3', os: 'Debian 12', createdAt: '2024-01-20', expiresAt: '2024-02-20', cpu: 0, memory: 12, disk: 22, backupEnabled: false },
  { id: 'vps-4', name: 'api-gateway', hostname: 'api-gateway', status: 'running', plan: 'Standard', location: 'AP South (SIN)', ipv4: '192.0.2.4', ipv6: '2001:db8::4', os: 'AlmaLinux 9', createdAt: '2024-01-25', expiresAt: '2024-02-25', cpu: 12, memory: 34, disk: 18, backupEnabled: true },
];

const statusConfig = {
  running: { label: 'Running', color: 'text-green-400', bg: 'bg-green-500/10', icon: Play },
  stopped: { label: 'Stopped', color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: Square },
  pending: { label: 'Pending', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: RefreshCw },
  provisioning: { label: 'Provisioning', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: RefreshCw },
  suspended: { label: 'Suspended', color: 'text-orange-400', bg: 'bg-orange-500/10', icon: AlertTriangle },
  terminated: { label: 'Terminated', color: 'text-red-400', bg: 'bg-red-500/10', icon: Trash2 },
  error: { label: 'Error', color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertTriangle },
};

export default function VPSListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredInstances = vpsInstances
    .filter(vps => {
      if (statusFilter !== 'all' && vps.status !== statusFilter) return false;
      if (search && !vps.name.toLowerCase().includes(search.toLowerCase()) && 
          !vps.ipv4.includes(search) && !vps.hostname.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a];
      const bVal = b[sortBy as keyof typeof b];
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.running;
    const Icon = config.icon;
    return (
      <Badge className={cn('gap-1', config.bg, config.color)}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getActionItems = (vps: typeof vpsInstances[0]) => [
    { label: vps.status === 'running' ? 'Stop' : 'Start', icon: vps.status === 'running' ? Square : Play, action: vps.status === 'running' ? 'stop' : 'start', variant: 'default' as const, confirm: vps.status === 'running' },
    { label: 'Reboot', icon: RotateCw, action: 'reboot', variant: 'secondary' as const, confirm: true },
    { label: 'Console', icon: Terminal, action: 'console', variant: 'ghost' as const, confirm: false, external: true },
    { label: 'Backups', icon: Database, action: 'backups', variant: 'ghost' as const, confirm: false },
    { label: 'Reinstall OS', icon: RefreshCw, action: 'reinstall', variant: 'destructive' as const, confirm: true },
    { label: 'Delete', icon: Trash2, action: 'delete', variant: 'destructive' as const, confirm: true },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-notix-text">VPS Instances</h1>
          <p className="text-notix-textMuted mt-1">Manage your virtual private servers</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/vps/new">
            <Plus className="w-4 h-4 mr-2" />
            Deploy New VPS
          </Link>
        </Button>
      </div>

      {/* Toolbar */}
      <Card className="card-base">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-notix-textMuted" />
              <Input
                placeholder="Search by name, IP, hostname..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field w-auto"
              >
                <option value="all">All Status</option>
                <option value="running">Running</option>
                <option value="stopped">Stopped</option>
                <option value="pending">Pending</option>
                <option value="provisioning">Provisioning</option>
                <option value="suspended">Suspended</option>
                <option value="error">Error</option>
              </select>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* VPS Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredInstances.map((vps) => (
          <Card key={vps.id} className="card-hover relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-notix-text">{vps.name}</h3>
                <p className="text-sm text-notix-textMuted">{vps.hostname}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-notix-surface border border-white/10">
                  {getActionItems(vps).map((action) => (
                    <DropdownMenuItem
                      key={action.action}
                      className={cn(
                        'flex items-center gap-2',
                        action.variant === 'destructive' && 'text-red-400 focus:text-red-400'
                      )}
                      onClick={() => console.log(action.action, vps.id)}
                    >
                      <action.icon className="w-4 h-4" />
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-400 focus:text-red-400" onClick={() => console.log('delete', vps.id)}>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(vps.status)}
                <Badge variant="outline" className="text-xs">{vps.plan}</Badge>
                <Badge variant="outline" className="text-xs">{vps.location}</Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-notix-textMuted">
                <span className="font-mono">{vps.ipv4}</span>
                {vps.ipv6 && <span className="font-mono truncate max-w-[150px]">{vps.ipv6}</span>}
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 mb-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-notix-text">{vps.cpu}%</p>
                  <p className="text-xs text-notix-textMuted">CPU</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-notix-text">{vps.memory}%</p>
                  <p className="text-xs text-notix-textMuted">RAM</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-notix-text">{vps.disk}%</p>
                  <p className="text-xs text-notix-textMuted">Disk</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-notix-textMuted border-t border-white/5 pt-4 mb-4">
              <span>{vps.os}</span>
              <span>Expires {new Date(vps.expiresAt).toLocaleDateString()}</span>
            </div>

            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex-1" size="sm">
                <Link href={`/dashboard/vps/${vps.id}`}>Manage</Link>
              </Button>
              {vps.status === 'running' ? (
                <Button variant="ghost" size="sm" className="text-yellow-400 hover:text-yellow-300">
                  <Square className="w-4 h-4" />
                </Button>
              ) : (
                <Button variant="default" size="sm" className="text-green-400 hover:bg-green-500/10">
                  <Play className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>
        ))}

        {filteredInstances.length === 0 && (
          <div className="col-span-full card-base text-center py-16">
            <Server className="w-16 h-16 text-notix-textMuted/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-notix-text mb-2">No VPS instances found</h3>
            <p className="text-notix-textMuted mb-6">Deploy your first server to get started</p>
            <Button asChild>
              <Link href="/dashboard/vps/new">Deploy First VPS</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}