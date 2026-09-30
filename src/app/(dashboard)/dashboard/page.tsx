'use client';

import { 
  Server, CreditCard, ShoppingBag, MessageSquare, 
  TrendingUp, ArrowUpRight, Clock, CheckCircle,
  AlertTriangle, Activity, ExternalLink, Key
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const stats = [
  { name: 'Active VPS', value: '3', change: '+1 this month', icon: Server, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { name: 'Monthly Spend', value: '$47.97', change: '-$12.00 vs last month', icon: CreditCard, color: 'text-green-400', bg: 'bg-green-500/10' },
  { name: 'Open Tickets', value: '1', change: '2 resolved this week', icon: MessageSquare, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { name: 'Pending Orders', value: '0', change: 'All caught up', icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-500/10' },
];

const vpsInstances = [
  { id: 'vps-1', name: 'web-prod-01', status: 'running', plan: 'Professional', location: 'US East', ip: '192.0.2.1', cpu: 45, memory: 62, disk: 38 },
  { id: 'vps-2', name: 'db-primary', status: 'running', plan: 'Enterprise', location: 'EU Central', ip: '192.0.2.2', cpu: 23, memory: 78, disk: 55 },
  { id: 'vps-3', name: 'staging-app', status: 'stopped', plan: 'Standard', location: 'US West', ip: '192.0.2.3', cpu: 0, memory: 12, disk: 22 },
];

const recentActivity = [
  { id: '1', type: 'vps_created', description: 'VPS "web-prod-01" created', time: '2 hours ago', icon: Server, color: 'text-green-400' },
  { id: '2', type: 'payment', description: 'Invoice INV-ABC123 paid ($47.97)', time: '5 hours ago', icon: CreditCard, color: 'text-blue-400' },
  { id: '3', type: 'ticket', description: 'Ticket #TK-4567 created: "DNS question"', time: '1 day ago', icon: MessageSquare, color: 'text-purple-400' },
  { id: '4', type: 'backup', description: 'Backup completed for "db-primary"', time: '2 days ago', icon: Activity, color: 'text-cyan-400' },
  { id: '5', type: 'vps_action', description: 'VPS "staging-app" stopped', time: '3 days ago', icon: Server, color: 'text-yellow-400' },
];

const invoices = [
  { id: 'INV-001', date: '2024-01-15', amount: '$47.97', status: 'paid' },
  { id: 'INV-002', date: '2024-01-01', amount: '$47.97', status: 'paid' },
  { id: 'INV-003', date: '2024-02-01', amount: '$47.97', status: 'pending', dueDate: '2024-02-15' },
];

export default function DashboardPage() {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'running': return { label: 'Running', color: 'text-green-400', bg: 'bg-green-500/10', icon: CheckCircle };
      case 'stopped': return { label: 'Stopped', color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: Clock };
      case 'pending': return { label: 'Pending', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Clock };
      default: return { label: status, color: 'text-gray-400', bg: 'bg-gray-500/10', icon: AlertTriangle };
    }
  };

  const getInvoiceStatusConfig = (status: string) => {
    switch (status) {
      case 'paid': return { label: 'Paid', color: 'text-green-400', bg: 'bg-green-500/10' };
      case 'pending': return { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
      case 'overdue': return { label: 'Overdue', color: 'text-red-400', bg: 'bg-red-500/10' };
      default: return { label: status, color: 'text-gray-400', bg: 'bg-gray-500/10' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-notix-text">Dashboard</h1>
          <p className="text-notix-textMuted mt-1">Overview of your infrastructure and account</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard/vps">
              <Server className="w-4 h-4 mr-2" />
              Manage VPS
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/vps/new">
              <Server className="w-4 h-4 mr-2" />
              Deploy New VPS
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="card-base">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-notix-textMuted">{stat.name}</p>
                  <p className="text-2xl font-bold text-notix-text mt-1">{stat.value}</p>
                  <p className="text-xs text-notix-textMuted mt-2">{stat.change}</p>
                </div>
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', stat.bg)}>
                  <stat.icon className={cn('w-6 h-6', stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* VPS Instances */}
        <Card className="lg:col-span-2 card-base">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">VPS Instances</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/vps">View All <ExternalLink className="w-3 h-3 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-xs font-medium text-notix-textMuted uppercase tracking-wider">Instance</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-notix-textMuted uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-notix-textMuted uppercase tracking-wider">Plan</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-notix-textMuted uppercase tracking-wider">Location</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-notix-textMuted uppercase tracking-wider">IP Address</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-notix-textMuted uppercase tracking-wider">Resources</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-notix-textMuted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {vpsInstances.map((vps) => {
                    const statusConfig = getStatusConfig(vps.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <tr key={vps.id} className="hover:bg-white/2.5 transition-colors">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-notix-text">{vps.name}</p>
                            <p className="text-xs text-notix-textMuted">{vps.id}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', statusConfig.bg, statusConfig.color)}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-notix-textMuted">{vps.plan}</td>
                        <td className="px-4 py-4 text-sm text-notix-textMuted">{vps.location}</td>
                        <td className="px-4 py-4 font-mono text-sm text-notix-text">{vps.ip}</td>
                        <td className="px-4 py-4">
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2 text-notix-textMuted">
                              <Activity className="w-3 h-3" />
                              <span>CPU: {vps.cpu}%</span>
                              <div className="flex-1 h-1.5 bg-notix-bg rounded overflow-hidden">
                                <div className="h-full bg-notix-accent" style={{ width: `${vps.cpu}%` }} />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-notix-textMuted">
                              <Activity className="w-3 h-3" />
                              <span>RAM: {vps.memory}%</span>
                              <div className="flex-1 h-1.5 bg-notix-bg rounded overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: `${vps.memory}%` }} />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-notix-textMuted">
                              <Activity className="w-3 h-3" />
                              <span>Disk: {vps.disk}%</span>
                              <div className="flex-1 h-1.5 bg-notix-bg rounded overflow-hidden">
                                <div className="h-full bg-purple-500" style={{ width: `${vps.disk}%` }} />
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/vps/${vps.id}`}>Manage</Link>
                            </Button>
                            {vps.status === 'running' && (
                              <Button variant="ghost" size="sm">Stop</Button>
                            )}
                            {vps.status === 'stopped' && (
                              <Button variant="ghost" size="sm">Start</Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {vpsInstances.length === 0 && (
              <div className="text-center py-12">
                <Server className="w-12 h-12 text-notix-textMuted/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-notix-text mb-2">No VPS instances yet</h3>
                <p className="text-notix-textMuted mb-4">Deploy your first server to get started</p>
                <Button asChild>
                  <Link href="/dashboard/vps/new">Deploy First VPS</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Recent Invoices */}
          <Card className="card-base">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Invoices</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/billing">View All <ExternalLink className="w-3 h-3 ml-1" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoices.map((invoice) => {
                  const statusConfig = getInvoiceStatusConfig(invoice.status);
                  return (
                    <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg bg-notix-surface/50 border border-white/5">
                      <div>
                        <p className="font-medium text-notix-text">{invoice.id}</p>
                        <p className="text-xs text-notix-textMuted">{invoice.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-notix-text">{invoice.amount}</p>
                        <span className={cn('px-2 py-0.5 rounded text-xs font-medium', statusConfig.bg, statusConfig.color)}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="card-base">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', activity.color + '/10')}>
                      <activity.icon className={cn('w-4 h-4', activity.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-notix-text">{activity.description}</p>
                      <p className="text-xs text-notix-textMuted">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="card-base">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button asChild variant="outline" className="h-auto py-3">
                  <Link href="/dashboard/vps/new">
                    <Server className="w-5 h-5 mr-2" />
                    <span>Deploy VPS</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-3">
                  <Link href="/dashboard/tickets/new">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    <span>Create Ticket</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-3">
                  <Link href="/dashboard/billing">
                    <CreditCard className="w-5 h-5 mr-2" />
                    <span>View Billing</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-3">
                  <Link href="/dashboard/settings#api">
                    <Key className="w-5 h-5 mr-2" />
                    <span>API Keys</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}