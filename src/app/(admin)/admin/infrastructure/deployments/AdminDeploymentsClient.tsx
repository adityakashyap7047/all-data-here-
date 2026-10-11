'use client';

import { useState } from 'react';
import {
  Server, Database, Cpu, HardDrive, Network, Wifi, WifiOff,
  AlertTriangle, Plus, Search, Filter, MoreVertical, Edit, Trash2,
  Play, Square, RotateCw, Terminal, Database as DatabaseIcon,
  Download, ExternalLink, Shield, Settings, ChevronRight,
  CheckCircle, XCircle, Loader2, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface Server {
  id: string;
  name: string;
  nodeId: string;
  version: string;
  softwareType: string;
  allocatedCpu: number;
  allocatedRam: number;
  allocatedDisk: number;
  port: number;
  status: string;
  javaArgs: string | null;
  serverProperties: any;
  worldName: string | null;
  maxPlayers: number;
  motd: string | null;
  createdAt: Date;
  startedAt: Date | null;
  stoppedAt: Date | null;
  node: {
    id: string;
    name: string;
    hostname: string;
    status: string;
  };
}

interface Node {
  id: string;
  name: string;
  hostname: string;
  status: string;
  cpuCores: number | null;
  totalRam: number | null;
  availableRam: number | null;
  totalDisk: number | null;
  availableDisk: number | null;
  _count: { servers: number };
}

interface AdminDeploymentsClientProps {
  nodes: Node[];
  servers: Server[];
  total: number;
}

const statusConfig = {
  RUNNING: { label: 'Running', color: 'text-green-400', bg: 'bg-green-500/10', icon: Play },
  STOPPED: { label: 'Stopped', color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: Square },
  STARTING: { label: 'Starting', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: RotateCw },
  STOPPING: { label: 'Stopping', color: 'text-orange-400', bg: 'bg-orange-500/10', icon: RotateCw },
  ERROR: { label: 'Error', color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertTriangle },
  PENDING: { label: 'Pending', color: 'text-gray-400', bg: 'bg-gray-500/10', icon: AlertTriangle },
};

const nodeStatusConfig = {
  ONLINE: { label: 'Online', color: 'text-green-400', bg: 'bg-green-500/10' },
  OFFLINE: { label: 'Offline', color: 'text-red-400', bg: 'bg-red-500/10' },
  MAINTENANCE: { label: 'Maintenance', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  UNREACHABLE: { label: 'Unreachable', color: 'text-gray-400', bg: 'bg-gray-500/10' },
  ERROR: { label: 'Error', color: 'text-red-400', bg: 'bg-red-500/10' },
};

function formatRam(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb} MB`;
}

function formatDisk(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} TB`;
  return `${mb} GB`;
}

function getStatusBadge(status: string) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
  const Icon = config.icon;
  return (
    <Badge className={cn('gap-1', config.bg, config.color)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

function getNodeStatusBadge(status: string) {
  const config = nodeStatusConfig[status as keyof typeof nodeStatusConfig] || nodeStatusConfig.UNREACHABLE;
  return (
    <Badge variant="outline" className={cn(config.bg, config.color)}>
      {config.label}
    </Badge>
  );
}

export default function AdminDeploymentsClient({ nodes, servers }: AdminDeploymentsClientProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [nodeFilter, setNodeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'servers' | 'deploy'>('servers');

  const filteredServers = servers
    .filter(server => {
      if (statusFilter !== 'all' && server.status !== statusFilter) return false;
      if (nodeFilter !== 'all' && server.nodeId !== nodeFilter) return false;
      if (search && !server.name.toLowerCase().includes(search.toLowerCase()) &&
          !server.node?.name.toLowerCase().includes(search.toLowerCase()) &&
          !server.version.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

  const onlineNodes = nodes.filter(n => n.status === 'ONLINE');
  const totalAllocatedCpu = servers.reduce((sum, s) => sum + s.allocatedCpu, 0);
  const totalAllocatedRam = servers.reduce((sum, s) => sum + s.allocatedRam, 0);
  const totalAllocatedDisk = servers.reduce((sum, s) => sum + s.allocatedDisk, 0);
  const runningServers = servers.filter(s => s.status === 'RUNNING').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-notix-text">Server Deployments</h1>
          <p className="text-notix-textMuted mt-1">Deploy and manage Minecraft servers across your infrastructure</p>
        </div>
        <Button asChild>
          <Link href="/admin/infrastructure/deployments?tab=deploy">
            <Plus className="w-4 h-4 mr-2" />
            Deploy Server
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="card-base">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-notix-textMuted">Total Servers</p>
                <p className="text-3xl font-bold text-notix-text">{servers.length}</p>
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
                <p className="text-sm text-notix-textMuted">Running</p>
                <p className="text-3xl font-bold text-green-400">{runningServers}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Play className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-base">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-notix-textMuted">Stopped</p>
                <p className="text-3xl font-bold text-yellow-400">{servers.length - runningServers}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Square className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-base">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-notix-textMuted">Total RAM</p>
                <p className="text-3xl font-bold text-notix-text">{formatRam(totalAllocatedRam)}</p>
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
                <p className="text-sm text-notix-textMuted">Total Disk</p>
                <p className="text-3xl font-bold text-notix-text">{formatDisk(totalAllocatedDisk)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="servers">
            <Server className="w-4 h-4 mr-2" />
            Servers ({servers.length})
          </TabsTrigger>
          <TabsTrigger value="deploy">
            <Plus className="w-4 h-4 mr-2" />
            Deploy New
          </TabsTrigger>
          <TabsTrigger value="nodes">
            <Database className="w-4 h-4 mr-2" />
            Nodes ({nodes.length})
          </TabsTrigger>
        </TabsList>

        {/* Servers Tab */}
        <TabsContent value="servers">
          <div className="space-y-4">
            {/* Toolbar */}
            <Card className="card-base">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-notix-textMuted" />
                    <Input
                      placeholder="Search servers..."
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
                        <SelectItem value="RUNNING">Running</SelectItem>
                        <SelectItem value="STOPPED">Stopped</SelectItem>
                        <SelectItem value="STARTING">Starting</SelectItem>
                        <SelectItem value="ERROR">Error</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={nodeFilter} onValueChange={setNodeFilter}>
                      <SelectTrigger className="w-auto">
                        <SelectValue placeholder="All Nodes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Nodes</SelectItem>
                        {nodes.map(node => (
                          <SelectItem key={node.id} value={node.id}>
                            {node.name} ({node.status})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Servers Table */}
            <Card className="card-base">
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Server</TableHead>
                        <TableHead>Node</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Software</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Resources</TableHead>
                        <TableHead>Port</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredServers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-notix-textMuted">
                            No servers found. <Link href="/admin/infrastructure/deployments?tab=deploy" className="text-notix-accent hover:underline ml-2">Deploy your first server</Link>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredServers.map(server => (
                          <TableRow key={server.id} className="hover:bg-white/5">
                            <TableCell className="font-medium text-notix-text">{server.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getNodeStatusBadge(server.node?.status || 'UNREACHABLE')}
                                <span className="text-notix-textMuted">{server.node?.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-notix-textMuted">{server.version}</TableCell>
                            <TableCell className="text-notix-textMuted">{server.softwareType}</TableCell>
                            <TableCell>{getStatusBadge(server.status)}</TableCell>
                            <TableCell className="text-notix-textMuted">
                              <div className="flex flex-col gap-1">
                                <span>CPU: {server.allocatedCpu} cores</span>
                                <span>RAM: {formatRam(server.allocatedRam)}</span>
                                <span>Disk: {formatDisk(server.allocatedDisk)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm text-notix-textMuted">{server.port}</TableCell>
                            <TableCell className="text-notix-textMuted">{new Date(server.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-notix-surface border border-white/10">
                                  {server.status === 'STOPPED' && (
                                    <DropdownMenuItem className="flex items-center gap-2 text-green-400">
                                      <Play className="w-4 h-4" />
                                      Start
                                    </DropdownMenuItem>
                                  )}
                                  {server.status === 'RUNNING' && (
                                    <DropdownMenuItem className="flex items-center gap-2 text-yellow-400">
                                      <Square className="w-4 h-4" />
                                      Stop
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem className="flex items-center gap-2">
                                    <RotateCw className="w-4 h-4" />
                                    Restart
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="flex items-center gap-2">
                                    <Terminal className="w-4 h-4" />
                                    Console
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="flex items-center gap-2">
                                    <DatabaseIcon className="w-4 h-4" />
                                    Backup
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem asChild className="flex items-center gap-2">
                                    <Link href={`/admin/infrastructure/deployments/${server.id}/edit`}>
                                      <Settings className="w-4 h-4" />
                                      Edit Config
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="flex items-center gap-2 text-red-400">
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Deploy Tab */}
        <TabsContent value="deploy">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="card-base lg:col-span-1">
              <CardHeader>
                <CardTitle>Deploy New Server</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-notix-textMuted">Configure and deploy a new Minecraft server to one of your nodes.</p>

                <div>
                  <label className="block text-sm font-medium text-notix-text">Server Name *</label>
                  <Input placeholder="my-minecraft-server" className="mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-notix-text">Target Node *</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select node" />
                    </SelectTrigger>
                    <SelectContent>
                      {onlineNodes.length === 0 ? (
                        <SelectItem disabled value="">No online nodes available</SelectItem>
                      ) : (
                        onlineNodes.map(node => (
                          <SelectItem key={node.id} value={node.id}>
                            {node.name} ({formatRam(node.availableRam || 0)} RAM avail)
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-notix-text">Minecraft Version *</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select version" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1.20.4">1.20.4 (Latest)</SelectItem>
                        <SelectItem value="1.20.2">1.20.2</SelectItem>
                        <SelectItem value="1.19.4">1.19.4</SelectItem>
                        <SelectItem value="1.18.2">1.18.2</SelectItem>
                        <SelectItem value="1.16.5">1.16.5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-notix-text">Software Type *</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select software" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VANILLA">Vanilla</SelectItem>
                        <SelectItem value="PAPER">Paper (Recommended)</SelectItem>
                        <SelectItem value="SPIGOT">Spigot</SelectItem>
                        <SelectItem value="PURPUR">Purpur</SelectItem>
                        <SelectItem value="FABRIC">Fabric</SelectItem>
                        <SelectItem value="FORGE">Forge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-notix-text">CPU Cores *</label>
                    <Input type="number" min="1" max="64" defaultValue="2" className="mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-notix-text">RAM (MB) *</label>
                    <Input type="number" min="512" max="65536" defaultValue="2048" className="mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-notix-text">Disk (MB) *</label>
                    <Input type="number" min="1024" max="1048576" defaultValue="10240" className="mt-1" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-notix-text">Port *</label>
                  <Input type="number" min="1024" max="65535" defaultValue="25565" className="mt-1" />
                </div>

                <Button className="w-full" size="lg">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Deploy Server
                </Button>
              </CardContent>
            </Card>

            <Card className="card-base">
              <CardHeader>
                <CardTitle>Node Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                {onlineNodes.length === 0 ? (
                  <div className="text-center py-8 text-notix-textMuted">
                    <WifiOff className="w-12 h-12 text-notix-textMuted/30 mx-auto mb-2" />
                    <p>No online nodes available</p>
                    <p className="text-sm">Add and connect a VPS node first</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {onlineNodes.map(node => {
                      const allocCpu = servers.filter(s => s.nodeId === node.id).reduce((sum, s) => sum + s.allocatedCpu, 0);
                      const allocRam = servers.filter(s => s.nodeId === node.id).reduce((sum, s) => sum + s.allocatedRam, 0);
                      const allocDisk = servers.filter(s => s.nodeId === node.id).reduce((sum, s) => sum + s.allocatedDisk, 0);
                      const availCpu = (node.cpuCores || 0) - 1;
                      const availRam = (node.totalRam || 0) - 1024;
                      const availDisk = (node.totalDisk || 0) - 10240;

                      return (
                        <div key={node.id} className="space-y-2 p-4 bg-white/5 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <Server className="w-5 h-5 text-green-400" />
                              </div>
                              <div>
                                <p className="font-medium text-notix-text">{node.name}</p>
                                <p className="text-sm text-notix-textMuted">{node.hostname}</p>
                              </div>
                            </div>
                            {getNodeStatusBadge(node.status)}
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-notix-textMuted">CPU</p>
                              <p className="font-medium">{allocCpu} / {availCpu} cores</p>
                            </div>
                            <div>
                              <p className="text-notix-textMuted">RAM</p>
                              <p className="font-medium">{formatRam(allocRam)} / {formatRam(availRam)}</p>
                            </div>
                            <div>
                              <p className="text-notix-textMuted">Disk</p>
                              <p className="font-medium">{formatDisk(allocDisk)} / {formatDisk(availDisk)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Nodes Tab */}
        <TabsContent value="nodes">
          <div className="space-y-4">
            <Card className="card-base">
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Node</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>CPU</TableHead>
                        <TableHead>RAM</TableHead>
                        <TableHead>Disk</TableHead>
                        <TableHead>Servers</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {nodes.map(node => {
                        const allocCpu = servers.filter(s => s.nodeId === node.id).reduce((sum, s) => sum + s.allocatedCpu, 0);
                        const allocRam = servers.filter(s => s.nodeId === node.id).reduce((sum, s) => sum + s.allocatedRam, 0);
                        const allocDisk = servers.filter(s => s.nodeId === node.id).reduce((sum, s) => sum + s.allocatedDisk, 0);
                        const availCpu = (node.cpuCores || 0) - 1;
                        const availRam = (node.totalRam || 0) - 1024;
                        const availDisk = (node.totalDisk || 0) - 10240;
                        const cpuPct = availCpu > 0 ? ((allocCpu / availCpu) * 100).toFixed(1) : '0';
                        const ramPct = availRam > 0 ? ((allocRam / availRam) * 100).toFixed(1) : '0';
                        const diskPct = availDisk > 0 ? ((allocDisk / availDisk) * 100).toFixed(1) : '0';

                        return (
                          <TableRow key={node.id} className="hover:bg-white/5">
                            <TableCell className="font-medium text-notix-text">{node.name}</TableCell>
                            <TableCell>{getNodeStatusBadge(node.status)}</TableCell>
                            <TableCell className="text-notix-textMuted">{allocCpu} / {availCpu} cores ({cpuPct}%)</TableCell>
                            <TableCell className="text-notix-textMuted">{formatRam(allocRam)} / {formatRam(availRam)} ({ramPct}%)</TableCell>
                            <TableCell className="text-notix-textMuted">{formatDisk(allocDisk)} / {formatDisk(availDisk)} ({diskPct}%)</TableCell>
                            <TableCell className="text-notix-textMuted">{node._count.servers}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-notix-accent rounded-full" style={{ width: `${Math.min(100, parseFloat(cpuPct))}%` }} />
                                </div>
                                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(100, parseFloat(ramPct))}%` }} />
                                </div>
                                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.min(100, parseFloat(diskPct))}%` }} />
                                </div>
                              </div>
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
                                    <Link href={`/admin/infrastructure/deployments?tab=deploy&node=${node.id}`}>
                                      <Plus className="w-4 h-4" />
                                      Deploy Server
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {node.status === 'ONLINE' && (
                                    <DropdownMenuItem className="flex items-center gap-2 text-yellow-400">
                                      <Shield className="w-4 h-4" />
                                      Set Maintenance
                                    </DropdownMenuItem>
                                  )}
                                  {node.status === 'MAINTENANCE' && (
                                    <DropdownMenuItem className="flex items-center gap-2 text-green-400">
                                      <RotateCw className="w-4 h-4" />
                                      Mark Online
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="flex items-center gap-2 text-red-400">
                                    <Trash2 className="w-4 h-4" />
                                    Remove Node
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}