'use client';

import Link from 'next/link';
import { GitBranch, MessageSquare, MessageCircle, Mail } from 'lucide-react';

const footerLinks = {
  product: [
    { name: 'VPS Hosting', href: '/vps' },
    { name: 'Minecraft Hosting', href: '/minecraft' },
    { name: 'Features', href: '/features' },
    { name: 'Locations', href: '/locations' },
    { name: 'Pricing', href: '/vps#pricing' },
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Blog', href: '/blog' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
  ],
  resources: [
    { name: 'Documentation', href: '/docs' },
    { name: 'API Reference', href: '/docs/api' },
    { name: 'Status', href: '/status' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Community', href: '/community' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Acceptable Use', href: '/acceptable-use' },
    { name: 'SLA', href: '/sla' },
    { name: 'Cookie Policy', href: '/cookies' },
  ],
};

const socialLinks = [
  { name: 'GitHub', href: 'https://github.com/notixcloud', icon: GitBranch },
  { name: 'Twitter', href: 'https://twitter.com/notixcloud', icon: MessageSquare },
  { name: 'Discord', href: 'https://discord.gg/notixcloud', icon: MessageCircle },
  { name: 'Email', href: 'mailto:hello@notixcloud.dev', icon: Mail },
];

export function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Link href="/" className="flex items-center space-x-2" aria-label="NOTIXCLOUD Home">
              <svg
                className="h-8 w-8 text-indigo-600 dark:text-indigo-400"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect width="32" height="32" rx="8" fill="currentColor" />
                <path
                  d="M8 16L14 22L24 10"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                NOTIXCLOUD
              </span>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
              Powerful cloud infrastructure for developers and businesses.
              High-performance VPS, managed services, and enterprise solutions.
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  aria-label={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  Product
                </h3>
                <ul className="mt-4 space-y-3" role="list">
                  {footerLinks.product.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  Company
                </h3>
                <ul className="mt-4 space-y-3" role="list">
                  {footerLinks.company.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  Resources
                </h3>
                <ul className="mt-4 space-y-3" role="list">
                  {footerLinks.resources.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  Legal
                </h3>
                <ul className="mt-4 space-y-3" role="list">
                  {footerLinks.legal.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8">
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            &copy; {new Date().getFullYear()} NOTIXCLOUD. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}