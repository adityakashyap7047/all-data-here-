'use client';

import { useState } from 'react';
import { Mail, MapPin, Clock, Send, CheckCircle, AlertCircle, MessageSquare, FileText, Activity, Users, Flag } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.enum(['general', 'sales', 'support', 'billing', 'abuse', 'press', 'other'], {
    required_error: 'Please select a subject',
  }),
  message: z.string().min(20, 'Message must be at least 20 characters').max(5000, 'Message too long'),
  honeypot: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

const subjects = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'sales', label: 'Sales & Pricing' },
  { value: 'support', label: 'Technical Support' },
  { value: 'billing', label: 'Billing & Payments' },
  { value: 'abuse', label: 'Abuse Report' },
  { value: 'press', label: 'Press & Media' },
  { value: 'other', label: 'Other' },
];

const contactInfo = [
  {
    icon: Mail,
    title: 'Email Us',
    items: [
      { label: 'General', value: 'hello@notixcloud.dev' },
      { label: 'Support', value: 'support@notixcloud.dev' },
      { label: 'Sales', value: 'sales@notixcloud.dev' },
      { label: 'Abuse', value: 'abuse@notixcloud.dev' },
    ],
  },
  {
    icon: MapPin,
    title: 'Location',
    items: [
      { label: 'Headquarters', value: 'San Francisco, CA, USA' },
      { label: 'European Office', value: 'Berlin, Germany' },
      { label: 'APAC Office', value: 'Singapore' },
    ],
  },
  {
    icon: Clock,
    title: 'Response Times',
    items: [
      { label: 'Sales Inquiries', value: 'Within 4 hours' },
      { label: 'Technical Support', value: 'Within 1 hour (business hours)' },
      { label: 'Billing Issues', value: 'Within 2 hours' },
      { label: 'Abuse Reports', value: 'Within 30 minutes' },
    ],
  },
];

export default function ContactForm() {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      subject: 'general',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    if (data.honeypot) {
      reset();
      setSubmitStatus('success');
      return;
    }

    setSubmitStatus('submitting');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit form');
      }

      setSubmitStatus('success');
      reset();
    } catch (err) {
      setSubmitStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="animate-in min-h-[60vh] flex items-center justify-center">
        <Container>
          <Card variant="elevated" className="max-w-md mx-auto text-center">
            <CardContent className="pt-8 pb-12 px-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-6">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Message Sent!</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Thank you for reaching out. We'll get back to you within our stated response times.
              </p>
              <Button onClick={() => setSubmitStatus('idle')}>Send Another Message</Button>
            </CardContent>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="animate-in">
      {/* Hero */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950" aria-labelledby="contact-hero-heading">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 id="contact-hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight mb-6">
              Get in Touch
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
              Have questions about our services? Need help with your account? Want to discuss a custom solution?
              We&apos;d love to hear from you.
            </p>
          </div>
        </Container>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 lg:py-28 bg-white dark:bg-slate-950" aria-labelledby="contact-form-heading">
        <Container>
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                <Card variant="bordered">
                  <CardContent className="pt-6 space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Contact Information</h3>
                    {contactInfo.map((section) => (
                      <div key={section.title}>
                        <h4 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white mb-3">
                          <section.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                          {section.title}
                        </h4>
                        <ul className="space-y-2" role="list">
                          {section.items.map((item) => (
                            <li key={item.label} className="flex justify-between text-sm">
                              <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
                              <span className="text-slate-900 dark:text-white font-medium truncate max-w-[120px] text-right">
                                {item.value}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card variant="outlined" className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
                  <CardContent className="pt-6 text-center">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Prefer Real-Time Chat?</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Join our Discord community for instant help from the team and other users.
                    </p>
                    <Button variant="outline" className="w-full" onClick={() => window.open('https://discord.gg/notixcloud', '_blank')}>
                      <MessageSquare className="h-4 w-4 mr-2" /> Join Discord
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle>Send Us a Message</CardTitle>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">We typically respond within a few hours during business hours.</p>
                </CardHeader>
                <CardContent className="pt-4">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        label="Full Name"
                        placeholder="John Doe"
                        error={errors.name?.message}
                        {...register('name')}
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="john@example.com"
                        error={errors.email?.message}
                        {...register('email')}
                      />
                    </div>

                    <Select
                      label="Subject"
                      placeholder="Select a topic"
                      options={subjects}
                      error={errors.subject?.message}
                      {...register('subject')}
                    />

                    <Textarea
                      label="Message"
                      placeholder="Describe your inquiry in detail..."
                      rows={6}
                      error={errors.message?.message}
                      {...register('message')}
                    />

                    {/* Honeypot */}
                    <input type="text" name="honeypot" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} {...register('honeypot')} />

                    {errorMessage && (
                      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3" role="alert">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
                      </div>
                    )}

                    <Button type="submit" className="w-full sm:w-auto" loading={submitStatus === 'submitting'} icon={<Send className="h-4 w-4" />}>
                      {submitStatus === 'submitting' ? 'Sending...' : 'Send Message'}
                    </Button>

                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                      By submitting this form, you agree to our <a href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">Privacy Policy</a> and <a href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">Terms of Service</a>.
                    </p>
                  </form>
                </CardContent>
              </Card>

              {/* Support Links */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: 'Technical Documentation', desc: 'API reference, guides, and tutorials', href: '/docs', icon: FileText },
                  { title: 'Service Status', desc: 'Real-time system status and incidents', href: '/status', icon: Activity },
                  { title: 'Community Forum', desc: 'Ask questions, share knowledge', href: '/community', icon: Users },
                  { title: 'Report Abuse', desc: 'Report spam, phishing, or abuse', href: '/abuse', icon: Flag },
                ].map((item) => (
                  <a key={item.title} href={item.href} className="group">
                    <Card variant="bordered" hover className="h-full">
                      <CardContent className="pt-6 flex items-start gap-4">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <item.icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}