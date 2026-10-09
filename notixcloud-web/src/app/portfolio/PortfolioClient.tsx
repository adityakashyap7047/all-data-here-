'use client';

import { useState, useEffect } from 'react';
import { Metadata } from 'next';
import { GitBranch, ExternalLink, Star, CheckCircle, Tag, Globe, Smartphone, ShoppingCart, Cloud, Code, Server, Search, AlertCircle, Building } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Explore projects built on NOTIXCLOUD infrastructure. Discord bots, websites, dashboards, automation, IoT projects, and software solutions.',
};

const categoryColors: Record<string, string> = {
  'web-applications': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'mobile-apps': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'ecommerce': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'saas-platforms': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'api-integrations': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'devops-cloud': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
};

const categoryIcons: Record<string, React.ReactNode> = {
  'web-applications': <Globe className="h-5 w-5" />,
  'mobile-apps': <Smartphone className="h-5 w-5" />,
  'ecommerce': <ShoppingCart className="h-5 w-5" />,
  'saas-platforms': <Cloud className="h-5 w-5" />,
  'api-integrations': <Code className="h-5 w-5" />,
  'devops-cloud': <Server className="h-5 w-5" />,
};

interface PortfolioCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  projects: PortfolioProject[];
}

interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  featuredImage: string | null;
  technologies: string[];
  clientName: string | null;
  clientUrl: string | null;
  projectUrl: string | null;
  githubUrl: string | null;
  isFeatured: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  } | null;
}

interface PortfolioData {
  categories: PortfolioCategory[];
  featuredProjects: PortfolioProject[];
}

export default function PortfolioClient() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const response = await fetch('/api/portfolio');
        if (!response.ok) throw new Error('Failed to fetch portfolio');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError('Failed to load portfolio. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPortfolio();
  }, []);

  if (loading) {
    return (
      <div className="animate-in">
        <section className="py-20 lg:py-28 bg-gradient-to-b from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-6">
                Built by{' '}
                <span className="text-indigo-600 dark:text-indigo-400">NOTIX</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Explore projects built on NOTIXCLOUD infrastructure.
              </p>
            </div>
          </Container>
        </section>
        <section className="py-20" aria-labelledby="portfolio-loading">
          <Container>
            <div id="portfolio-loading" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-live="polite">
              {[...Array(6)].map((_, i) => (
                <Card key={i} variant="bordered">
                  <CardContent className="pt-6 space-y-4">
                    <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                    <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2 animate-pulse" />
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-full w-20 animate-pulse" />
                      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-full w-20 animate-pulse" />
                    </div>
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
        <section className="py-20 lg:py-28 bg-gradient-to-b from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-6">
                Built by{' '}
                <span className="text-indigo-600 dark:text-indigo-400">NOTIX</span>
              </h1>
            </div>
          </Container>
        </section>
        <section className="py-20" aria-labelledby="portfolio-error">
          <Container>
            <div id="portfolio-error" className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Unable to Load Portfolio</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </Container>
        </section>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const allProjects = data.categories.flatMap((cat) => cat.projects);
  const filteredProjects = activeCategory
    ? allProjects.filter((p) => p.category?.slug === activeCategory)
    : allProjects;

  return (
    <div className="animate-in">
      {/* Hero */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950" aria-labelledby="portfolio-hero-heading">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="info" className="mb-4" dot>
              {allProjects.length} Projects &middot; {data.categories.length} Categories
            </Badge>
            <h1 id="portfolio-hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight mb-6">
              Built by{' '}
              <span className="text-indigo-600 dark:text-indigo-400">NOTIX</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
              A showcase of projects built and hosted on NOTIXCLOUD infrastructure.
              From Discord bots to enterprise SaaS platforms.
            </p>
          </div>
        </Container>
      </section>

      {/* Featured Projects */}
      {data.featuredProjects.length > 0 && (
        <section className="py-20 lg:py-28 bg-white dark:bg-slate-950" aria-labelledby="featured-heading">
          <Container>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12">
              <div>
                <h2 id="featured-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                  Featured Projects
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Hand-picked projects showcasing the power of NOTIXCLOUD.
                </p>
              </div>
</div>
          </Container>
          </section>
      )}

      {/* Categories Filter */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900" aria-labelledby="categories-heading">
        <Container>
          <div className="mb-12">
            <h2 id="categories-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Browse by Category
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
              Filter projects by type. Each category represents a different domain of expertise.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mb-12 justify-center" role="tablist" aria-label="Project categories">
            <button
              role="tab"
              aria-selected={!activeCategory}
              aria-controls="projects-panel"
              onClick={() => setActiveCategory(null)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                !activeCategory
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              )}
            >
              All Projects
            </button>
            {data.categories.map((category) => (
              <button
                key={category.slug}
                role="tab"
                aria-selected={activeCategory === category.slug}
                aria-controls="projects-panel"
                onClick={() => setActiveCategory(category.slug)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                  activeCategory === category.slug
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : `bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ${categoryColors[category.slug] || 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`
                )}
              >
                {categoryIcons[category.slug] || <Tag className="h-4 w-4" />}
                {category.name}
                <span className={cn('px-1.5 py-0.5 rounded-full text-xs', activeCategory === category.slug ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700')}>
                  {category.projects.length}
                </span>
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          <div id="projects-panel" role="tabpanel" aria-label={activeCategory ? `Projects in ${data.categories.find(c => c.slug === activeCategory)?.name}` : 'All projects'}>
            {filteredProjects.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  No projects found
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {activeCategory
                    ? `No projects in "${data.categories.find(c => c.slug === activeCategory)?.name}" category.`
                    : 'No projects available at the moment.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Stats */}
      <section className="py-20 lg:py-28 bg-white dark:bg-slate-950" aria-labelledby="stats-heading">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: data.featuredProjects.length, label: 'Featured Projects', icon: Star },
              { value: allProjects.length, label: 'Total Projects', icon: Globe },
              { value: data.categories.length, label: 'Categories', icon: Tag },
              { value: allProjects.filter(p => p.githubUrl).length, label: 'Open Source', icon: GitBranch },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mx-auto mb-4">
                  <stat.icon className="h-7 w-7" aria-hidden="true" />
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                <div className="text-slate-600 dark:text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28" aria-labelledby="portfolio-cta-heading">
        <Container>
          <Card variant="elevated" className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900">
            <div className="relative mx-auto max-w-3xl text-center py-12 lg:py-16 px-6">
              <h2 id="portfolio-cta-heading" className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Want Your Project Featured?
              </h2>
              <p className="text-indigo-100 text-lg mb-8 max-w-xl mx-auto">
                Built something awesome on NOTIXCLOUD? We&apos;d love to showcase it.
                Submit your project for consideration.
              </p>
              <Link href="/contact">
                <Button size="xl" variant="secondary" icon={<ExternalLink className="h-5 w-5" />} iconPosition="right">
                  Submit Project
                </Button>
              </Link>
            </div>
          </Card>
        </Container>
      </section>
    </div>
  );
}

function ProjectCard({ project }: { project: PortfolioProject }) {
  return (
    <Card variant="bordered" hover className="flex flex-col h-full">
      {project.featuredImage && (
        <div className="relative h-40 -mx-6 -mt-6 mb-4 rounded-t-xl overflow-hidden">
          <img
            src={project.featuredImage}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {project.isFeatured && (
            <div className="absolute top-3 right-3">
              <Badge variant="warning" size="sm">Featured</Badge>
            </div>
          )}
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-lg">{project.title}</CardTitle>
          {project.category && (
            <Badge
              variant="outline"
              size="sm"
              className={cn(categoryColors[project.category.slug] || 'text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700')}
            >
              {project.category.name}
            </Badge>
          )}
        </div>
        {project.shortDescription && (
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
            {project.shortDescription}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pt-3">
        {project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4" role="list" aria-label="Technologies used">
            {project.technologies.slice(0, 5).map((tech) => (
              <span key={tech} className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                {tech}
              </span>
            ))}
            {project.technologies.length > 5 && (
              <span className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded">
                +{project.technologies.length - 5} more
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
          {project.projectUrl && (
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              View Project
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label={`View ${project.title} on GitHub`}
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              Code
            </a>
          )}
          {project.clientUrl && (
            <a
              href={project.clientUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label={`Visit ${project.clientName}&apos;s website`}
            >
              <Building className="h-4 w-4" aria-hidden="true" />
              Client
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectCard({ project }: { project: PortfolioProject }) {
  return (
    <Card variant="bordered" hover className="flex flex-col h-full">
      {project.featuredImage && (
        <div className="relative h-40 -mx-6 -mt-6 mb-4 rounded-t-xl overflow-hidden">
          <img
            src={project.featuredImage}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {project.isFeatured && (
            <div className="absolute top-3 right-3">
              <Badge variant="warning" size="sm">Featured</Badge>
            </div>
          )}
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-lg">{project.title}</CardTitle>
          {project.category && (
            <Badge
              variant="outline"
              size="sm"
              className={cn(categoryColors[project.category.slug] || 'text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700')}
            >
              {project.category.name}
            </Badge>
          )}
        </div>
        {project.shortDescription && (
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
            {project.shortDescription}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pt-3">
        {project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4" role="list" aria-label="Technologies used">
            {project.technologies.slice(0, 5).map((tech) => (
              <span key={tech} className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                {tech}
              </span>
            ))}
            {project.technologies.length > 5 && (
              <span className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded">
                +{project.technologies.length - 5} more
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
          {project.projectUrl && (
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              View Project
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label={`View ${project.title} on GitHub`}
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              Code
            </a>
          )}
          {project.clientUrl && (
            <a
              href={project.clientUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label={`Visit ${project.clientName}&apos;s website`}
            >
              <Building className="h-4 w-4" aria-hidden="true" />
              Client
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import { cn } from '@/lib/utils';
