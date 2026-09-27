'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatCurrency, formatRelativeTime, getInitials } from '@/lib/utils';
import {
  Users,
  Server,
  ShoppingCart,
  DollarSign,
  Ticket,
  TrendingUp,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  href?: string;
  color?: string;
  bgColor?: string;
}

function StatsCard({ title, value, icon, trend, href, color = 'text-notix-accent', bgColor = 'bg-notix-accent/10' }: StatsCardProps) {
  return (
    <Card className="hover:border-white/10 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-notix-textMuted">{title}</CardTitle>
        <div className={cn('h-12 w-12 rounded-lg flex items-center justify-center', bgColor)}>
          {React.cloneElement(icon as React.ReactElement, { className: 'h-6 w-6 ' + color })}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-notix-text">{value}</div>
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-sm">
            <span className={cn(
              trend.value >= 0 ? 'text-green-400' : 'text-red-400',
              'font-medium'
            )}>
              {trend.value >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {Math.abs(trend.value)}%
            </span>
            <span className="text-notix-textMuted">{trend.label}</span>
            {href && (
              <Link href={href} className="text-notix-accent hover:underline ml-2 text-xs">
                View all
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface RecentActivityProps {
  users: Array<{ id: string; email: string; name: string | null; role: string; createdAt: Date }>;
  orders: Array<{ id: string; orderNumber: string; total: number; status: string; createdAt: Date; user: { email: string; name: string | null } }>;
  tickets: Array<{ id: string; subject: string; status: string; priority: string; createdAt: Date; user: { email: string; name: string | null } }>;
}

function RecentActivity({ users, orders, tickets }: RecentActivityProps) {
  const [activeTab, setActiveTab] = React.useState<'users' | 'orders' | 'tickets'>('users');

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      PENDING: 'bg-yellow-500/10 text-yellow-400',
      PROCESSING: 'bg-blue-500/10 text-blue-400',
      COMPLETED: 'bg-green-500/10 text-green-400',
      CANCELLED: 'bg-gray-500/10 text-gray-400',
      REFUNDED: 'bg-purple-500/10 text-purple-400',
      FAILED: 'bg-red-500/10 text-red-400',
      OPEN: 'bg-blue-500/10 text-blue-400',
      IN_PROGRESS: 'bg-yellow-500/10 text-yellow-400',
      WAITING_CUSTOMER: 'bg-purple-500/10 text-purple-400',
      WAITING_STAFF: 'bg-orange-500/10 text-orange-400',
      RESOLVED: 'bg-green-500/10 text-green-400',
      CLOSED: 'bg-gray-500/10 text-gray-400',
    };
    return statusStyles[status] || 'bg-white/10 text-notix-textMuted';
  };

  const getPriorityBadge = (priority: string) => {
    const priorityStyles: Record<string, string> = {
      LOW: 'bg-blue-500/10 text-blue-400',
      NORMAL: 'bg-green-500/10 text-green-400',
      HIGH: 'bg-yellow-500/10 text-yellow-400',
      URGENT: 'bg-orange-500/10 text-orange-400',
      CRITICAL: 'bg-red-500/10 text-red-400',
    };
    return priorityStyles[priority] || 'bg-white/10 text-notix-textMuted';
  };

  const getRoleBadge = (role: string) => {
    const roleStyles: Record<string, string> = {
      SUPER_ADMIN: 'bg-red-500/10 text-red-400',
      ADMIN: 'bg-purple-500/10 text-purple-400',
      SUPPORT: 'bg-blue-500/10 text-blue-400',
      BILLING: 'bg-yellow-500/10 text-yellow-400',
      CUSTOMER: 'bg-green-500/10 text-green-400',
      API: 'bg-gray-500/10 text-gray-400',
    };
    return roleStyles[role] || 'bg-white/10 text-notix-textMuted';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <div className="flex gap-1" role="tablist">
            {[
              { id: 'users', label: 'Users', count: users.length },
              { id: 'orders', label: 'Orders', count: orders.length },
              { id: 'tickets', label: 'Tickets', count: tickets.length },
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id as 'users' | 'orders' | 'tickets')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-notix-accent/10 text-notix-accent'
                    : 'text-notix-textMuted hover:text-notix-text hover:bg-white/5'
                )}
              >
                {tab.label} <span className="ml-1 text-xs opacity-70">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {activeTab === 'users' && (
                  <>
                    <th className="text-left p-4 font-medium text-notix-textMuted">User</th>
                    <th className="text-left p-4 font-medium text-notix-textMuted">Role</th>
                    <th className="text-left p-4 font-medium text-notix-textMuted">Joined</th>
                  </>
                )}
                {activeTab === 'orders' && (
                  <>
                    <th className="text-left p-4 font-medium text-notix-textMuted">Order</th>
                    <th className="text-left p-4 font-medium text-notix-textMuted">Customer</th>
                    <th className="text-left p-4 font-medium text-notix-textMuted">Amount</th>
                    <th className="text-left p-4 font-medium text-notix-textMuted">Status</th>
                    <th className="text-left p-4 font-medium text-notix-textMuted">Date</th>
                  </>
                )}
                {activeTab === 'tickets' && (
                  <>
                    <th className="text-left p-4 font-medium text-notix-textMuted">Subject</th>
                    <th className="text-left p-4 font-medium text-notix-textMuted">Customer</th>
                    <th className="text-left p-4 font-medium text-notix-textMuted">Status</th>
                    <th className="text-left p-4 font-medium text-notix-textMuted">Priority</th>
                    <th className="text-left p-4 font-medium text-notix-textMuted">Created</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {activeTab === 'users' && users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-notix-accent/10 flex items-center justify-center text-notix-accent font-medium text-sm">
                        {getInitials(user.name || user.email)}
                      </div>
                      <div>
                        <p className="font-medium text-notix-text">{user.name || 'Unnamed'}</p>
                        <p className="text-sm text-notix-textMuted">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getRoleBadge(user.role))}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-notix-textMuted text-sm">{formatRelativeTime(user.createdAt)}</td>
                </tr>
              ))}
              {activeTab === 'orders' && orders.map((order) => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono text-sm text-notix-text">{order.orderNumber}</td>
                  <td className="p-4">
                    <p className="font-medium text-notix-text">{order.user.name || 'Unnamed'}</p>
                    <p className="text-sm text-notix-textMuted">{order.user.email}</p>
                  </td>
                  <td className="p-4 text-notix-text">{formatCurrency(order.total)}</td>
                  <td className="p-4">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getStatusBadge(order.status))}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-notix-textMuted text-sm">{formatRelativeTime(order.createdAt)}</td>
                </tr>
              ))}
              {activeTab === 'tickets' && tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <p className="font-medium text-notix-text truncate max-w-xs">{ticket.subject}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-notix-text">{ticket.user.name || 'Unnamed'}</p>
                    <p className="text-sm text-notix-textMuted">{ticket.user.email}</p>
                  </td>
                  <td className="p-4">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getStatusBadge(ticket.status))}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getPriorityBadge(ticket.priority))}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="p-4 text-notix-textMuted text-sm">{formatRelativeTime(ticket.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

import { cn } from '@/lib/utils';

interface AdminDashboardClientProps {
  initialStats: {
    totalUsers: number;
    activeCustomers: number;
    activeServers: number;
    pendingOrders: number;
    totalRevenue: number;
    openTickets: number;
    recentUsers: Array<{ id: string; email: string; name: string | null; role: string; createdAt: Date }>;
    recentOrders: Array<{ id: string; orderNumber: string; total: number; status: string; createdAt: Date; user: { email: string; name: string | null } }>;
    recentTickets: Array<{ id: string; subject: string; status: string; priority: string; createdAt: Date; user: { email: string; name: string | null } }>;
  };
}

export default function AdminDashboardClient({ initialStats }: AdminDashboardClientProps) {
  const [stats] = React.useState(initialStats);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-notix-text">Dashboard</h1>
          <p className="text-notix-textMuted">Overview of your NOTIXCLOUD platform</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/users">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={<Users className="h-6 w-6" />}
          color="text-blue-400"
          bgColor="bg-blue-500/10"
          href="/admin/users"
        />
        <StatsCard
          title="Active Customers"
          value={stats.activeCustomers.toLocaleString()}
          icon={<Users className="h-6 w-6" />}
          color="text-green-400"
          bgColor="bg-green-500/10"
          href="/admin/users"
        />
        <StatsCard
          title="Active Servers"
          value={stats.activeServers.toLocaleString()}
          icon={<Server className="h-6 w-6" />}
          color="text-cyan-400"
          bgColor="bg-cyan-500/10"
          href="/admin/servers"
        />
        <StatsCard
          title="Pending Orders"
          value={stats.pendingOrders.toLocaleString()}
          icon={<ShoppingCart className="h-6 w-6" />}
          color="text-yellow-400"
          bgColor="bg-yellow-500/10"
          href="/admin/orders"
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={<DollarSign className="h-6 w-6" />}
          color="text-green-400"
          bgColor="bg-green-500/10"
          href="/admin/payments"
        />
        <StatsCard
          title="Open Tickets"
          value={stats.openTickets.toLocaleString()}
          icon={<Ticket className="h-6 w-6" />}
          color="text-orange-400"
          bgColor="bg-orange-500/10"
          href="/admin/tickets"
        />
      </div>

      <RecentActivity
        users={stats.recentUsers}
        orders={stats.recentOrders}
        tickets={stats.recentTickets}
      />
    </div>
  );
}