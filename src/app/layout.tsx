import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/shared/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'NOTIXCLOUD | Powerful Infrastructure. Built for Your Projects.',
    template: '%s | NOTIXCLOUD',
  },
  description: 'High-performance VPS hosting, Minecraft servers, and cloud infrastructure. Enterprise-grade hardware, global locations, 99.9% uptime SLA.',
  keywords: ['VPS', 'cloud hosting', 'Minecraft server', 'cloud infrastructure', 'virtual private server'],
  authors: [{ name: 'NOTIXCLOUD' }],
  creator: 'NOTIXCLOUD',
  publisher: 'NOTIXCLOUD',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://notixcloud.com',
    siteName: 'NOTIXCLOUD',
    title: 'NOTIXCLOUD | Powerful Infrastructure. Built for Your Projects.',
    description: 'High-performance VPS hosting, Minecraft servers, and cloud infrastructure.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NOTIXCLOUD',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NOTIXCLOUD',
    description: 'Powerful Infrastructure. Built for Your Projects.',
    images: ['/images/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#0B0F19',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6426115653237480"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.variable} ${jetbrains.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}