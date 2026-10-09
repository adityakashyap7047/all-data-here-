'use client';

import Link from 'next/link';
import { Menu, X, Server, Github } from 'lucide-react';
import { useState, useEffect } from 'react';

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ─── Header ─── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-black/90 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Global">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-3 group" aria-label="NOTIXCLOUD Home" suppressHydrationWarning>
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                  <Server className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight text-white">
                  NOTIX<span className="text-red-500">CLOUD</span>
                </span>
              </Link>

              {/* Desktop nav */}
              <div className="hidden md:flex md:gap-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="relative px-4 py-2 text-sm font-medium text-white/50 transition-all duration-300 hover:text-white rounded-lg hover:bg-white/[0.04] group"
                  >
                    {item.name}
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-red-600 transition-all duration-300 group-hover:w-1/2 rounded-full" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex md:items-center md:gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 rounded-lg transition-all duration-300 hover:bg-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] uppercase tracking-wider"
                >
                  Get Started
                </Link>
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden rounded-lg p-2 text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-6 border-t border-white/[0.06] animate-in">
              <div className="flex flex-col gap-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="px-4 py-3 text-sm font-medium text-white/50 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-white/[0.06]">
                  <Link href="/login" className="btn-secondary w-full text-center" onClick={() => setMobileMenuOpen(false)}>
                    Sign in
                  </Link>
                  <Link href="/register" className="btn-primary w-full text-center" onClick={() => setMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* ─── Main ─── */}
      <main>{children}</main>

      {/* ─── Footer ─── */}
      <footer className="relative border-t border-white/[0.06] bg-black">
        {/* Subtle red glow at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[1px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
            {/* Brand column */}
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-3" suppressHydrationWarning>
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
                  <Server className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight text-white">
                  NOTIX<span className="text-red-500">CLOUD</span>
                </span>
              </Link>
              <p className="text-white/30 text-sm leading-relaxed">
                Powerful Infrastructure.
                <br />
                Built for Your Projects.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/30 hover:text-red-500 transition-colors duration-300"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/30 hover:text-red-500 transition-colors duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                  </svg>
                </a>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/30 hover:text-red-500 transition-colors duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.38-.422.768-.642 1.162a19.279 19.279 0 0 0-5.397 0 12.34 12.34 0 0 0-.639-1.162.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.681 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.083.083 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.079.079 0 0 0 .084-.028 13.29 13.29 0 0 0 .636-1.157 19.18 19.18 0 0 0 5.187 0 13.28 13.28 0 0 0 .637 1.157.079.079 0 0 0 .084.028c1.993-.73 3.898-1.748 5.542-3.083a.079.079 0 0 0 .032-.054c.269-3.243-.164-7.526-1.27-11.876a.061.061 0 0 0-.013-.068.086.086 0 0 0-.056-.022ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Link columns */}
            {[
              {
                title: 'Product',
                links: [
                  { name: 'Features', href: '/features' },
                  { name: 'Pricing', href: '/pricing' },
                  { name: 'Status', href: '/status' },
                  { name: 'Portfolio', href: '/portfolio' },
                ],
              },
              {
                title: 'Company',
                links: [
                  { name: 'About', href: '#' },
                  { name: 'Blog', href: '#' },
                  { name: 'Careers', href: '#' },
                  { name: 'Contact', href: '#' },
                ],
              },
              {
                title: 'Legal',
                links: [
                  { name: 'Privacy Policy', href: '#' },
                  { name: 'Terms of Service', href: '#' },
                  { name: 'SLA', href: '#' },
                  { name: 'Abuse Policy', href: '#' },
                ],
              },
            ].map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-bold text-white/60 uppercase tracking-[0.2em] mb-5">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/30 hover:text-red-400 transition-colors duration-300"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/20">
              &copy; {new Date().getFullYear()} NOTIXCLOUD. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-white/20 text-xs">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}