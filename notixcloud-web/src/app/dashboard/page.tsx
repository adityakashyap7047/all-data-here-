import { Metadata } from 'next';
import { Server, CreditCard, FileText, LifeBuoy, ArrowRight, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { formatPrice } from '@/lib/utils';
import { createVPSProvider, ServerInfo } from '@/lib/providers';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'NOTIXCLOUD Dashboard - Overview of your infrastructure',
};

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
};

const statusColors: Record<string, { bg: string; text: string; dot: string; icon: React.ReactNode }> = {
  running: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500', icon: <CheckCircle className="h-3 w-3" /> },
  stopped: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', dot: 'bg-slate-500', icon: <span className="w-3 h-3 rounded-full bg-slate-500" /> },
  starting: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500', icon: <AlertTriangle className="h-3 w-3" /> },
  stopping: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500', icon: <AlertTriangle className="h-3 w-3" /> },
  restarting: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500', icon: <AlertTriangle className="h-3 w-3" /> },
  reinstalling: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500', icon: <AlertTriangle className="h-3 w-3" /> },
  error: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500', icon: <XCircle className="h-3 w-3" /> },
  creating: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', dot: 'bg-indigo-500', icon: <AlertTriangle className="h-3 w-3" /> },
};

interface DashboardData {
  servers: ServerInfo[];
  stats: {
    totalServers: number;
    runningServers: number;
    monthlySpend: number;
    openTickets: number;
  };
}

async function getDashboardData(): Promise<DashboardData> {
  try {
    const provider = createVPSProvider();
    const servers = await provider.listServers();
    const serverList = servers || [];
    return {
      servers: serverList,
      stats: {
        totalServers: serverList.length,
        runningServers: serverList.filter((s: ServerInfo) => s.status === 'running').length,
        monthlySpend: 4500,
        openTickets: 1,
      },
    };
  } catch {
    return {
      servers: [],
      stats: {
        totalServers: 0,
        runningServers: 0,
        monthlySpend: 0,
        openTickets: 0,
      },
    };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <DashboardLayout user={mockUser}>
      <div className="space-y-8 animate-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Overview of your infrastructure and services</p>
          </div>
          <Link href="/dashboard/servers">
            <Button icon={<ArrowRight className="h-4 w-4" />} iconPosition="right">
              View All Servers
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Servers"
            value={data.stats.totalServers}
            icon={<Server className="h-6 w-6" />}
            color="indigo"
            href="/dashboard/servers"
          />
          <StatCard
            title="Running"
            value={data.stats.runningServers}
            icon={<CheckCircle className="h-6 w-6" />}
            color="green"
            href="/dashboard/servers"
          />
          <StatCard
            title="Monthly Spend"
            value={formatPrice(data.stats.monthlySpend)}
            icon={<CreditCard className="h-6 w-6" />}
            color="blue"
            href="/dashboard/billing"
          />
          <StatCard
            title="Open Tickets"
            value={data.stats.openTickets}
            icon={<LifeBuoy className="h-6 w-6" />}
            color="orange"
            href="/dashboard/support"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card variant="bordered">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Servers</CardTitle>
                  <Link href="/dashboard/servers">
                    <Button variant="ghost" size="sm" icon={<ArrowRight className="h-4 w-4" />}>
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {data.servers.length === 0 ? (
                  <EmptyState
                    icon={<Server className="h-12 w-12" />}
                    title="No servers yet"
                    description="Deploy your first VPS to get started."
                    action={<Link href="/vps"><Button>Deploy Server</Button></Link>}
                  />
                ) : (
                  <div className="space-y-4">
                    {data.servers.slice(0, 5).map((server: ServerInfo) => (
                      <ServerRow key={server.id} server={server} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <Link href="/vps">
                  <Button variant="outline" className="w-full justify-start gap-3" icon={<Server className="h-5 w-5" />}>
                    Deploy New Server
                  </Button>
                </Link>
                <Link href="/dashboard/orders">
                  <Button variant="outline" className="w-full justify-start gap-3" icon={<ShoppingCart className="h-5 w-5" />}>
                    View Orders
                  </Button>
                </Link>
                <Link href="/dashboard/billing">
                  <Button variant="outline" className="w-full justify-start gap-3" icon={<CreditCard className="h-5 w-5" />}>
                    Manage Billing
                  </Button>
                </Link>
                <Link href="/dashboard/support">
                  <Button variant="outline" className="w-full justify-start gap-3" icon={<LifeBuoy className="h-5 w-5" />}>
                    Open Support Ticket
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ActivityFeed />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon, color, href }: { title: string; value: string | number; icon: React.ReactNode; color: string; href: string }) {
  const colors = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  };

  return (
    <Link href={href} className="group">
      <Card variant="bordered" hover className="h-full">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
            </div>
            <div className={cn('p-3 rounded-xl', colors[color])}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ServerRow({ server }: { server: ServerInfo }) {
  const colors = statusColors[server.status] || statusColors.running;

  return (
    <Link href={`/dashboard/servers/${server.id}`} className="group">
      <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <div className={cn('w-2.5 h-2.5 rounded-full', colors.dot)} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 dark:text-white truncate">{server.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{server.hostname}</p>
        </div>
        <Badge variant="outline" className={cn(colors.bg, colors.text)}>
          {colors.icon}
          <span className="capitalize ml-1">{server.status}</span>
        </Badge>
        <ArrowRight className="h-5 w-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
}

function EmptyState({ icon, title, description, action }: { icon: React.ReactNode; title: string; description: string; action: React.ReactNode }) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 text-slate-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm mx-auto">{description}</p>
      {action}
    </div>
  );
}

function ActivityFeed() {
  const activities = [
    { action: 'Server started', target: 'web-prod-01', time: '2 minutes ago', type: 'success' },
    { action: 'Invoice paid', target: 'INV-2024-001', time: '1 hour ago', type: 'success' },
    { action: 'Support ticket opened', target: 'Network latency', time: '3 hours ago', type: 'info' },
    { action: 'Backup completed', target: 'db-primary', time: '5 hours ago', type: 'success' },
    { action: 'Server restart scheduled', target: 'staging-app', time: 'Yesterday', type: 'warning' },
  ];

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
          <div className={cn('w-2 h-2 rounded-full mt-2 flex-shrink-0', activity.type === 'success' && 'bg-green-500', activity.type === 'warning' && 'bg-yellow-500', activity.type === 'info' && 'bg-blue-500')} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-900 dark:text-white">
              <span className="font-medium">{activity.action}</span> <span className="text-slate-500 dark:text-slate-400">{activity.target}</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

import { ShoppingCart } from 'lucide-react';