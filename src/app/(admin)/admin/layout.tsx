'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  Users,
  Server,
  Package,
  MapPin,
  ShoppingCart,
  CreditCard,
  FileText,
  Briefcase,
  HelpCircle,
  MessageSquare,
  Ticket,
  Megaphone,
  Activity,
  Settings,
  History,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
} from 'lucide-react';
import { auth, signOut } from '@/lib/auth';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Servers', href: '/admin/servers', icon: Server },
  { name: 'Plans', href: '/admin/plans', icon: Package },
  { name: 'Locations', href: '/admin/locations', icon: MapPin },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Invoices', href: '/admin/invoices', icon: FileText },
  { name: 'Portfolio', href: '/admin/portfolio', icon: Briefcase },
  { name: 'Categories', href: '/admin/portfolio/categories', icon: HelpCircle },
  { name: 'FAQs', href: '/admin/faqs', icon: HelpCircle },
  { name: 'Testimonials', href: '/admin/testimonials', icon: MessageSquare },
  { name: 'Tickets', href: '/admin/tickets', icon: Ticket },
  { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
  { name: 'Status', href: '/admin/status', icon: Activity },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: History },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="min-h-screen bg-notix-bg flex">
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-notix-surface border-r border-white/5 transition-all duration-300 flex flex-col',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-notix-accent" />
              <span className="font-bold text-lg text-notix-text">NOTIXCLOUD</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-notix-textMuted hover:text-notix-text"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Admin navigation">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200',
                  'text-sm font-medium',
                  isActive
                    ? 'bg-notix-accent/10 text-notix-accent'
                    : 'text-notix-textMuted hover:text-notix-text hover:bg-white/5',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <form action="/api/auth/signout" method="POST">
            <Button
              type="submit"
              variant="ghost"
              className={cn(
                'w-full justify-start text-notix-textMuted hover:text-red-400 hover:bg-red-500/10',
                collapsed && 'justify-center px-2'
              )}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              {!collapsed && <span>Sign Out</span>}
            </Button>
          </form>
        </div>
      </aside>

      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-300',
          collapsed ? 'lg:ml-16' : 'lg:ml-64'
        )}
      >
        <header className="sticky top-0 z-30 h-16 bg-notix-surface/80 backdrop-blur-md border-b border-white/5">
          <div className="flex h-full items-center justify-between px-6">
            <h1 className="text-xl font-semibold text-notix-text">
              {navigation.find((item) => pathname === item.href || pathname.startsWith(item.href + '/'))?.name || 'Admin Panel'}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-notix-textMuted hidden sm:block">Admin Panel</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}