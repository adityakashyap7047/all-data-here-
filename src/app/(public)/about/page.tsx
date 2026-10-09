'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Users, Shield, Globe, ArrowRight, Star, Server } from 'lucide-react';

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, isVisible };
}

const values = [
  { icon: Shield, title: 'Mission-Driven', description: 'Every decision we make is guided by our mission to democratize cloud infrastructure for everyone.' },
  { icon: Star, title: 'Customer First', description: 'We obsess over our users. Their success is our success, and we build every feature with them in mind.' },
  { icon: Server, title: 'Excellence', description: 'We hold ourselves to the highest standard. Mediocrity is never an option — only the best will do.' },
  { icon: Globe, title: 'Innovation', description: 'We push boundaries and challenge the status quo. The future of infrastructure is what we make it.' },
];

const team = [
  { name: 'Alex Chen', role: 'CEO & Co-Founder', initial: 'AC' },
  { name: 'Sarah Mitchell', role: 'CTO', initial: 'SM' },
  { name: 'James Park', role: 'VP Engineering', initial: 'JP' },
  { name: 'Maria Rodriguez', role: 'Head of Design', initial: 'MR' },
  { name: 'David Kim', role: 'Lead DevOps', initial: 'DK' },
  { name: 'Emily Zhang', role: 'Head of Support', initial: 'EZ' },
];

export default function AboutPage() {
  const hero = useScrollReveal();
  const story = useScrollReveal();
  const valuesSection = useScrollReveal();
  const teamSection = useScrollReveal();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-red-600/[0.05] blur-[150px]" />
        <div ref={hero.ref} className={`section-container relative z-10 transition-all duration-1000 ${hero.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-red-600 font-mono text-sm tracking-[0.3em] uppercase">About Us</span>
            <div className="h-[1px] w-16 bg-gradient-to-r from-red-600 to-transparent" />
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[0.9] mb-6">
            We build the <br /><span className="text-gradient-red">backbone</span> of the internet.
          </h1>
          <p className="text-white/40 text-lg max-w-2xl leading-relaxed">
            Founded in 2020, NOTIXCLOUD was born from a simple belief: enterprise-grade infrastructure shouldn&apos;t require an enterprise budget.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-24">
        <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />
        <div ref={story.ref} className={`section-container transition-all duration-1000 ${story.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-6">Our <span className="text-gradient-red">Story</span></h2>
              <div className="space-y-4 text-white/40 leading-relaxed">
                <p>It started in a garage — as all great tech stories do. A team of engineers frustrated by overpriced, overcomplicated hosting decided enough was enough.</p>
                <p>We built NOTIXCLOUD to be the hosting platform we always wanted: blazing fast, dead simple, and honestly priced. No surprise fees. No vendor lock-in. Just raw power at your fingertips.</p>
                <p>Today we serve over 10,000 active servers across 6 global locations, with a team of 50+ passionate engineers, designers, and support specialists.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: '2020', label: 'Founded' },
                { num: '50+', label: 'Team Members' },
                { num: '10k+', label: 'Active Servers' },
                { num: '6', label: 'Data Centers' },
              ].map((stat, i) => (
                <div key={stat.label} className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center" style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="text-3xl font-black text-white mb-1">{stat.num}</div>
                  <div className="text-white/40 text-xs uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />
        <div ref={valuesSection.ref} className={`section-container transition-all duration-1000 ${valuesSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">Our <span className="text-gradient-red">Values</span></h2>
          <p className="text-white/40 mb-12 max-w-xl">The principles that guide everything we build.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={v.title} className="group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-red-600/30 transition-all duration-500" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center mb-4 group-hover:bg-red-600/20 transition-colors">
                  <v.icon className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-red-400 transition-colors">{v.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />
        <div ref={teamSection.ref} className={`section-container transition-all duration-1000 ${teamSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">The <span className="text-gradient-red">Team</span></h2>
          <p className="text-white/40 mb-12 max-w-xl">The people building the future of cloud infrastructure.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member, i) => (
              <div key={member.name} className="group flex items-center gap-4 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-red-600/30 transition-all duration-500" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="w-14 h-14 rounded-full bg-red-600/10 border border-red-600/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-500 font-bold text-sm">{member.initial}</span>
                </div>
                <div>
                  <h3 className="font-bold group-hover:text-red-400 transition-colors">{member.name}</h3>
                  <p className="text-white/40 text-sm">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-[1px] bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />
    </div>
  );
}
