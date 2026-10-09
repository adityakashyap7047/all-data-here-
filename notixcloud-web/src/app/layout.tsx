import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NOTIXCLOUD - Powerful Infrastructure for Your Projects",
    template: "%s | NOTIXCLOUD",
  },
  description:
    "High-performance VPS hosting, Minecraft server hosting, and cloud infrastructure. Global locations, NVMe storage, DDoS protection, and 99.9% uptime SLA.",
  keywords: [
    "VPS hosting",
    "cloud infrastructure",
    "Minecraft hosting",
    "NVMe VPS",
    "dedicated servers",
    "cloud hosting",
  ],
  authors: [{ name: "NOTIXCLOUD" }],
  creator: "NOTIXCLOUD",
  publisher: "NOTIXCLOUD",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://notixcloud.dev",
    siteName: "NOTIXCLOUD",
    title: "NOTIXCLOUD - Powerful Infrastructure for Your Projects",
    description:
      "High-performance VPS hosting, Minecraft server hosting, and cloud infrastructure.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NOTIXCLOUD - Powerful Infrastructure",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NOTIXCLOUD - Powerful Infrastructure for Your Projects",
    description:
      "High-performance VPS hosting, Minecraft server hosting, and cloud infrastructure.",
    images: ["/og-image.png"],
    creator: "@notixcloud",
  },
  verification: {
    google: "google-site-verification-code",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.notixcloud.dev" />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}