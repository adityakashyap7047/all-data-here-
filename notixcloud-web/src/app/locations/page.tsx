import { Metadata } from 'next';
import { Globe, Server, Shield, Zap, Wifi, MapPin, CheckCircle, ExternalLink, Download } from 'lucide-react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Global Locations',
  description: 'Deploy in 8+ global data centers worldwide. Low latency, 100Gbps connectivity, DDoS protection, and redundant power.',
};

const locations = [
  {
    name: 'New York',
    slug: 'new-york',
    displayName: 'New York, USA',
    country: 'United States',
    countryCode: 'US',
    region: 'NY',
    city: 'New York',
    flag: '🇺🇸',
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: 'America/New_York',
    isFeatured: true,
    networkInfo: { provider: 'Multiple', capacity: '100Gbps' },
    features: ['Low Latency to US East', 'Financial Hub Connectivity', 'DDoS Protection', 'IPv6 Ready'],
    plans: ['Starter', 'Standard', 'Professional', 'Enterprise'],
    testIp: 'lg.nyc.notixcloud.dev',
    testFile: 'https://lg.nyc.notixcloud.dev/100MB.test',
  },
  {
    name: 'Los Angeles',
    slug: 'los-angeles',
    displayName: 'Los Angeles, USA',
    country: 'United States',
    countryCode: 'US',
    region: 'CA',
    city: 'Los Angeles',
    flag: '🇺🇸',
    latitude: 34.0522,
    longitude: -118.2437,
    timezone: 'America/Los_Angeles',
    isFeatured: true,
    networkInfo: { provider: 'Multiple', capacity: '100Gbps' },
    features: ['Asia-Pacific Optimized', 'Media & Entertainment Hub', 'DDoS Protection', 'IPv6 Ready'],
    plans: ['Starter', 'Standard', 'Professional', 'Enterprise'],
    testIp: 'lg.lax.notixcloud.dev',
    testFile: 'https://lg.lax.notixcloud.dev/100MB.test',
  },
  {
    name: 'London',
    slug: 'london',
    displayName: 'London, UK',
    country: 'United Kingdom',
    countryCode: 'GB',
    region: 'ENG',
    city: 'London',
    flag: '🇬🇧',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
    isFeatured: true,
    networkInfo: { provider: 'Multiple', capacity: '100Gbps' },
    features: ['EU Optimized', 'GDPR Compliant', 'Financial Services Ready', 'DDoS Protection'],
    plans: ['Starter', 'Standard', 'Professional', 'Enterprise'],
    testIp: 'lg.lon.notixcloud.dev',
    testFile: 'https://lg.lon.notixcloud.dev/100MB.test',
  },
  {
    name: 'Frankfurt',
    slug: 'frankfurt',
    displayName: 'Frankfurt, Germany',
    country: 'Germany',
    countryCode: 'DE',
    region: 'HE',
    city: 'Frankfurt',
    flag: '🇩🇪',
    latitude: 50.1109,
    longitude: 8.6821,
    timezone: 'Europe/Berlin',
    isFeatured: true,
    networkInfo: { provider: 'Multiple', capacity: '100Gbps' },
    features: ['Central EU Hub', 'DE-CIX Connected', 'GDPR Compliant', 'Low Latency'],
    plans: ['Starter', 'Standard', 'Professional', 'Enterprise'],
    testIp: 'lg.fra.notixcloud.dev',
    testFile: 'https://lg.fra.notixcloud.dev/100MB.test',
  },
  {
    name: 'Singapore',
    slug: 'singapore',
    displayName: 'Singapore',
    country: 'Singapore',
    countryCode: 'SG',
    city: 'Singapore',
    flag: '🇸🇬',
    latitude: 1.3521,
    longitude: 103.8198,
    timezone: 'Asia/Singapore',
    isFeatured: true,
    networkInfo: { provider: 'Multiple', capacity: '100Gbps' },
    features: ['APAC Hub', 'Equinix SG1/3', 'Low Latency to SEA', 'DDoS Protection'],
    plans: ['Starter', 'Standard', 'Professional', 'Enterprise'],
    testIp: 'lg.sin.notixcloud.dev',
    testFile: 'https://lg.sin.notixcloud.dev/100MB.test',
  },
  {
    name: 'Tokyo',
    slug: 'tokyo',
    displayName: 'Tokyo, Japan',
    country: 'Japan',
    countryCode: 'JP',
    city: 'Tokyo',
    flag: '🇯🇵',
    latitude: 35.6762,
    longitude: 139.6503,
    timezone: 'Asia/Tokyo',
    isFeatured: false,
    networkInfo: { provider: 'Multiple', capacity: '100Gbps' },
    features: ['Japan Optimized', 'JPIX Connected', 'Low Latency', 'IPv6 Ready'],
    plans: ['Starter', 'Standard', 'Professional', 'Enterprise'],
    testIp: 'lg.tyo.notixcloud.dev',
    testFile: 'https://lg.tyo.notixcloud.dev/100MB.test',
  },
  {
    name: 'Sydney',
    slug: 'sydney',
    displayName: 'Sydney, Australia',
    country: 'Australia',
    countryCode: 'AU',
    region: 'NSW',
    city: 'Sydney',
    flag: '🇦🇺',
    latitude: -33.8688,
    longitude: 151.2093,
    timezone: 'Australia/Sydney',
    isFeatured: false,
    networkInfo: { provider: 'Multiple', capacity: '100Gbps' },
    features: ['Australia Optimized', 'PIPE Networks', 'Low Latency', 'DDoS Protection'],
    plans: ['Starter', 'Standard', 'Professional', 'Enterprise'],
    testIp: 'lg.syd.notixcloud.dev',
    testFile: 'https://lg.syd.notixcloud.dev/100MB.test',
  },
  {
    name: 'Toronto',
    slug: 'toronto',
    displayName: 'Toronto, Canada',
    country: 'Canada',
    countryCode: 'CA',
    region: 'ON',
    city: 'Toronto',
    flag: '🇨🇦',
    latitude: 43.6532,
    longitude: -79.3832,
    timezone: 'America/Toronto',
    isFeatured: false,
    networkInfo: { provider: 'Multiple', capacity: '100Gbps' },
    features: ['Canada Optimized', 'TORIX Connected', 'PIPEDA Compliant', 'DDoS Protection'],
    plans: ['Starter', 'Standard', 'Professional', 'Enterprise'],
    testIp: 'lg.yyz.notixcloud.dev',
    testFile: 'https://lg.yyz.notixcloud.dev/100MB.test',
  },
];

const globalFeatures = [
  {
    icon: Wifi,
    title: '100Gbps Network Capacity',
    description: 'Each location connects to multiple Tier-1 upstream providers with 100Gbps uplinks for premium routing.',
  },
  {
    icon: Shield,
    title: 'DDoS Protection Included',
    description: 'Automatic L3/L4/L7 DDoS mitigation at every location. No configuration required.',
  },
  {
    icon: Globe,
    title: 'Anycast IP Support',
    description: 'Optional Anycast IPs for global load balancing and automatic failover across locations.',
  },
  {
    icon: Zap,
    title: 'Private Networking',
    description: 'Secure VPC networks with VLAN isolation. Connect instances across locations privately.',
  },
  {
    icon: Server,
    title: 'NVMe Storage Everywhere',
    description: 'Enterprise NVMe SSDs in all locations. Consistent performance regardless of region.',
  },
  {
    icon: MapPin,
    title: 'Edge Locations Coming',
    description: 'Expanding to São Paulo, Mumbai, Johannesburg, and Dubai in 2024.',
  },
];

export default function LocationsPage() {
  return (
    <div className="animate-in">
      {/* Hero */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950" aria-labelledby="locations-hero-heading">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="info" className="mb-4" dot>
              8 Locations · 4 Continents · 100Gbps Network
            </Badge>
            <h1 id="locations-hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight mb-6">
              Global Infrastructure,{' '}
              <span className="text-indigo-600 dark:text-indigo-400">Local Performance</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
              Deploy your infrastructure close to your users. 8 data centers across 4 continents
              with premium networking, DDoS protection, and 99.9% uptime SLA.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/vps">
                <Button size="lg" icon={<ExternalLink className="h-4 w-4" />} iconPosition="right">
                  Deploy Now
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Custom Locations
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Locations Grid */}
      <section className="py-20 lg:py-28 bg-white dark:bg-slate-950" aria-labelledby="locations-list-heading">
        <Container>
          <div className="mb-12">
            <h2 id="locations-list-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Our Data Centers
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
              Each location is carefully selected for connectivity, redundancy, and compliance.
              Click a location to see network details and run latency tests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {locations.map((location) => (
              <LocationCard key={location.slug} location={location} />
            ))}
          </div>
        </Container>
      </section>

      {/* Global Features */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900" aria-labelledby="global-features-heading">
        <Container>
          <div className="text-center mb-16">
            <h2 id="global-features-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Global Network Features
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Every location includes enterprise-grade networking features at no extra cost.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {globalFeatures.map((feature) => (
              <Card key={feature.title} variant="bordered" hover>
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-4">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Network Testing */}
      <section className="py-20 lg:py-28 bg-white dark:bg-slate-950" aria-labelledby="network-test-heading">
        <Container>
          <div className="text-center mb-12">
            <h2 id="network-test-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Test Our Network
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
              Run your own latency and speed tests from our looking glass servers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {locations.map((location) => (
              <Card key={location.slug} variant="bordered" className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl mb-2">{location.flag}</div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{location.displayName}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-mono">{location.testIp}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <a
                      href={`http://${location.testIp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      Looking Glass
                    </a>
                    <a
                      href={location.testFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" aria-hidden="true" />
                      Speed Test
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28" aria-labelledby="locations-cta-heading">
        <Container>
          <Card variant="elevated" className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900">
            <div className="relative mx-auto max-w-3xl text-center py-12 lg:py-16 px-6">
              <h2 id="locations-cta-heading" className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Need a Custom Location?
              </h2>
              <p className="text-indigo-100 text-lg mb-8 max-w-xl mx-auto">
                We&apos;re expanding to São Paulo, Mumbai, Johannesburg, and Dubai. Contact us for early access or custom deployments.
              </p>
              <Link href="/contact">
                <Button size="xl" variant="secondary" icon={<ExternalLink className="h-5 w-5" />} iconPosition="right">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </Card>
        </Container>
      </section>
    </div>
  );
}

function LocationCard({ location }: { location: typeof locations[0] }) {
  return (
    <Card variant="bordered" className="relative overflow-hidden h-full flex flex-col">
      {location.isFeatured && (
        <div className="absolute top-4 right-4 z-10">
          <Badge variant="primary" size="sm">Featured</Badge>
        </div>
      )}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{location.flag}</span>
              {location.displayName}
            </CardTitle>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {location.features.map((feature) => (
            <Badge key={feature} variant="outline" size="sm">{feature}</Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pt-4">
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            <span>{location.city}, {location.region || location.country}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Globe className="h-4 w-4" aria-hidden="true" />
            <span>Timezone: {location.timezone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Wifi className="h-4 w-4" aria-hidden="true" />
            <span>Network: {location.networkInfo.capacity}</span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            Available Plans: <span className="text-slate-900 dark:text-white font-medium">{location.plans.join(', ')}</span>
          </p>
          <Link href={`/vps?location=${location.slug}`}>
            <Button variant="outline" className="w-full" size="sm">
              Deploy Here
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}