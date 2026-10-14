'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  LayoutDashboard, Server, CreditCard, ShoppingBag, 
  MessageSquare, Bell, Settings, LogOut, Menu, X, 
  ChevronDown, User, Shield, Key, Moon, Sun
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'VPS Instances', href: '/dashboard/vps', icon: Server },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
  { name: 'Support', href: '/dashboard/tickets', icon: MessageSquare },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  const user = session?.user;
  const userName = user?.name || (user?.email ? user.email.split('@')[0] : 'Admin User');
  const userEmail = user?.email || 'admin@notixcloud.com';
  const userInitial = (userName?.[0] || 'A').toUpperCase();
  const isAdmin = (user as any)?.role === 'SUPER_ADMIN' || (user as any)?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0c] border-r border-white/[0.08] transform transition-transform duration-300 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-white/[0.08]">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30">
                <Server className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                NOTIX<span className="text-red-500">CLOUD</span>
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-white/50 hover:text-white"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto" aria-label="Main navigation">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                    isActive
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                      : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-white/[0.08]">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500 font-bold text-base flex-shrink-0">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{userName}</p>
                <p className="text-xs text-white/40 truncate">{userEmail}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-black/90 backdrop-blur-xl border-b border-white/[0.08]">
          <div className="flex h-full items-center justify-between px-4 sm:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5"
                aria-label="Open sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-black tracking-tight text-white hidden sm:block">
                {navigation.find(n => pathname === n.href || (n.href !== '/dashboard' && pathname.startsWith(n.href)))?.name || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Toggle theme"
              >
                {mounted && theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {/* Notifications */}
              <Link
                href="/dashboard/notifications"
                className="relative p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </Link>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                    <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500 font-bold text-sm">
                      {userInitial}
                    </div>
                    <span className="hidden sm:block text-sm font-bold text-white">{userName}</span>
                    <ChevronDown className="w-4 h-4 text-white/40" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 bg-[#121216] border border-white/10 p-2 rounded-xl shadow-2xl">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-white truncate">{userName}</p>
                      {isAdmin && (
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-600/30 font-bold">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/40 truncate mt-0.5">{userEmail}</p>
                  </div>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 font-semibold hover:bg-red-600/10 rounded-lg cursor-pointer">
                        <Server className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer">
                      <User className="w-4 h-4" />
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/billing" className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer">
                      <CreditCard className="w-4 h-4" />
                      Billing & Invoices
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10 my-1" />
                  <DropdownMenuItem 
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-600/10 rounded-lg cursor-pointer font-medium"
                    onClick={() => signOut({ callbackUrl: '/login' })}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}