'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  Server, Play, Square, RotateCw, Terminal, Database,
  RefreshCw, Trash2, Download, Copy, CheckCircle,
  AlertCircle, Loader2, Activity, HardDrive, Network,
  ChevronRight, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { formatRelativeTime, formatBytes } from '@/lib/utils';

const vpsData = {
  id: 'vps-1',
  name: 'web-prod-01',
  hostname: 'web-prod-01',
  status: 'running',
  plan: 'Professional',
  location: 'US East (NYC)',
  ipv4: '192.0.2.1',
  ipv6: '2001:db8::1',
  os: 'Ubuntu 22.04 LTS',
  createdAt: '2024-01-15T10:30:00Z',
  expiresAt: '2024-02-15T10:30:00Z',
  cpu: 45,
  memory: 62,
  disk: 38,
  networkIn: 1024 * 1024 * 500,
  networkOut: 1024 * 1024 * 200,
  backupEnabled: true,
  sshPort: 22,
  rootPassword: '••••••••',
  controlPanel: 'None',
};

const metricsHistory = [
  { time: '00:00', cpu: 12, ram: 34, disk: 38, netIn: 50, netOut: 20 },
  { time: '04:00', cpu: 8, ram: 32, disk: 38, netIn: 30, netOut: 15 },
  { time: '08:00', cpu: 25, ram: 45, disk: 38, netIn: 120, netOut: 45 },
  { time: '12:00', cpu: 65, ram: 72, disk: 38, netIn: 450, netOut: 180 },
  { time: '16:00', cpu: 48, ram: 68, disk: 38, netIn: 320, netOut: 150 },
  { time: '20:00', cpu: 35, ram: 55, disk: 38, netIn: 200, netOut: 80 },
];

const backups = [
  { id: 'bak-1', name: 'Auto backup', date: '2024-01-25T02:00:00Z', size: 1024 * 1024 * 1024 * 2.5, status: 'completed' },
  { id: 'bak-2', name: 'Pre-deploy snapshot', date: '2024-01-24T14:30:00Z', size: 1024 * 1024 * 1024 * 2.3, status: 'completed' },
  { id: 'bak-3', name: 'Auto backup', date: '2024-01-23T02:00:00Z', size: 1024 * 1024 * 1024 * 2.4, status: 'completed' },
  { id: 'bak-4', name: 'Auto backup', date: '2024-01-22T02:00:00Z', size: 1024 * 1024 * 1024 * 2.2, status: 'completed' },
];

const actions = [
  { id: 'act-1', type: 'REBOOT', status: 'COMPLETED', createdAt: '2024-01-24T10:15:00Z', completedAt: '2024-01-24T10:16:30Z' },
  { id: 'act-2', type: 'BACKUP', status: 'COMPLETED', createdAt: '2024-01-24T02:00:00Z', completedAt: '2024-01-24T02:15:00Z' },
  { id: 'act-3', type: 'START', status: 'COMPLETED', createdAt: '2024-01-15T10:30:00Z', completedAt: '2024-01-15T10:31:00Z' },
];

const statusConfig = {
  running: { label: 'Running', color: 'text-green-400', bg: 'bg-green-500/10', icon: Play },
  stopped: { label: 'Stopped', color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: Square },
  pending: { label: 'Pending', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Loader2 },
  provisioning: { label: 'Provisioning', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Loader2 },
  suspended: { label: 'Suspended', color: 'text-orange-400', bg: 'bg-orange-500/10', icon: AlertCircle },
  terminated: { label: 'Terminated', color: 'text-red-400', bg: 'bg-red-500/10', icon: Trash2 },
  error: { label: 'Error', color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertCircle },
};

export default function VPSDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const vps = vpsData;
  const config = statusConfig[vps.status as keyof typeof statusConfig];

  const handleAction = async (action: string) => {
    console.log('Action:', action, vps.id);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/vps" className="p-2 rounded-lg text-notix-textMuted hover:text-notix-text hover:bg-white/5">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-notix-text">{vps.name}</h1>
            <p className="text-notix-textMuted">{vps.hostname} • {vps.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={cn('gap-1', config.bg, config.color)}>
            <config.icon className="w-3 h-3" />
            {config.label}
          </Badge>
          <Button variant="outline" asChild>
            <Link href="/dashboard/vps">Back to List</Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Panel - Overview & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card className="card-base">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-notix-textMuted">CPU Usage</p>
                    <p className="text-2xl font-bold text-notix-text">{vps.cpu}%</p>
                  </div>
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', 'bg-blue-500/10')}>
                    <Activity className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <Progress value={vps.cpu} className="mt-3 h-1.5" />
              </CardContent>
            </Card>
            <Card className="card-base">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-notix-textMuted">Memory Usage</p>
                    <p className="text-2xl font-bold text-notix-text">{vps.memory}%</p>
                  </div>
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', 'bg-purple-500/10')}>
                    <Activity className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <Progress value={vps.memory} className="mt-3 h-1.5" />
              </CardContent>
            </Card>
            <Card className="card-base">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-notix-textMuted">Disk Usage</p>
                    <p className="text-2xl font-bold text-notix-text">{vps.disk}%</p>
                  </div>
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', 'bg-amber-500/10')}>
                    <HardDrive className="w-6 h-6 text-amber-400" />
                  </div>
                </div>
                <Progress value={vps.disk} className="mt-3 h-1.5" />
              </CardContent>
            </Card>
            <Card className="card-base">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-notix-textMuted">Network I/O</p>
                    <p className="text-2xl font-bold text-notix-text">
                      ↑ {formatBytes(vps.networkOut)}/s
                    </p>
                  </div>
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', 'bg-cyan-500/10')}>
                    <Network className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
                <p className="text-xs text-notix-textMuted mt-2">↓ {formatBytes(vps.networkIn)}/s</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="card-base">
            <TabsList className="bg-notix-bg border-b border-white/5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="backups">Backups</TabsTrigger>
              <TabsTrigger value="actions">Action History</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="p-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium text-notix-text">Network</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-notix-bg border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                          <Network className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-sm text-notix-textMuted">IPv4 Address</p>
                          <p className="font-mono text-notix-text">{vps.ipv4}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(vps.ipv4)}>
                        {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    {vps.ipv6 && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-notix-bg border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                            <Network className="w-4 h-4 text-cyan-400" />
                          </div>
                          <div>
                            <p className="text-sm text-notix-textMuted">IPv6 Address</p>
                            <p className="font-mono text-notix-text truncate max-w-[200px]">{vps.ipv6}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(vps.ipv6)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-notix-text">Access</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-notix-bg border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <Terminal className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-notix-textMuted">SSH Port</p>
                          <p className="font-mono text-notix-text">{vps.sshPort}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-notix-bg border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <Server className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm text-notix-textMuted">Root Password</p>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-notix-text">{showPassword ? 'your-root-password' : vps.rootPassword}</span>
                            <Button variant="ghost" size="icon" onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <Download className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-notix-text">Plan Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-notix-bg border border-white/5">
                      <p className="text-notix-textMuted">Plan</p>
                      <p className="font-medium text-notix-text">{vps.plan}</p>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-notix-bg border border-white/5">
                      <p className="text-notix-textMuted">Location</p>
                      <p className="font-medium text-notix-text">{vps.location}</p>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-notix-bg border border-white/5">
                      <p className="text-notix-textMuted">OS Template</p>
                      <p className="font-medium text-notix-text">{vps.os}</p>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-notix-bg border border-white/5">
                      <p className="text-notix-textMuted">Control Panel</p>
                      <p className="font-medium text-notix-text">{vps.controlPanel}</p>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-notix-bg border border-white/5">
                      <p className="text-notix-textMuted">Backups</p>
                      <Badge variant={vps.backupEnabled ? 'default' : 'outline'}>
                        {vps.backupEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-notix-text">Lifecycle</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-notix-bg border border-white/5">
                      <p className="text-notix-textMuted">Created</p>
                      <p className="font-medium text-notix-text">{formatRelativeTime(vps.createdAt)}</p>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-notix-bg border border-white/5">
                      <p className="text-notix-textMuted">Expires</p>
                      <p className="font-medium text-notix-text">{formatRelativeTime(vps.expiresAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Power Actions */}
              <div className="border-t border-white/5 pt-6">
                <h4 className="font-medium text-notix-text mb-4">Power Actions</h4>
                <div className="flex flex-wrap gap-3">
                  {vps.status === 'running' ? (
                    <>
                      <Button onClick={() => handleAction('stop')} variant="secondary">
                        <Square className="w-4 h-4 mr-2" />
                        Stop
                      </Button>
                      <Button onClick={() => handleAction('reboot')} variant="secondary">
                        <RotateCw className="w-4 h-4 mr-2" />
                        Reboot
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => handleAction('start')} variant="default">
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </Button>
                  )}
                  <Button onClick={() => handleAction('console')} variant="outline" asChild>
                    <Link href={`/dashboard/vps/${vps.id}/console`} target="_blank">
                      <Terminal className="w-4 h-4 mr-2" />
                      Console
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                  <Button onClick={() => handleAction('reinstall')} variant="destructive">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reinstall OS
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="p-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="card-base">
                  <CardHeader>
                    <CardTitle className="text-lg">CPU Usage (24h)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 space-y-4">
                      {metricsHistory.map((m, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-16 text-xs text-notix-textMuted">{m.time}</span>
                          <div className="flex-1 h-4 bg-notix-bg rounded overflow-hidden">
                            <div className="h-full bg-blue-500 rounded" style={{ width: `${m.cpu}%` }} />
                          </div>
                          <span className="w-12 text-right text-sm font-mono text-notix-text">{m.cpu}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="card-base">
                  <CardHeader>
                    <CardTitle className="text-lg">Memory Usage (24h)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 space-y-4">
                      {metricsHistory.map((m, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-16 text-xs text-notix-textMuted">{m.time}</span>
                          <div className="flex-1 h-4 bg-notix-bg rounded overflow-hidden">
                            <div className="h-full bg-purple-500 rounded" style={{ width: `${m.ram}%` }} />
                          </div>
                          <span className="w-12 text-right text-sm font-mono text-notix-text">{m.ram}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="card-base">
                  <CardHeader>
                    <CardTitle className="text-lg">Network In (24h)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 space-y-4">
                      {metricsHistory.map((m, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-16 text-xs text-notix-textMuted">{m.time}</span>
                          <div className="flex-1 h-4 bg-notix-bg rounded overflow-hidden">
                            <div className="h-full bg-cyan-500 rounded" style={{ width: `${Math.min(m.netIn / 10, 100)}%` }} />
                          </div>
                          <span className="w-24 text-right text-sm font-mono text-notix-text">{formatBytes(m.netIn * 1024 * 1024)}/s</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="card-base">
                  <CardHeader>
                    <CardTitle className="text-lg">Network Out (24h)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 space-y-4">
                      {metricsHistory.map((m, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-16 text-xs text-notix-textMuted">{m.time}</span>
                          <div className="flex-1 h-4 bg-notix-bg rounded overflow-hidden">
                            <div className="h-full bg-orange-500 rounded" style={{ width: `${Math.min(m.netOut / 10, 100)}%` }} />
                          </div>
                          <span className="w-24 text-right text-sm font-mono text-notix-text">{formatBytes(m.netOut * 1024 * 1024)}/s</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="backups" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-medium text-notix-text">Backups</h4>
                <Button variant="outline" size="sm">
                  <Database className="w-4 h-4 mr-2" />
                  Create Backup
                </Button>
              </div>
              <div className="space-y-3">
                {backups.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-4 rounded-lg bg-notix-bg border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', backup.status === 'completed' ? 'bg-green-500/10' : 'bg-yellow-500/10')}>
                        <Database className={cn('w-5 h-5', backup.status === 'completed' ? 'text-green-400' : 'text-yellow-400')} />
                      </div>
                      <div>
                        <p className="font-medium text-notix-text">{backup.name}</p>
                        <p className="text-sm text-notix-textMuted">{formatRelativeTime(backup.date)} • {formatBytes(backup.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={backup.status === 'completed' ? 'default' : 'secondary'}>
                        {backup.status}
                      </Badge>
                      <Button variant="ghost" size="icon" className="text-green-400 hover:text-green-300">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="actions" className="p-6">
              <div className="space-y-3">
                {actions.map((action) => (
                  <div key={action.id} className="flex items-center justify-between p-4 rounded-lg bg-notix-bg border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-notix-accent/10 flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 text-notix-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-notix-text">{action.type}</p>
                        <p className="text-sm text-notix-textMuted">Started {formatRelativeTime(action.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={action.status === 'COMPLETED' ? 'default' : 'secondary'}>
                        {action.status}
                      </Badge>
                      <p className="text-xs text-notix-textMuted mt-1">
                        Completed {formatRelativeTime(action.completedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="p-6 space-y-6">
              <div>
                <h4 className="font-medium text-notix-text mb-4">Hostname</h4>
                <div className="flex gap-3">
                  <input
                    type="text"
                    defaultValue={vps.hostname}
                    className="flex-1 input-field"
                    pattern="^[a-zA-Z0-9-]+$"
                    title="Only alphanumeric characters and hyphens allowed"
                  />
                  <Button variant="outline">Save</Button>
                </div>
              </div>
              <div className="border-t border-white/5 pt-6">
                <h4 className="font-medium text-notix-text mb-4">Backup Settings</h4>
                <div className="flex items-center justify-between p-4 rounded-lg bg-notix-bg border border-white/5">
                  <div>
                    <p className="font-medium text-notix-text">Automated Daily Backups</p>
                    <p className="text-sm text-notix-textMuted">Create daily backups with 7-day retention</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </div>
              <div className="border-t border-white/5 pt-6">
                <h4 className="font-medium text-notix-text mb-4">Danger Zone</h4>
                <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/5 border border-red-500/10">
                  <div>
                    <p className="font-medium text-red-400">Delete VPS</p>
                    <p className="text-sm text-notix-textMuted">This action is irreversible. All data will be lost.</p>
                  </div>
                  <Button variant="destructive">Delete VPS</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Info Card */}
        <div className="space-y-6">
          <Card className="card-base sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-notix-textMuted">Status</span>
                  <Badge className={cn('gap-1', config.bg, config.color)}>
                    <config.icon className="w-3 h-3" />
                    {config.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-notix-textMuted">Plan</span>
                  <span className="font-medium text-notix-text">{vps.plan}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-notix-textMuted">Location</span>
                  <span className="font-medium text-notix-text">{vps.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-notix-textMuted">IPv4</span>
                  <span className="font-mono text-notix-text">{vps.ipv4}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-notix-textMuted">OS</span>
                  <span className="font-medium text-notix-text">{vps.os}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-notix-textMuted">Backups</span>
                  <Badge variant={vps.backupEnabled ? 'default' : 'outline'}>
                    {vps.backupEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}