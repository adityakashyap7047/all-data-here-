'use client';

import { useRef, useState, useEffect } from 'react';
import { Code, Globe, Shield, Zap, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';

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

const openings = [
  { title: 'Senior Backend Engineer', team: 'Engineering', location: 'Remote', type: 'Full-time' },
  { title: 'DevOps Engineer', team: 'Infrastructure', location: 'Remote', type: 'Full-time' },
  { title: 'Frontend Developer (React)', team: 'Product', location: 'Remote', type: 'Full-time' },
  { title: 'Security Engineer', team: 'Security', location: 'Remote / US', type: 'Full-time' },
  { title: 'Technical Support Specialist', team: 'Support', location: 'Remote / EU', type: 'Full-time' },
  { title: 'Product Designer', team: 'Design', location: 'Remote', type: 'Full-time' },
];

const perks = [
  { icon: Globe, title: 'Fully Remote', description: 'Work from anywhere in the world. We\'re a distributed team across 12 countries.' },
  { icon: Star, title: 'Health & Wellness', description: 'Comprehensive health insurance, mental health support, and wellness stipend.' },
  { icon: Code, title: 'Learning Budget', description: '$2,000/year for conferences, courses, and books to level up your skills.' },
  { icon: Zap, title: 'Top-tier Hardware', description: 'Latest MacBook or Linux workstation — your choice, refreshed every 2 years.' },
];

export default function CareersPage() {
  const hero = useScrollReveal();
  const perksSection = useScrollReveal();
  const rolesSection = useScrollReveal();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-red-600/[0.05] blur-[150px]" />
        <div ref={hero.ref} className={`section-container relative z-10 transition-all duration-1000 ${hero.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-red-600 font-mono text-sm tracking-[0.3em] uppercase">Careers</span>
            <div className="h-[1px] w-16 bg-gradient-to-r from-red-600 to-transparent" />
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[0.9] mb-6">
            Build the <br /><span className="text-gradient-red">future</span> with us.
          </h1>
          <p className="text-white/40 text-lg max-w-2xl leading-relaxed">
            Join a team of passionate engineers, designers, and operators building the next generation of cloud infrastructure.
          </p>
        </div>
      </section>

      {/* Perks */}
      <section className="py-24 relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />
        <div ref={perksSection.ref} className={`section-container transition-all duration-1000 ${perksSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <h2 className="text-3xl font-black tracking-tight mb-4">Why <span className="text-gradient-red">NOTIXCLOUD</span></h2>
          <p className="text-white/40 mb-12 max-w-xl">We take care of our people so they can take care of our platform.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map((perk, i) => (
              <div key={perk.title} className="group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-red-600/30 transition-all duration-500" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center mb-4 group-hover:bg-red-600/20 transition-colors">
                  <perk.icon className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-red-400 transition-colors">{perk.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{perk.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section className="py-24 relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />
        <div ref={rolesSection.ref} className={`section-container transition-all duration-1000 ${rolesSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <h2 className="text-3xl font-black tracking-tight mb-4">Open <span className="text-gradient-red">Positions</span></h2>
          <p className="text-white/40 mb-12 max-w-xl">{openings.length} roles open. Find your next chapter.</p>
          <div className="space-y-4">
            {openings.map((role, i) => (
              <div key={role.title} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-red-600/30 transition-all duration-500" style={{ transitionDelay: `${i * 80}ms` }}>
                <div>
                  <h3 className="text-lg font-bold group-hover:text-red-400 transition-colors">{role.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-white/40 text-sm">
                    <span>{role.team}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span>{role.location}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span>{role.type}</span>
                  </div>
                </div>
                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600/10 border border-red-600/20 text-red-400 text-sm font-medium hover:bg-red-600/20 transition-all">
                  Apply <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-[1px] bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />
    </div>
  );
}
