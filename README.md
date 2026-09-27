# NOTIXCLOUD

> Powerful Infrastructure. Built for Your Projects.

Production-ready VPS hosting platform with public website, customer dashboard, admin dashboard, and full backend services.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js v5
- **State Management**: TanStack Query + Zustand
- **Email**: Nodemailer + React Email
- **Queue**: BullMQ + Redis
- **Testing**: Vitest + Playwright
- **Deployment**: Docker + Docker Compose

## Features

### Public Website
- Landing page with hero, features, pricing
- Status page with real-time uptime
- Portfolio showcase
- Responsive design with dark theme

### Authentication
- Email/password with secure bcrypt hashing
- OAuth: GitHub, Google, Discord
- Email verification
- Password reset flow
- Two-factor authentication (TOTP)
- Role-based access control (RBAC)

### Customer Dashboard
- VPS management (start, stop, reboot, reinstall, console, backups)
- Billing & invoices
- Order history
- Support tickets
- Notifications
- Profile & security settings
- API keys

### Admin Dashboard
- System overview & statistics
- User management
- VPS management & provisioning
- Order & billing management
- Support ticket queue
- Audit logs
- System settings

### VPS Provisioning
- Multi-provider support (Hetzner, DigitalOcean, Vultr, AWS)
- Automated provisioning via job queue
- Real-time metrics collection
- Backup & restore
- OS reinstallation
- Plan resizing

### Billing & Payments
- Stripe integration (cards, Apple Pay, Google Pay, SEPA, ACH)
- PayPal integration
- Crypto payments (Coinbase Commerce / NOWPayments)
- Invoice generation (PDF)
- Balance system
- Refund workflow

### Security
- Argon2id password hashing
- Secure session management
- CSRF protection
- Rate limiting (per IP & per user)
- Audit logging
- GDPR compliance (data export, deletion)

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- pnpm (recommended)

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/notixcloud.git
cd notixcloud

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Configure your environment variables in .env.local
# Required: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

# Setup database
pnpm db:generate
pnpm db:push
pnpm db:seed

# Start development server
pnpm dev
```

### Docker Development

```bash
# Start all services
cd docker
docker compose up -d

# View logs
docker compose logs -f app

# Stop services
docker compose down
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth (min 32 chars) | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `SMTP_HOST` | SMTP server host | No |
| `SMTP_PORT` | SMTP server port | No |
| `SMTP_USER` | SMTP username | No |
| `SMTP_PASS` | SMTP password | No |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | No |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | No |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |
| `DISCORD_CLIENT_ID` | Discord OAuth client ID | No |
| `DISCORD_CLIENT_SECRET` | Discord OAuth client secret | No |
| `STRIPE_SECRET_KEY` | Stripe secret key | No |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | No |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | No |
| `HETZNER_API_TOKEN` | Hetzner Cloud API token | No |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | No |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token | No |

## Project Structure

```
notixcloud/
├── .github/workflows/     # CI/CD pipelines
├── docker/                # Docker configuration
├── prisma/                # Database schema & migrations
├── public/                # Static assets
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── (public)/      # Public website routes
│   │   ├── (auth)/        # Authentication routes
│   │   ├── (dashboard)/   # Customer dashboard
│   │   ├── (admin)/       # Admin dashboard
│   │   └── api/           # API routes
│   ├── components/        # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── public/        # Public components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── admin/         # Admin components
│   │   └── shared/        # Shared components
│   ├── lib/               # Core utilities
│   │   ├── auth/          # Authentication config
│   │   ├── vps/           # VPS provisioning
│   │   ├── billing/       # Billing logic
│   │   └── email/         # Email templates
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript types
│   └── middleware.ts      # Route protection
└── package.json
```

## Database Schema

Key models:
- **User** - Authentication, roles, profile
- **VPSPlan** - Server plans & pricing
- **VPSInstance** - Customer VPS instances
- **VPSBackup** - VPS backups
- **VPSMetric** - Real-time metrics
- **Order** - Customer orders
- **Invoice** - Billing invoices
- **Payment** - Payment records
- **Ticket** - Support tickets
- **Notification** - User notifications
- **AuditLog** - Security audit trail
- **ApiKey** - API access keys

## API Endpoints

```
/api/v1/
├── auth/           # Authentication
├── vps/            # VPS management
├── billing/        # Invoices, payments
├── orders/         # Order management
├── tickets/        # Support tickets
├── notifications/  # User notifications
├── admin/          # Admin operations
└── webhooks/       # Payment webhooks
```

## Role-Based Access Control

| Role | Permissions |
|------|-------------|
| SUPER_ADMIN | Full system access |
| ADMIN | Users, VPS, orders, billing, tickets, settings |
| SUPPORT | Users (read), VPS (read), tickets |
| BILLING | Users (read), orders, billing, invoices, payments |
| CUSTOMER | Own resources only |
| API | Programmatic VPS access |

## Development

```bash
# Run tests
pnpm test           # Unit tests
pnpm test:e2e       # E2E tests

# Code quality
pnpm lint           # ESLint
pnpm typecheck      # TypeScript
pnpm format         # Prettier

# Database
pnpm db:studio      # Prisma Studio
pnpm db:migrate     # Create migration
pnpm db:seed        # Seed development data
```

## Deployment

### Production Docker

```bash
cd docker
docker compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

1. Build: `pnpm build`
2. Run migrations: `pnpm db:migrate:deploy`
3. Start: `pnpm start`

## Security Checklist

- [ ] Use strong `NEXTAUTH_SECRET` (32+ chars)
- [ ] Configure HTTPS in production
- [ ] Set secure cookie settings
- [ ] Enable rate limiting (Redis required)
- [ ] Configure CSP headers
- [ ] Set up monitoring (Sentry)
- [ ] Regular security updates
- [ ] Database backups
- [ ] Audit log retention

## License

Proprietary - All rights reserved.

## Support

For support, email support@notixcloud.com or create a ticket in the dashboard.