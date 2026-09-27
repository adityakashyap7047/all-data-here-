import Link from 'next/link';
import { Menu, X, Sun, Moon, Server, Github } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Features', href: '/features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Status', href: '/status' },
  { name: 'Portfolio', href: '/portfolio' },
];

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-notix-bg text-notix-text">
      <header className="fixed top-0 left-0 right-0 z-50 bg-notix-bg/95 backdrop-blur-lg border-b border-white/5">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Global">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2" aria-label="NOTIXCLOUD Home">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-notix-accent to-blue-500 flex items-center justify-center">
                  <Server className="w-6 h-6 text-notix-bg" />
                </div>
                <span className="text-xl font-bold text-notix-text">NOTIXCLOUD</span>
              </Link>

              <div className="hidden md:flex md:gap-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm font-medium text-notix-textMuted transition-colors hover:text-notix-text"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-lg p-2 text-notix-textMuted hover:text-notix-text hover:bg-white/5 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="hidden md:flex md:items-center md:gap-3">
                <Link href="/login" className="btn-ghost">
                  Sign in
                </Link>
                <Link href="/register" className="btn-primary">
                  Get Started
                </Link>
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden rounded-lg p-2 text-notix-textMuted hover:text-notix-text hover:bg-white/5"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/5">
              <div className="flex flex-col gap-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm font-medium text-notix-textMuted hover:text-notix-text"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
                  <Link href="/login" className="btn-secondary w-full" onClick={() => setMobileMenuOpen(false)}>
                    Sign in
                  </Link>
                  <Link href="/register" className="btn-primary w-full" onClick={() => setMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      <main className="pt-16">{children}</main>

      <footer className="border-t border-white/5 bg-notix-surface/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-notix-accent to-blue-500 flex items-center justify-center">
                  <Server className="w-6 h-6 text-notix-bg" />
                </div>
                <span className="text-xl font-bold text-notix-text">NOTIXCLOUD</span>
              </Link>
              <p className="text-notix-textMuted text-sm">
                Powerful Infrastructure. Built for Your Projects.
              </p>
              <div className="flex gap-4">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-notix-textMuted hover:text-notix-accent transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-notix-textMuted hover:text-notix-accent transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
                </a>
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-notix-textMuted hover:text-notix-accent transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.38-.422.768-.642 1.162a19.279 19.279 0 0 0-5.397 0 12.34 12.34 0 0 0-.639-1.162.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.681 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.083.083 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.079.079 0 0 0 .084-.028 13.29 13.29 0 0 0 .636-1.157 19.18 19.18 0 0 0 5.187 0 13.28 13.28 0 0 0 .637 1.157.079.079 0 0 0 .084.028c1.993-.73 3.898-1.748 5.542-3.083a.079.079 0 0 0 .032-.054c.269-3.243-.164-7.526-1.27-11.876a.061.061 0 0 0-.013-.068.086.086 0 0 0-.056-.022ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-notix-text uppercase tracking-wider">Product</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/features" className="text-sm text-notix-textMuted hover:text-notix-accent transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-sm text-notix-textMuted hover:text-notix-accent transition-colors">Pricing</Link></li>
                <li><Link href="/status" className="text-sm text-notix-textMuted hover:text-notix-accent transition-colors">Status</Link></li>
                <li><Link href="/portfolio" className="text-sm text-notix-textMuted hover:text-notix-accent transition-colors">Portfolio</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-notix-text uppercase tracking-wider">Company</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="#" className="text-sm text-notix-textMuted hover:text-notix-accent transition-colors">About</Link></li>
                <li><Link href="#" className="text-sm text-notix-textMuted hover:text-notix-accent transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-sm text-notix-textMuted hover:text-notix-accent transition-colors">Careers</Link></li>
                <li><Link href="#" className="text-sm text-notix-textMuted hover:text-notix-accent transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-notix-text uppercase tracking-wider">Legal</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="#" className="text-sm text-notix-textMuted hover:text-notix-accent transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-sm text-notix-textMuted hover:text-notix-accent transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="text-sm text-notix-textMuted hover:text-notix-accent transition-colors">SLA</Link></li>
                <li><Link href="#" className="text-sm text-notix-textMuted hover:text-notix-accent transition-colors">Abuse Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5">
            <p className="text-center text-sm text-notix-textMuted">
              &copy; {new Date().getFullYear()} NOTIXCLOUD. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}