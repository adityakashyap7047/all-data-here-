'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Server, Shield, Zap, Globe, Database, Lock, ArrowRight, CheckCircle, ChevronDown, Star, TrendingUp, Users } from 'lucide-react';
import { Marquee, MarqueeItem, SplitText, StaggeredGrid, Magnetic } from '@/components/animations';

/* ─── Intersection Observer hook for scroll reveals ─── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

/* ─── Scroll progress bar ─── */
function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 w-1 z-[9999]"
      style={{
        height: `${progress}%`,
        background: 'linear-gradient(to bottom, #dc2626, #ef4444, #fca5a5)',
        transition: 'height 0.05s linear',
      }}
    />
  );
}

/* ─── Chapter number component ─── */
function ChapterNumber({ num }: { num: string }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className="text-red-600 font-mono text-sm tracking-[0.3em] uppercase">Chapter {num}</span>
      <div className="h-[1px] w-16 bg-gradient-to-r from-red-600 to-transparent" />
    </div>
  );
}

/* ─── Animated counter ─── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let start = 0;
          const duration = 2000;
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

const features = [
  {
    icon: Server,
    title: 'High Performance VPS',
    description: 'NVMe SSD storage, latest gen CPUs, and dedicated resources for maximum performance.',
    highlight: '99.9% uptime SLA',
  },
  {
    icon: Shield,
    title: 'DDoS Protection',
    description: 'Enterprise-grade DDoS mitigation included free on all plans. Always-on detection.',
    highlight: 'Always-on protection',
  },
  {
    icon: Zap,
    title: 'Instant Provisioning',
    description: 'Your server is ready in seconds, not minutes. Automated setup via API or dashboard.',
    highlight: 'Ready in < 60 seconds',
  },
  {
    icon: Globe,
    title: 'Global Locations',
    description: 'Deploy in 6+ data centers worldwide. Low latency for your users wherever they are.',
    highlight: 'US, EU, APAC regions',
  },
  {
    icon: Database,
    title: 'Automated Backups',
    description: 'Daily automated backups with 7-day retention. One-click restore from dashboard.',
    highlight: '7-day retention free',
  },
  {
    icon: Lock,
    title: 'Full Root Access',
    description: 'Complete control over your server. Install any OS, configure any software.',
    highlight: 'KVM virtualization',
  },
];

export default function LandingPage() {
  const hero = useScrollReveal();
  const chapter1 = useScrollReveal();
  const chapter2 = useScrollReveal();
  const chapter3 = useScrollReveal();
  const chapter4 = useScrollReveal();

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <ScrollProgress />

      {/* ═══════════════════════════════════════════
          PROLOGUE — Full-screen Hero
      ═══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          {/* Radial red glow from center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-red-600/[0.07] blur-[120px]" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
          {/* Diagonal red line */}
          <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-red-600/30 to-transparent transform rotate-12 translate-x-[40vw]" />
          <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-transparent via-red-600/20 to-transparent transform -rotate-12 -translate-x-[30vw]" />
        </div>

        <div
          ref={hero.ref}
          className={`relative z-10 text-center max-w-5xl mx-auto px-4 transition-all duration-[1.5s] ease-out ${
            hero.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-red-600/30 bg-red-600/[0.08] mb-10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-red-400 text-sm font-medium tracking-wide">Minecraft Hosting Now Live</span>
          </div>

          {/* Giant heading */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
            <SplitText
              splitType="lines"
              animationType="slide"
              duration={1}
              stagger={0.15}
              className="text-white"
            >
              POWERFUL
            </SplitText>
            <SplitText
              splitType="lines"
              animationType="slide"
              duration={1}
              stagger={0.15}
              delay={0.1}
              className="text-gradient-red"
            >
              INFRASTRUCTURE.
            </SplitText>
            <SplitText
              splitType="lines"
              animationType="fade"
              duration={0.8}
              stagger={0.1}
              delay={0.3}
              className="text-white/40 text-3xl sm:text-4xl lg:text-5xl font-light tracking-normal"
            >
              Built for Your Projects.
            </SplitText>
          </h1>

          {/* Subtitle */}
          <p className="text-white/40 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Enterprise-grade VPS hosting. Minecraft servers.
            <br className="hidden sm:block" />
            Cloud infrastructure that never sleeps.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="btn-primary group">
              Start Free Trial
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/pricing" className="btn-secondary">
              View Pricing
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20 animate-bounce">
          <span className="text-xs tracking-[0.3em] uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          MARQUEE — Trust Badges / Awards
      ═══════════════════════════════════════════ */}
      <section className="relative py-16 border-t border-white/[0.06] border-b border-white/[0.06] bg-white/[0.01]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-600/[0.03] to-transparent" />
        <div className="relative z-10">
          <Marquee speed={30} direction="left" pauseOnHover className="max-w-full">
            {[
              { icon: Star, label: '99.99% Uptime SLA' },
              { icon: Star, label: '4.9/5 Customer Rating' },
              { icon: TrendingUp, label: '10k+ Active Servers' },
              { icon: Users, label: '5000+ Developers' },
              { icon: Shield, label: 'Enterprise DDoS Protection' },
              { icon: Globe, label: '6 Global Locations' },
              { icon: Zap, label: 'Instant Provisioning' },
              { icon: Database, label: 'Automated Daily Backups' },
            ].map((item, i) => (
              <MarqueeItem key={i} className="flex items-center gap-3 px-6 py-3 bg-white/[0.02] border border-white/[0.06] rounded-xl whitespace-nowrap transition-all duration-500 hover:border-red-500/30 hover:bg-red-500/[0.03]">
                <div className="w-10 h-10 rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-red-500" />
                </div>
                <span className="text-white/80 text-sm font-medium">{item.label}</span>
              </MarqueeItem>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CHAPTER 01 — The Numbers
      ═══════════════════════════════════════════ */}
      <section className="relative py-32 sm:py-40">
        {/* Horizontal red line divider */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />

        <div className="section-container">
          <div
            ref={chapter1.ref}
            className={`transition-all duration-1000 ease-out ${
              chapter1.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
            }`}
          >
            <ChapterNumber num="01" />
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight mb-20">
              Numbers that
              <br />
              <span className="text-gradient-red">speak volumes.</span>
            </h2>
          </div>

          <StaggeredGrid
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
            staggerDelay={150}
            animationType="slide-up"
            duration={700}
          >
            {[
              { value: 99, suffix: '.99%', label: 'Uptime SLA' },
              { value: 6, suffix: '+', label: 'Global Locations' },
              { value: 10, suffix: 'k+', label: 'Active Servers' },
              { value: 24, suffix: '/7', label: 'Expert Support' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="relative p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center group hover:border-red-600/30 transition-all duration-700"
              >
                <div className="text-4xl sm:text-5xl font-black text-white mb-3">
                  <Counter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-white/40 text-sm uppercase tracking-wider">{stat.label}</div>
                {/* Corner accent */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-600/30 rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-600/30 rounded-br-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </StaggeredGrid>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CHAPTER 02 — Features (The Arsenal)
      ═══════════════════════════════════════════ */}
      <section className="relative py-32 sm:py-40">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />
        {/* Background accent */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-red-600/[0.04] blur-[150px]" />

        <div className="section-container relative z-10">
          <div
            ref={chapter2.ref}
            className={`transition-all duration-1000 ease-out ${
              chapter2.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
            }`}
          >
            <ChapterNumber num="02" />
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight mb-6">
              Your complete
              <br />
              <span className="text-gradient-red">arsenal.</span>
            </h2>
            <p className="text-white/40 text-lg max-w-xl mb-20">
              Enterprise features included on every plan. No hidden costs. No surprises. Just raw power.
            </p>
          </div>

          <StaggeredGrid
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            staggerDelay={120}
            animationType="slide-up"
            duration={700}
          >
            {features.map((feature, i) => (
              <Magnetic key={feature.title} strength={0.15}>
                <div
                  className="group relative p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-all duration-700 hover:border-red-600/40 hover:bg-red-600/[0.03]"
                >
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center mb-6 group-hover:bg-red-600/20 group-hover:border-red-600/40 transition-all duration-500">
                    <feature.icon className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed mb-5">{feature.description}</p>
                  <div className="flex items-center gap-2 text-red-500/80 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    <span>{feature.highlight}</span>
                  </div>
                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-2xl bg-red-600/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              </Magnetic>
            ))}
          </StaggeredGrid>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CHAPTER 03 — The Manifesto
      ═══════════════════════════════════════════ */}
      <section className="relative py-32 sm:py-40">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />

        <div className="section-container">
          <div
            ref={chapter3.ref}
            className={`max-w-4xl mx-auto transition-all duration-1000 ease-out ${
              chapter3.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
            }`}
          >
            <ChapterNumber num="03" />

            <div className="space-y-8">
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
                We don&apos;t just host servers.
              </h2>
              <div className="flex gap-6">
                <div className="w-1 bg-gradient-to-b from-red-600 via-red-600/50 to-transparent rounded-full flex-shrink-0" />
                <div className="space-y-6">
                  <p className="text-white/50 text-xl leading-relaxed">
                    We build the foundation your ambitions deserve. Every line of code,
                    every packet of data, every millisecond of uptime — engineered to perfection.
                  </p>
                  <p className="text-white/30 text-lg leading-relaxed">
                    From solo developers to enterprise teams, our infrastructure scales
                    with your vision. No compromises. No excuses.
                  </p>
                </div>
              </div>

              {/* Dramatic quote */}
              <div className="relative mt-16 p-10 rounded-2xl border border-red-600/20 bg-red-600/[0.03]">
                <div className="absolute -top-4 left-8">
                  <span className="text-6xl text-red-600/40 font-serif">&ldquo;</span>
                </div>
                <p className="text-2xl sm:text-3xl font-light text-white/80 italic leading-relaxed">
                  Infrastructure should be invisible — until you need it to be
                  <span className="text-red-400"> unstoppable.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CHAPTER 04 — The Call to Action (Climax)
      ═══════════════════════════════════════════ */}
      <section className="relative py-32 sm:py-48">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />

        {/* Dramatic background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full bg-red-600/[0.05] blur-[200px]" />
          {/* Converging lines */}
          <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-red-600/10 to-transparent" />
          <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-red-600/10 to-transparent" />
        </div>

        <div
          ref={chapter4.ref}
          className={`section-container relative z-10 text-center transition-all duration-1000 ease-out ${
            chapter4.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-95'
          }`}
        >
          <ChapterNumber num="04" />

          <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-8">
            <span className="block text-white">READY TO</span>
            <span className="block text-gradient-red">DEPLOY?</span>
          </h2>

          <p className="text-white/40 text-lg sm:text-xl max-w-2xl mx-auto mb-12">
            Join thousands of developers who trust NOTIXCLOUD.
            <br />
            7-day free trial. No credit card required.
          </p>

          <Magnetic strength={0.2}>
            <Link
              href="/register"
              className="inline-flex items-center gap-3 bg-red-600 text-white px-10 py-5 rounded-xl text-lg font-bold uppercase tracking-wider transition-all duration-500 hover:bg-red-500 hover:shadow-[0_0_60px_rgba(220,38,38,0.4)] hover:scale-105 group"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
            </Link>
          </Magnetic>

          {/* Trust badges */}
          <div className="mt-16 flex items-center justify-center gap-8 text-white/20 text-sm">
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4" /> SSL Encrypted
            </span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4" /> DDoS Protected
            </span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4" /> Global CDN
            </span>
          </div>
        </div>
      </section>

      {/* End line */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />
    </div>
  );
}