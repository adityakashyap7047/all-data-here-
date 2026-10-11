'use client';

import { useState } from 'react';
import {
  Server, Database, Cpu, HardDrive, Network, Wifi, WifiOff,
  AlertTriangle, RefreshCw, Plus, ExternalLink, Settings,
  ChevronRight, ChevronLeft, TrendingUp, TrendingDown,
  Search, Filter, MoreVertical, Edit, Trash2, Play, Square,
  RotateCw, Terminal, Activity, Shield
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Node {
  id: string;
  name: string;
  hostname: string;
  sshPort: number;
  sshUsername: string;
  authType: string;
  nodeType: string;
  status: string;
  os: string | null;
  arch: string | null;
  cpuCores: number | null;
  totalRam: number | null;
  availableRam: number | null;
  totalDisk: number | null;
  availableDisk: number | null;
  lastHealthCheck: Date | null;
  lastConnection: Date | null;
  connectionError: string | null;
  javaVersion: string | null;
  dockerVersion: string | null;
  agentVersion: string | null;
  maxServers: number;
  reservedCpu: number;
  reservedRam: number;
  reservedDisk: number;
  firewallConfigured: boolean;
  tlsConfigured: boolean;
  createdAt: Date;
  _count: { servers: number };
  metrics: Array<{
    cpuUsage: number;
    ramUsage: number;
    diskUsage: number;
    networkIn: number;
    networkOut: number;
  }>;
}

interface AdminNodesClientProps {
  nodes: Node[];
  total: number;
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

const authTypeConfig = {
  SSH_KEY: { label: 'SSH Key', color: 'text-green-400', bg: 'bg-green-500/10' },
  AGENT: { label: 'Agent', color: 'text-blue-400', bg: 'bg-blue-500/10' },
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

function getAuthTypeBadge(type: string) {
  const config = authTypeConfig[type as keyof typeof authTypeConfig] || authTypeConfig.SSH_KEY;
  return (
    <Badge variant="outline" className={cn(config.bg, config.color)}>
      {config.label}
    </Badge>
  );
}

export default function AdminNodesClient({ nodes }: AdminNodesClientProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });

  const filteredNodes = nodes
    .filter(node => {
      if (statusFilter !== 'all' && node.status !== statusFilter) return false;
      if (typeFilter !== 'all' && node.nodeType !== typeFilter) return false;
      if (search && !node.name.toLowerCase().includes(search.toLowerCase()) &&
          !node.hostname.toLowerCase().includes(search.toLowerCase()) &&
          !node.os?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-notix-text">Connected Nodes</h1>
          <p className="text-notix-textMuted mt-1">Manage your registered VPS infrastructure nodes</p>
        </div>
        <Button asChild>
          <Link href="/admin/infrastructure/add">
            <Plus className="w-4 h-4 mr-2" />
            Add VPS Node
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
                placeholder="Search by name, hostname, OS..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-auto">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ONLINE">Online</SelectItem>
                  <SelectItem value="OFFLINE">Offline</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="UNREACHABLE">Unreachable</SelectItem>
                  <SelectItem value="ERROR">Error</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-auto">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="PRODUCTION">Production</SelectItem>
                  <SelectItem value="DEVELOPMENT">Development</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nodes Table */}
      <Card className="card-base">
        <CardHeader>
          <CardTitle>All Nodes ({nodes.length} total)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                    Node <ChevronRight className="w-4 h-4 ml-1 inline" />
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('hostname')}>
                    Hostname <ChevronRight className="w-4 h-4 ml-1 inline" />
                  </TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Auth</TableHead>
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
                {filteredNodes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-notix-textMuted">
                      No nodes found. <Link href="/admin/infrastructure/add" className="text-notix-accent hover:underline ml-2">Add your first VPS node</Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNodes.map((node) => {
                    const latestMetric = node.metrics[0];
                    const ramUsage = node.totalRam && node.availableRam !== null
                      ? ((node.totalRam - node.availableRam) / node.totalRam * 100).toFixed(1)
                      : '0';
                    const diskUsage = node.totalDisk && node.availableDisk !== null
                      ? ((node.totalDisk - node.availableDisk) / node.totalDisk * 100).toFixed(1)
                      : '0';
                    const cpuUsage = latestMetric ? latestMetric.cpuUsage.toFixed(1) : '0';

                    return (
                      <TableRow key={node.id} className="hover:bg-white/5">
                        <TableCell className="font-medium text-notix-text">{node.name}</TableCell>
                        <TableCell className="font-mono text-sm text-notix-textMuted">
                          {node.hostname}:{node.sshPort}
                        </TableCell>
                        <TableCell>{getNodeTypeBadge(node.nodeType)}</TableCell>
                        <TableCell>{getAuthTypeBadge(node.authType)}</TableCell>
                        <TableCell>{getStatusBadge(node.status)}</TableCell>
                        <TableCell className="text-notix-textMuted">
                          {node.cpuCores || 'N/A'} cores
                          {latestMetric && <span className="text-xs ml-1">({cpuUsage}%)</span>}
                        </TableCell>
                        <TableCell className="text-notix-textMuted">
                          {node.totalRam
                            ? `${formatRam(node.totalRam - (node.availableRam || 0))} / ${formatRam(node.totalRam)}`
                            : 'N/A'}
                          <span className="text-xs text-notix-textMuted ml-1">({ramUsage}%)</span>
                        </TableCell>
                        <TableCell className="text-notix-textMuted">
                          {node.totalDisk
                            ? `${formatDisk(node.totalDisk - (node.availableDisk || 0))} / ${formatDisk(node.totalDisk)}`
                            : 'N/A'}
                          <span className="text-xs text-notix-textMuted ml-1">({diskUsage}%)</span>
                        </TableCell>
                        <TableCell className="text-notix-textMuted">{node._count.servers}/{node.maxServers}</TableCell>
                        <TableCell className="text-notix-textMuted">
                          {node.lastHealthCheck
                            ? new Date(node.lastHealthCheck).toLocaleString()
                            : node.lastConnection
                            ? new Date(node.lastConnection).toLocaleString()
                            : 'Never'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-notix-surface border border-white/10">
                              <DropdownMenuItem asChild className="flex items-center gap-2">
                                <Link href={`/admin/infrastructure/nodes/${node.id}`}>
                                  <ExternalLink className="w-4 h-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild className="flex items-center gap-2">
                                <Link href={`/admin/infrastructure/nodes/${node.id}/edit`}>
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild className="flex items-center gap-2">
                                <Link href={`/admin/infrastructure/nodes/${node.id}/logs`}>
                                  <Activity className="w-4 h-4" />
                                  Connection Logs
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {node.status === 'ONLINE' && (
                                <DropdownMenuItem className="flex items-center gap-2 text-yellow-400">
                                  <Square className="w-4 h-4" />
                                  Set Maintenance
                                </DropdownMenuItem>
                              )}
                              {node.status === 'MAINTENANCE' && (
                                <DropdownMenuItem className="flex items-center gap-2 text-green-400">
                                  <RotateCw className="w-4 h-4" />
                                  Mark Online
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem asChild className="flex items-center gap-2">
                                <Link href={`/admin/infrastructure/deployments?node=${node.id}`}>
                                  <Server className="w-4 h-4" />
                                  Deploy Server
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="flex items-center gap-2 text-red-400">
                                <Trash2 className="w-4 h-4" />
                                Delete Node
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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