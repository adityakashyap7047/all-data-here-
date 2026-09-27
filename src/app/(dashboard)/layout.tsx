'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { 
  LayoutDashboard, Server, CreditCard, ShoppingBag, 
  MessageSquare, Bell, Settings, LogOut, Menu, X, 
  ChevronDown, User, Shield, Key, Moon, Sun
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-notix-bg">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-notix-surface border-r border-white/5 transform transition-transform duration-300 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-white/5">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-notix-accent to-blue-500 flex items-center justify-center">
                <Server className="w-6 h-6 text-notix-bg" />
              </div>
              <span className="text-xl font-bold text-notix-text">NOTIXCLOUD</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-notix-textMuted hover:text-notix-text"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-notix-accent/10 text-notix-accent border border-notix-accent/20'
                      : 'text-notix-textMuted hover:text-notix-text hover:bg-white/5'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/avatar.png" alt="User" />
                <AvatarFallback className="text-notix-accent font-medium">U</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-notix-text truncate">User Name</p>
                <p className="text-xs text-notix-textMuted truncate">user@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-notix-bg/95 backdrop-blur-lg border-b border-white/5">
          <div className="flex h-full items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-notix-textMuted hover:text-notix-text hover:bg-white/5"
                aria-label="Open sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-notix-text hidden sm:block">
                {navigation.find(n => pathname === n.href || pathname.startsWith(n.href + '/'))?.name || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg text-notix-textMuted hover:text-notix-text hover:bg-white/5 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg text-notix-textMuted hover:text-notix-text hover:bg-white/5">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-notix-accent rounded-full" />
              </button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/avatar.png" alt="User" />
                      <AvatarFallback className="text-notix-accent font-medium">U</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium text-notix-text">User Name</span>
                    <ChevronDown className="w-4 h-4 text-notix-textMuted" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-notix-surface border border-white/10">
                  <div className="px-2 py-1">
                    <p className="text-sm font-medium text-notix-text">User Name</p>
                    <p className="text-xs text-notix-textMuted">user@example.com</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="flex items-center gap-2" onClick={() => setUserMenuOpen(false)}>
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings#security" className="flex items-center gap-2" onClick={() => setUserMenuOpen(false)}>
                      <Shield className="w-4 h-4" />
                      Security
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings#api" className="flex items-center gap-2" onClick={() => setUserMenuOpen(false)}>
                      <Key className="w-4 h-4" />
                      API Keys
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-400 focus:text-red-400"
                    onClick={() => signOut({ callbackUrl: '/' })}
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