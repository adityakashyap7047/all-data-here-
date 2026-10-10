'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Search, HelpCircle, CheckCircle, XCircle, Mail } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  tags: string[];
  viewCount: number;
  helpfulYes: number;
  helpfulNo: number;
}

interface FAQData {
  faqs: FAQ[];
  grouped: Record<string, FAQ[]>;
}

export default function FAQClient() {
  const [data, setData] = useState<FAQData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [votedItems, setVotedItems] = useState<Record<string, 'yes' | 'no'>>({});

  useEffect(() => {
    async function fetchFAQs() {
      try {
        const response = await fetch('/api/faqs');
        if (!response.ok) throw new Error('Failed to fetch FAQs');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError('Failed to load FAQs. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchFAQs();
  }, []);

  const filteredFAQs = data?.faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const groupedFAQs = filteredFAQs.reduce((acc, faq) => {
    const category = faq.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  const toggleOpen = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleVote = (id: string, vote: 'yes' | 'no') => {
    if (votedItems[id]) return;
    setVotedItems((prev) => ({ ...prev, [id]: vote }));
  };

  if (loading) {
    return (
      <div className="animate-in">
        <section className="py-20 lg:py-28 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-6">
                Frequently Asked Questions
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Find answers to common questions about NOTIXCLOUD services.
              </p>
            </div>
          </Container>
        </section>
        <section className="py-20" aria-labelledby="faq-loading">
          <Container>
            <div id="faq-loading" className="space-y-4 max-w-3xl mx-auto" aria-busy="true">
              {[...Array(6)].map((_, i) => (
                <Card key={i} variant="bordered">
                  <CardContent className="pt-6 space-y-3">
                    <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full animate-pulse" />
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2 animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-in">
        <section className="py-20 lg:py-28 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-6">
                Frequently Asked Questions
              </h1>
            </div>
          </Container>
        </section>
        <section className="py-20" aria-labelledby="faq-error">
          <Container>
            <div id="faq-error" className="text-center py-12 max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4">
                <HelpCircle className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Unable to Load FAQs</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </Container>
        </section>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="animate-in">
      {/* Hero */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950" aria-labelledby="faq-hero-heading">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="info" className="mb-4" dot>
              {data.faqs.length} Questions &middot; {Object.keys(data.grouped).length} Categories
            </Badge>
            <h1 id="faq-hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight mb-6">
              Frequently Asked{' '}
              <span className="text-indigo-600 dark:text-indigo-400">Questions</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
              Quick answers to common questions about our VPS hosting, Minecraft servers, billing, and more.
              Can&apos;t find what you&apos;re looking for? <a href="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Contact us</a>.
            </p>
            
            {/* Search */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  aria-label="Search FAQs"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ Categories */}
      <section className="py-20 lg:py-28 bg-white dark:bg-slate-950" aria-labelledby="faq-list-heading">
        <Container>
          {Object.entries(groupedFAQs).length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No results found</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Try adjusting your search or <a href="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline">contact support</a>.
              </p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>Clear Search</Button>
            </div>
          ) : (
            <>
              <div className="mb-12 flex flex-wrap gap-2 justify-center" role="tablist" aria-label="FAQ categories">
                {Object.keys(data.grouped).map((category) => (
                  <button
                    key={category}
                    role="tab"
                    onClick={() => {
                      setSearchQuery('');
                      const element = document.getElementById(`category-${category.toLowerCase().replace(/\s+/g, '-')}`);
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    {category} ({groupedFAQs[category].length})
                  </button>
                ))}
              </div>

              {Object.entries(groupedFAQs).map(([category, faqs]) => (
                <div key={category} id={`category-${category.toLowerCase().replace(/\s+/g, '-')}`}>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                    <HelpCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                    {category}
                  </h2>
                  <div className="space-y-4">
                    {faqs.map((faq) => (
                      <FAQItem key={faq.id} faq={faq} isOpen={openItems.has(faq.id)} onToggle={toggleOpen} voted={votedItems[faq.id]} onVote={handleVote} />
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </Container>
      </section>

      {/* Contact CTA */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900" aria-labelledby="faq-cta-heading">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="faq-cta-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Still Have Questions?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact">
                <Button size="lg" icon={<Mail className="h-4 w-4" />} iconPosition="left">
                  Contact Support
                </Button>
              </a>
              <a href="/status">
                <Button variant="outline" size="lg">
                  Check System Status
                </Button>
              </a>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

function FAQItem({ faq, isOpen, onToggle, voted, onVote }: { faq: FAQ; isOpen: boolean; onToggle: () => void; voted: 'yes' | 'no' | undefined; onVote: (id: string, vote: 'yes' | 'no') => void }) {
  return (
    <Card variant="bordered">
      <CardContent className="pt-0">
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-start justify-between gap-4 p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-xl"
          aria-expanded={isOpen}
          aria-controls={`faq-content-${faq.id}`}
        >
          <span className="text-lg font-medium text-slate-900 dark:text-white pr-8">{faq.question}</span>
          <ChevronDown className={cn('h-5 w-5 text-slate-400 flex-shrink-0 transition-transform', isOpen && 'rotate-180')} aria-hidden="true" />
        </button>
        <div id={`faq-content-${faq.id}`} role="region" aria-labelledby={`faq-${faq.id}`} className="overflow-hidden transition-all duration-300">
          <div className="px-6 pb-6 animate-in" style={{ maxHeight: isOpen ? '500px' : '0', opacity: isOpen ? 1 : 0 }}>
            <div className="prose-custom max-w-none">
              {faq.answer.split('\n').map((paragraph, i) => (
                <p key={i} className="whitespace-pre-wrap">{paragraph}</p>
              ))}
            </div>
            
            {faq.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2" aria-label="Tags">
                {faq.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center gap-4">
              <span className="text-sm text-slate-500 dark:text-slate-400">Was this helpful?</span>
              <button
                onClick={() => onVote(faq.id, 'yes')}
                disabled={!!voted}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  voted === 'yes'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
                aria-pressed={voted === 'yes'}
              >
                <CheckCircle className="h-4 w-4" aria-hidden="true" />
                Yes ({faq.helpfulYes + (voted === 'yes' ? 1 : 0)})
              </button>
              <button
                onClick={() => onVote(faq.id, 'no')}
                disabled={!!voted}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  voted === 'no'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
                aria-pressed={voted === 'no'}
              >
                <XCircle className="h-4 w-4" aria-hidden="true" />
                No ({faq.helpfulNo + (voted === 'no' ? 1 : 0)})
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { cn } from '@/lib/utils';