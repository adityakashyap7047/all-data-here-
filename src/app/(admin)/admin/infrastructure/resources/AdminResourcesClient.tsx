'use client';

import { useState, useMemo } from 'react';
import {
  Server, Database, Cpu, HardDrive, Network, Wifi, WifiOff,
  AlertTriangle, TrendingUp, TrendingDown, Activity,
  BarChart, PieChart, Zap, Database as DatabaseIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Server {
  id: string;
  name: string;
  allocatedCpu: number;
  allocatedRam: number;
  allocatedDisk: number;
  status: string;
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
  javaVersion: string | null;
  dockerVersion: string | null;
  maxServers: number;
  reservedCpu: number;
  reservedRam: number;
  reservedDisk: number;
  metrics: Array<{
    id: string;
    cpuUsage: number;
    ramUsage: number;
    diskUsage: number;
    networkIn: number;
    networkOut: number;
    loadAverage: number | null;
    timestamp: Date;
  }>;
  servers: Server[];
}

interface AdminResourcesClientProps {
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

function formatRam(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb} MB`;
}

function formatDisk(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} TB`;
  return `${mb} GB`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B/s';
  const k = 1024;
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

function ProgressBar({ value, max, label, color = 'notix-accent' }: { value: number; max: number; label: string; color?: string }) {
  const percentage = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const colorClasses = {
    'notix-accent': 'bg-notix-accent',
    'green': 'bg-green-500',
    'yellow': 'bg-yellow-500',
    'red': 'bg-red-500',
    'blue': 'bg-blue-500',
  };
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-notix-textMuted">{label}</span>
        <span className="text-notix-text font-medium">{value.toLocaleString()} / {max.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorClasses[color as keyof typeof colorClasses] || colorClasses['notix-accent'])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-notix-textMuted text-right">{percentage.toFixed(1)}% used</p>
    </div>
  );
}

export default function AdminResourcesClient({ nodes }: AdminResourcesClientProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(nodes[0]?.id || null);
  const [timeRange, setTimeRange] = useState('1h');

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId) || nodes[0], [nodes, selectedNodeId]);

  const allocatedCpu = selectedNode.servers.reduce((sum, s) => sum + s.allocatedCpu, 0);
  const allocatedRam = selectedNode.servers.reduce((sum, s) => sum + s.allocatedRam, 0);
  const allocatedDisk = selectedNode.servers.reduce((sum, s) => sum + s.allocatedDisk, 0);
  const availableCpu = (selectedNode.cpuCores || 0) - selectedNode.reservedCpu;
  const availableRam = (selectedNode.totalRam || 0) - selectedNode.reservedRam;
  const availableDisk = (selectedNode.totalDisk || 0) - selectedNode.reservedDisk;

  const latestMetric = selectedNode.metrics[0];

  if (!selectedNode) {
    return (
      <div className="card-base text-center py-16">
        <Server className="w-16 h-16 text-notix-textMuted/30 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-notix-text mb-2">No nodes available</h3>
        <p className="text-notix-textMuted mb-6">Add a VPS node to view resource metrics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-notix-text">Node Resources</h1>
          <p className="text-notix-textMuted mt-1">Monitor CPU, RAM, disk, and network usage across all nodes</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedNodeId} onValueChange={setSelectedNodeId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a node" />
            </SelectTrigger>
            <SelectContent>
              {nodes.map(node => (
                <SelectItem key={node.id} value={node.id}>
                  {node.name} ({node.hostname}) - {node.status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Node Status Card */}
      <Card className="card-base">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-notix-accent/10 flex items-center justify-center">
              <Server className="w-6 h-6 text-notix-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-notix-text">{selectedNode.name}</h3>
              <p className="text-sm text-notix-textMuted">{selectedNode.hostname} • {selectedNode.nodeType}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(selectedNode.status)}
            {getNodeTypeBadge(selectedNode.nodeType)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div>
              <p className="text-sm text-notix-textMuted">OS / Arch</p>
              <p className="font-mono text-notix-text">{selectedNode.os || 'Unknown'} / {selectedNode.javaVersion ? `Java ${selectedNode.javaVersion}` : 'No Java'}</p>
            </div>
            <div>
              <p className="text-sm text-notix-textMuted">Docker</p>
              <p className="font-mono text-notix-text">{selectedNode.dockerVersion || 'Not installed'}</p>
            </div>
            <div>
              <p className="text-sm text-notix-textMuted">Last Health Check</p>
              <p className="font-mono text-notix-text">
                {selectedNode.lastHealthCheck ? new Date(selectedNode.lastHealthCheck).toLocaleString() : 'Never'}
              </p>
            </div>
            <div>
              <p className="text-sm text-notix-textMuted">Active Servers</p>
              <p className="font-mono text-notix-text">{selectedNode.servers.filter(s => s.status === 'RUNNING').length} / {selectedNode.servers.length}</p>
            </div>
          </div>

          {/* Resource Allocation */}
          <div className="space-y-4">
            <h4 className="font-medium text-notix-text flex items-center gap-2">
              <Zap className="w-5 h-5" />
              CPU Allocation
            </h4>
            <ProgressBar
              value={allocatedCpu + selectedNode.reservedCpu}
              max={selectedNode.cpuCores || 0}
              label={`Allocated: ${allocatedCpu} cores (Reserved: ${selectedNode.reservedCpu})`}
              color={allocatedCpu > availableCpu ? 'red' : allocatedCpu > availableCpu * 0.8 ? 'yellow' : 'green'}
            />

            <h4 className="font-medium text-notix-text flex items-center gap-2 mt-6">
              <DatabaseIcon className="w-5 h-5" />
              RAM Allocation
            </h4>
            <ProgressBar
              value={allocatedRam + selectedNode.reservedRam}
              max={selectedNode.totalRam || 0}
              label={`Allocated: ${formatRam(allocatedRam)} (Reserved: ${formatRam(selectedNode.reservedRam)})`}
              color={allocatedRam > availableRam ? 'red' : allocatedRam > availableRam * 0.8 ? 'yellow' : 'green'}
            />

            <h4 className="font-medium text-notix-text flex items-center gap-2 mt-6">
              <HardDrive className="w-5 h-5" />
              Disk Allocation
            </h4>
            <ProgressBar
              value={allocatedDisk + selectedNode.reservedDisk}
              max={selectedNode.totalDisk || 0}
              label={`Allocated: ${formatDisk(allocatedDisk)} (Reserved: ${formatDisk(selectedNode.reservedDisk)})`}
              color={allocatedDisk > availableDisk ? 'red' : allocatedDisk > availableDisk * 0.8 ? 'yellow' : 'green'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="card-base">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-notix-textMuted">Current CPU</p>
                <p className="text-3xl font-bold text-notix-text">{latestMetric?.cpuUsage.toFixed(1) || '0'}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Cpu className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <p className="text-xs text-notix-textMuted mt-2">Load: {latestMetric?.loadAverage?.toFixed(2) || 'N/A'}</p>
          </CardContent>
        </Card>

        <Card className="card-base">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-notix-textMuted">Current RAM</p>
                <p className="text-3xl font-bold text-notix-text">{formatRam(latestMetric?.ramUsage || 0)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Database className="w-6 h-6 text-orange-400" />
              </div>
            </div>
            <p className="text-xs text-notix-textMuted mt-2">Usage: {latestMetric?.ramUsage && selectedNode.totalRam ? ((latestMetric.ramUsage / selectedNode.totalRam) * 100).toFixed(1) : '0'}%</p>
          </CardContent>
        </Card>

        <Card className="card-base">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-notix-textMuted">Network In</p>
                <p className="text-3xl font-bold text-notix-text">{formatBytes(latestMetric?.networkIn || 0)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-base">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-notix-textMuted">Network Out</p>
                <p className="text-3xl font-bold text-notix-text">{formatBytes(latestMetric?.networkOut || 0)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics History */}
      <Tabs defaultValue="cpu" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cpu"><Cpu className="w-4 h-4 mr-2" /> CPU Usage</TabsTrigger>
          <TabsTrigger value="ram"><Database className="w-4 h-4 mr-2" /> RAM Usage</TabsTrigger>
          <TabsTrigger value="disk"><HardDrive className="w-4 h-4 mr-2" /> Disk Usage</TabsTrigger>
          <TabsTrigger value="network"><Network className="w-4 h-4 mr-2" /> Network</TabsTrigger>
        </TabsList>

        <TabsContent value="cpu">
          <Card className="card-base">
            <CardHeader>
              <CardTitle>CPU Usage History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-1 p-2">
                {selectedNode.metrics.slice(-30).reverse().map((metric, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-notix-accent/20 rounded-t transition-all hover:bg-notix-accent"
                    style={{ height: `${Math.max(4, (metric.cpuUsage / 100) * 200)}px` }}
                    title={`${metric.cpuUsage.toFixed(1)}% at ${new Date(metric.timestamp).toLocaleTimeString()}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ram">
          <Card className="card-base">
            <CardHeader>
              <CardTitle>RAM Usage History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-1 p-2">
                {selectedNode.metrics.slice(-30).reverse().map((metric, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-orange-500/20 rounded-t transition-all hover:bg-orange-500"
                    style={{ height: `${Math.max(4, selectedNode.totalRam ? (metric.ramUsage / selectedNode.totalRam) * 200 : 4)}px` }}
                    title={`${formatRam(metric.ramUsage)} at ${new Date(metric.timestamp).toLocaleTimeString()}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disk">
          <Card className="card-base">
            <CardHeader>
              <CardTitle>Disk Usage History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-1 p-2">
                {selectedNode.metrics.slice(-30).reverse().map((metric, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-cyan-500/20 rounded-t transition-all hover:bg-cyan-500"
                    style={{ height: `${Math.max(4, selectedNode.totalDisk ? (metric.diskUsage / selectedNode.totalDisk) * 200 : 4)}px` }}
                    title={`${formatDisk(metric.diskUsage)} at ${new Date(metric.timestamp).toLocaleTimeString()}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network">
          <Card className="card-base">
            <CardHeader>
              <CardTitle>Network I/O History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-1 p-2">
                {selectedNode.metrics.slice(-30).reverse().map((metric, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-blue-500/20 rounded-t transition-all hover:bg-blue-500"
                    style={{ height: `${Math.max(4, Math.log10(Math.max(1, metric.networkIn + metric.networkOut)) * 20)}px` }}
                    title={`In: ${formatBytes(metric.networkIn)} / Out: ${formatBytes(metric.networkOut)} at ${new Date(metric.timestamp).toLocaleTimeString()}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Server Allocations Table */}
      <Card className="card-base">
        <CardHeader>
          <CardTitle>Server Allocations on {selectedNode.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedNode.servers.length === 0 ? (
            <div className="text-center py-8 text-notix-textMuted">
              <Server className="w-12 h-12 text-notix-textMuted/30 mx-auto mb-2" />
              <p>No servers deployed on this node</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Server Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>CPU (cores)</TableHead>
                    <TableHead>RAM</TableHead>
                    <TableHead>Disk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedNode.servers.map(server => (
                    <TableRow key={server.id}>
                      <TableCell className="font-medium text-notix-text">{server.name}</TableCell>
                      <TableCell>
                        <Badge variant={server.status === 'RUNNING' ? 'default' : 'outline'}>
                          {server.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-notix-textMuted">{server.allocatedCpu} cores</TableCell>
                      <TableCell className="text-notix-textMuted">{formatRam(server.allocatedRam)}</TableCell>
                      <TableCell className="text-notix-textMuted">{formatDisk(server.allocatedDisk)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Nodes Summary */}
      <Card className="card-base">
        <CardHeader>
          <CardTitle>All Nodes Resource Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Node</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>CPU</TableHead>
                  <TableHead>RAM</TableHead>
                  <TableHead>Disk</TableHead>
                  <TableHead>Servers</TableHead>
                  <TableHead>Capacity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nodes.map(node => {
                  const allocCpu = node.servers.reduce((sum, s) => sum + s.allocatedCpu, 0);
                  const allocRam = node.servers.reduce((sum, s) => sum + s.allocatedRam, 0);
                  const allocDisk = node.servers.reduce((sum, s) => sum + s.allocatedDisk, 0);
                  const availCpu = (node.cpuCores || 0) - node.reservedCpu;
                  const availRam = (node.totalRam || 0) - node.reservedRam;
                  const availDisk = (node.totalDisk || 0) - node.reservedDisk;
                  const cpuPct = availCpu > 0 ? ((allocCpu / availCpu) * 100).toFixed(1) : '0';
                  const ramPct = availRam > 0 ? ((allocRam / availRam) * 100).toFixed(1) : '0';
                  const diskPct = availDisk > 0 ? ((allocDisk / availDisk) * 100).toFixed(1) : '0';

                  return (
                    <TableRow key={node.id} className="hover:bg-white/5">
                      <TableCell className="font-medium text-notix-text">{node.name}</TableCell>
                      <TableCell>{getNodeTypeBadge(node.nodeType)}</TableCell>
                      <TableCell>{getStatusBadge(node.status)}</TableCell>
                      <TableCell className="text-notix-textMuted">
                        {allocCpu} / {availCpu} cores ({cpuPct}%)
                      </TableCell>
                      <TableCell className="text-notix-textMuted">
                        {formatRam(allocRam)} / {formatRam(availRam)} ({ramPct}%)
                      </TableCell>
                      <TableCell className="text-notix-textMuted">
                        {formatDisk(allocDisk)} / {formatDisk(availDisk)} ({diskPct}%)
                      </TableCell>
                      <TableCell className="text-notix-textMuted">{node.servers.length} / {node.maxServers}</TableCell>
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
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}