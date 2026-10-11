'use client';

import { useState } from 'react';
import {
  Server, Database, Cpu, HardDrive, Network, Wifi, WifiOff,
  AlertTriangle, RefreshCw, Plus, ExternalLink, Settings,
  ChevronRight, ChevronLeft, TrendingUp, TrendingDown
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface Stats {
  totalNodes: number;
  onlineNodes: number;
  maintenanceNodes: number;
  offlineNodes: number;
  totalServers: number;
  runningServers: number;
  totalCpuCores: number;
  totalRam: number;
  totalDisk: number;
  usedRam: number;
  usedDisk: number;
}

interface Node {
  id: string;
  name: string;
  hostname: string;
  nodeType: string;
  status: string;
  cpuCores: number | null;
  totalRam: number | null;
  availableRam: number | null;
  totalDisk: number | null;
  availableDisk: number | null;
  lastHealthCheck: Date | null;
  lastConnection: Date | null;
  connectionError: string | null;
  javaVersion: string | null;
  agentVersion: string | null;
  _count: { servers: number };
  metrics: Array<{
    cpuUsage: number;
    ramUsage: number;
    diskUsage: number;
    networkIn: number;
    networkOut: number;
  }>;
}

interface AdminInfrastructureOverviewClientProps {
  stats: Stats;
  nodes: Node[];
}

const statusConfig = {
  ONLINE: { label: 'Online', color: 'text-green-400', bg: 'bg-green-500/10', icon: Wifi },
  OFFLINE: { label: 'Offline', color: 'text-red-400', bg: 'bg-red-500/10', icon: WifiOff },
  MAINTENANCE: { label: 'Maintenance', color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: AlertTriangle },
  UNREACHABLE: { label: 'Unreachable', color: 'text-gray-400', bg: 'bg-gray-500/10', icon: WifiOff },
  ERROR: { label: 'Error', color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertTriangle },
};

const nodeTypeConfig = {
  PRODUCTION: { label: 'Production', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  DEVELOPMENT: { label: 'Development', color: 'text-purple-400', bg: 'bg-purple-500/10' },
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatRam(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb} MB`;
}

function formatDisk(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} TB`;
  return `${mb} GB`;
}

function getStatusBadge(status: string) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.UNREACHABLE;
  const Icon = config.icon;
  return (
    <Badge className={cn('gap-1', config.bg, config.color)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

function getNodeTypeBadge(type: string) {
  const config = nodeTypeConfig[type as keyof typeof nodeTypeConfig] || nodeTypeConfig.PRODUCTION;
  return (
    <Badge variant="outline" className={cn(config.bg, config.color)}>
      {config.label}
    </Badge>
  );
}

export default function AdminInfrastructureOverviewClient({ stats, nodes }: AdminInfrastructureOverviewClientProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });

  const sortedNodes = [...nodes].sort((a, b) => {
    const aVal = a[sortConfig.key as keyof Node];
    const bVal = b[sortConfig.key as keyof Node];
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const ramUsagePercent = stats.totalRam > 0 ? ((stats.usedRam / stats.totalRam) * 100).toFixed(1) : '0';
  const diskUsagePercent = stats.totalDisk > 0 ? ((stats.usedDisk / stats.totalDisk) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-notix-text">VPS Overview</h1>
          <p className="text-notix-textMuted mt-1">Monitor and manage your infrastructure nodes</p>
        </div>
        <Button asChild>
          <Link href="/admin/infrastructure/add">
            <Plus className="w-4 h-4 mr-2" />
            Add VPS Node
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <Card className="card-base">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-notix-textMuted">Total Nodes</p>
                <p className="text-3xl font-bold text-notix-text">{stats.totalNodes}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Server className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-base">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-notix-textMuted">Online</p>
                <p className="text-3xl font-bold text-green-400">{stats.onlineNodes}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Wifi className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-base">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-notix-textMuted">Maintenance</p>
                <p className="text-3xl font-bold text-yellow-400">{stats.maintenanceNodes}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-base">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-notix-textMuted">Offline</p>
                <p className="text-3xl font-bold text-red-400">{stats.offlineNodes}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <WifiOff className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-base">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-notix-textMuted">Total CPU Cores</p>
                <p className="text-3xl font-bold text-notix-text">{stats.totalCpuCores}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Cpu className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-base">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-notix-textMuted">RAM Usage</p>
                <p className="text-3xl font-bold text-notix-text">{formatRam(stats.usedRam)} / {formatRam(stats.totalRam)}</p>
                <p className="text-xs text-notix-textMuted">{ramUsagePercent}% used</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Database className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-base">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-notix-textMuted">Disk Usage</p>
                <p className="text-3xl font-bold text-notix-text">{formatDisk(stats.usedDisk)} / {formatDisk(stats.totalDisk)}</p>
                <p className="text-xs text-notix-textMuted">{diskUsagePercent}% used</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="card-base">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-notix-textMuted">Total Servers</p>
                <p className="text-3xl font-bold text-notix-text">{stats.totalServers}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Database className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-base">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-notix-textMuted">Running Servers</p>
                <p className="text-3xl font-bold text-green-400">{stats.runningServers}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-base">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-notix-textMuted">Stopped Servers</p>
                <p className="text-3xl font-bold text-yellow-400">{stats.totalServers - stats.runningServers}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 rotate-180 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-base">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-notix-textMuted">Avg RAM/Server</p>
                <p className="text-3xl font-bold text-notix-text">{stats.totalServers > 0 ? formatRam(Math.round(stats.usedRam / stats.totalServers)) : '0 MB'}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
                <Server className="w-6 h-6 text-pink-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Nodes Table */}
      <Card className="card-base">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Nodes</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/infrastructure/nodes">
              View All <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                    Node Name <ChevronRight className="w-4 h-4 ml-1 inline" />
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('hostname')}>
                    Hostname <ChevronRight className="w-4 h-4 ml-1 inline" />
                  </TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('cpuCores')}>
                    CPU <ChevronRight className="w-4 h-4 ml-1 inline" />
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('totalRam')}>
                    RAM <ChevronRight className="w-4 h-4 ml-1 inline" />
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('totalDisk')}>
                    Disk <ChevronRight className="w-4 h-4 ml-1 inline" />
                  </TableHead>
                  <TableHead>Servers</TableHead>
                  <TableHead>Last Check</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedNodes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-notix-textMuted">
                      No nodes registered yet. <Link href="/admin/infrastructure/add" className="text-notix-accent hover:underline ml-2">Add your first VPS node</Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedNodes.map((node) => {
                    const latestMetric = node.metrics[0];
                    const ramUsage = node.totalRam && node.availableRam !== null
                      ? ((node.totalRam - node.availableRam) / node.totalRam * 100).toFixed(1)
                      : '0';
                    const diskUsage = node.totalDisk && node.availableDisk !== null
                      ? ((node.totalDisk - node.availableDisk) / node.totalDisk * 100).toFixed(1)
                      : '0';

                    return (
                      <TableRow key={node.id} className="hover:bg-white/5">
                        <TableCell className="font-medium text-notix-text">{node.name}</TableCell>
                        <TableCell className="font-mono text-sm text-notix-textMuted">{node.hostname}</TableCell>
                        <TableCell>{getNodeTypeBadge(node.nodeType)}</TableCell>
                        <TableCell>{getStatusBadge(node.status)}</TableCell>
                        <TableCell className="text-notix-textMuted">{node.cpuCores || 'N/A'} cores</TableCell>
                        <TableCell className="text-notix-textMuted">
                          {node.totalRam ? `${formatRam(node.totalRam - (node.availableRam || 0))} / ${formatRam(node.totalRam)}` : 'N/A'}
                          <span className="text-xs text-notix-textMuted ml-1">({ramUsage}%)</span>
                        </TableCell>
                        <TableCell className="text-notix-textMuted">
                          {node.totalDisk ? `${formatDisk(node.totalDisk - (node.availableDisk || 0))} / ${formatDisk(node.totalDisk)}` : 'N/A'}
                          <span className="text-xs text-notix-textMuted ml-1">({diskUsage}%)</span>
                        </TableCell>
                        <TableCell className="text-notix-textMuted">{node._count.servers}</TableCell>
                        <TableCell className="text-notix-textMuted">
                          {node.lastHealthCheck
                            ? new Date(node.lastHealthCheck).toLocaleString()
                            : node.lastConnection
                            ? new Date(node.lastConnection).toLocaleString()
                            : 'Never'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                              <Link href={`/admin/infrastructure/nodes/${node.id}`}>
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                              <Link href={`/admin/infrastructure/nodes/${node.id}/edit`}>
                                <Settings className="w-4 h-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}