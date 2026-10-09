'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  LayoutDashboard,
  Server,
  ShoppingCart,
  CreditCard,
  FileText,
  LifeBuoy,
  Bell,
  User,
  Shield,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Servers', href: '/dashboard/servers', icon: Server },
  { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Invoices', href: '/dashboard/invoices', icon: FileText },
  { name: 'Support', href: '/dashboard/support', icon: LifeBuoy },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'Security', href: '/dashboard/security', icon: Shield },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out flex flex-col',
          sidebarOpen ? 'w-64' : 'w-20',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Dashboard navigation"
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-2" aria-label="Dashboard Home">
            <svg className="h-8 w-8 text-indigo-600 dark:text-indigo-400" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="currentColor" />
              <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {sidebarOpen && <span className="text-xl font-bold text-slate-900 dark:text-white">NOTIXCLOUD</span>}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto" role="navigation" aria-label="Main navigation">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
                  !sidebarOpen && 'justify-center'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className={cn('flex items-center gap-3', !sidebarOpen && 'justify-center')}>
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <span className="text-indigo-600 dark:text-indigo-400 font-medium text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            )}
          </div>
          <Link
            href="/logout"
            className={cn(
              'mt-3 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors',
              !sidebarOpen && 'justify-center'
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            {sidebarOpen && <span>Sign Out</span>}
          </Link>
        </div>
      </aside>

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={cn('lg:pl-64 transition-all duration-300', sidebarOpen ? 'pl-64' : 'pl-20')}>
        <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
          <div className="flex h-full items-center justify-between px-4 sm:px-6">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center gap-4">
              <Link href="/" className="hidden sm:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                <span>View Site</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}