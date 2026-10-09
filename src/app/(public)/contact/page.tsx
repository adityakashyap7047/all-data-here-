'use client';

import { useRef, useState, useEffect } from 'react';
import { Mail, MapPin, MessageSquare, Clock, ArrowRight } from 'lucide-react';

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

const contactMethods = [
  { icon: Mail, title: 'Email', detail: 'support@notixcloud.com', description: 'For general inquiries and support.' },
  { icon: MessageSquare, title: 'Live Chat', detail: 'Available 24/7', description: 'Get instant help from our support team.' },
  { icon: MapPin, title: 'Headquarters', detail: 'San Francisco, CA', description: 'Drop by our office for a coffee.' },
  { icon: Clock, title: 'Response Time', detail: '< 2 hours', description: 'Average first response for all tickets.' },
];

export default function ContactPage() {
  const hero = useScrollReveal();
  const formSection = useScrollReveal();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-red-600/[0.05] blur-[150px]" />
        <div ref={hero.ref} className={`section-container relative z-10 transition-all duration-1000 ${hero.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-red-600 font-mono text-sm tracking-[0.3em] uppercase">Contact</span>
            <div className="h-[1px] w-16 bg-gradient-to-r from-red-600 to-transparent" />
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[0.9] mb-6">
            Get in <br /><span className="text-gradient-red">touch.</span>
          </h1>
          <p className="text-white/40 text-lg max-w-2xl leading-relaxed">
            Have a question, need help, or want to partner with us? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="pb-16">
        <div className="section-container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, i) => (
              <div key={method.title} className="group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-red-600/30 transition-all duration-500" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center mb-4 group-hover:bg-red-600/20 transition-colors">
                  <method.icon className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-bold mb-1 group-hover:text-red-400 transition-colors">{method.title}</h3>
                <p className="text-white font-medium text-sm mb-1">{method.detail}</p>
                <p className="text-white/40 text-sm">{method.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24 relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />
        <div ref={formSection.ref} className={`section-container transition-all duration-1000 ${formSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-black tracking-tight mb-4 text-center">Send us a <span className="text-gradient-red">message</span></h2>
            <p className="text-white/40 text-center mb-10">Fill out the form below and we&apos;ll get back to you within 2 hours.</p>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-2">Name</label>
                  <input type="text" placeholder="John Doe" className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/10 transition-all duration-300" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-2">Email</label>
                  <input type="email" placeholder="john@example.com" className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/10 transition-all duration-300" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-2">Subject</label>
                <input type="text" placeholder="How can we help?" className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/10 transition-all duration-300" />
              </div>
              <div>
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-2">Message</label>
                <textarea rows={5} placeholder="Tell us more..." className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/10 transition-all duration-300 resize-none" />
              </div>
              <button type="submit" className="w-full py-3.5 rounded-xl bg-red-600 text-white font-bold uppercase tracking-wider text-sm transition-all duration-300 hover:bg-red-500 hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2">
                <ArrowRight className="w-4 h-4" /> Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      <div className="h-[1px] bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />
    </div>
  );
}
