import { Prisma } from '@prisma/client';

export type VPSPlanWithLocations = Prisma.VPSPlanGetPayload<{
  include: {
    locations: {
      include: {
        location: true;
      };
    };
  };
}>;

export type ServerLocationWithPlans = Prisma.ServerLocationGetPayload<{
  include: {
    plans: {
      include: {
        plan: true;
      };
    };
  };
}>;

export type PortfolioProjectWithCategory = Prisma.PortfolioProjectGetPayload<{
  include: {
    category: true;
  };
}>;

export type PortfolioCategoryWithProjects = Prisma.PortfolioCategoryGetPayload<{
  include: {
    projects: true;
  };
}>;

export type FAQ = Prisma.FAQGetPayload<Record<string, never>>;

export type StatusServiceWithIncidents = Prisma.StatusServiceGetPayload<{
  include: {
    incidents: true;
  };
}>;

export type Testimonial = Prisma.TestimonialGetPayload<Record<string, never>>;

export type Announcement = Prisma.AnnouncementGetPayload<Record<string, never>>;

export interface VPSPlanDisplay {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  cpuCores: number;
  ramGb: number;
  storageGb: number;
  storageType: string;
  bandwidthTb: number;
  ipv4Addresses: number;
  ipv6Addresses: number;
  monthlyPriceCents: number;
  quarterlyPriceCents: number | null;
  semiAnnualPriceCents: number | null;
  annualPriceCents: number | null;
  biennialPriceCents: number | null;
  triennialPriceCents: number | null;
  setupFeeCents: number;
  currency: string;
  features: string[];
  limitations: string | null;
  isPopular: boolean;
  status: string;
  locations: Array<{
    id: string;
    name: string;
    slug: string;
    displayName: string;
    available: boolean;
    stock: number | null;
    customPriceCents: number | null;
  }>;
}

export interface MinecraftPlan {
  id: string;
  name: string;
  description: string;
  ramGb: number;
  cpuCores: number;
  storageGb: number;
  playerSlots: number;
  monthlyPriceCents: number;
  features: string[];
  isPopular: boolean;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}