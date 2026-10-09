'use client';

import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { StaggeredGrid } from '@/components/animations';

const posts = [
  {
    title: 'Introducing Minecraft Server Hosting',
    excerpt: 'We\'re thrilled to announce our new Minecraft server hosting platform — optimized for performance, modding, and scalability.',
    date: 'Oct 5, 2026',
    tag: 'Product',
    slug: '#',
  },
  {
    title: 'How We Achieved 99.99% Uptime in Q3',
    excerpt: 'A deep dive into our infrastructure improvements, failover systems, and the engineering decisions that made it possible.',
    date: 'Sep 28, 2026',
    tag: 'Engineering',
    slug: '#',
  },
  {
    title: 'The Future of Edge Computing',
    excerpt: 'Exploring how edge deployments are changing the game for latency-sensitive applications and what it means for NOTIXCLOUD.',
    date: 'Sep 15, 2026',
    tag: 'Insights',
    slug: '#',
  },
  {
    title: 'DDoS Protection: Behind the Scenes',
    excerpt: 'Learn how our always-on DDoS mitigation works, from traffic analysis to automated response in under 3 seconds.',
    date: 'Sep 2, 2026',
    tag: 'Security',
    slug: '#',
  },
  {
    title: 'Scaling to 10,000 Active Servers',
    excerpt: 'Lessons learned from scaling our platform tenfold in 18 months — automation, monitoring, and hiring the right people.',
    date: 'Aug 20, 2026',
    tag: 'Company',
    slug: '#',
  },
  {
    title: 'NVMe vs SSD: Why We Made the Switch',
    excerpt: 'Benchmarks, real-world performance data, and the business case for going all-in on NVMe storage across our fleet.',
    date: 'Aug 8, 2026',
    tag: 'Engineering',
    slug: '#',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-red-600/[0.05] blur-[150px]" />
        <div className="section-container relative z-10 animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-red-600 font-mono text-sm tracking-[0.3em] uppercase">Blog</span>
            <div className="h-[1px] w-16 bg-gradient-to-r from-red-600 to-transparent" />
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[0.9] mb-6">
            Stories & <br /><span className="text-gradient-red">Insights</span>
          </h1>
          <p className="text-white/40 text-lg max-w-2xl leading-relaxed">
            Engineering deep dives, product updates, and thoughts on the future of cloud infrastructure.
          </p>
        </div>
      </section>

      {/* Posts grid */}
      <section className="pb-24">
        <div className="section-container">
          <StaggeredGrid
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            staggerDelay={100}
            animationType="slide-up"
            duration={700}
          >
            {posts.map((post) => (
              <article
                key={post.title}
                className="group flex flex-col p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-red-600/30 transition-all duration-700"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full bg-red-600/10 border border-red-600/20 text-red-400 text-xs font-medium">
                    {post.tag}
                  </span>
                  <span className="flex items-center gap-1 text-white/30 text-xs">
                    <Clock className="w-3 h-3" /> {post.date}
                  </span>
                </div>
                <h2 className="text-xl font-bold mb-3 group-hover:text-red-400 transition-colors leading-tight">
                  {post.title}
                </h2>
                <p className="text-white/40 text-sm leading-relaxed mb-6 flex-grow">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
                  Read More
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </article>
            ))}
          </StaggeredGrid>
        </div>
      </section>

      <div className="h-[1px] bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />
    </div>
  );
}