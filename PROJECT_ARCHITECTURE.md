# NOTIXCLOUD - Project Architecture

## Overview
Production-ready VPS hosting platform with public website, customer dashboard, admin dashboard, and full backend services.

---

## Directory Structure

```
notixcloud/
├── .github/
│   └── workflows/          # CI/CD pipelines
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
├── public/
│   ├── images/             # Static assets
│   └── favicon.ico
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── (public)/       # Public website routes
│   │   │   ├── page.tsx    # Landing page
│   │   │   ├── pricing/
│   │   │   ├── features/
│   │   │   ├── status/
│   │   │   ├── portfolio/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── layout.tsx
│   │   ├── (auth)/         # Auth routes
│   │   │   ├── api/auth/[...nextauth]/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/    # Customer dashboard
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── vps/
│   │   │   │   ├── billing/
│   │   │   │   ├── orders/
│   │   │   │   ├── tickets/
│   │   │   │   ├── notifications/
│   │   │   │   ├── settings/
│   │   │   │   └── layout.tsx
│   │   │   └── layout.tsx
│   │   ├── (admin)/        # Admin dashboard
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── users/
│   │   │   │   ├── vps/
│   │   │   │   ├── orders/
│   │   │   │   ├── billing/
│   │   │   │   ├── tickets/
│   │   │   │   ├── audit-logs/
│   │   │   │   ├── settings/
│   │   │   │   └── layout.tsx
│   │   │   └── layout.tsx
│   │   ├── api/            # API routes
│   │   │   ├── vps/
│   │   │   ├── billing/
│   │   │   ├── orders/
│   │   │   ├── tickets/
│   │   │   ├── notifications/
│   │   │   ├── admin/
│   │   │   └── webhooks/
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   ├── public/         # Public website components
│   │   ├── dashboard/      # Customer dashboard components
│   │   ├── admin/          # Admin dashboard components
│   │   └── shared/         # Shared components
│   ├── lib/
│   │   ├── auth.ts         # NextAuth configuration
│   │   ├── prisma.ts       # Prisma client
│   │   ├── utils.ts        # Utility functions
│   │   ├── validators.ts   # Zod schemas
│   │   ├── constants.ts    # App constants
│   │   ├── vps/            # VPS provisioning logic
│   │   ├── billing/        # Billing/payment logic
│   │   └── email/          # Email service
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript types
│   ├── styles/             # Additional styles
│   └── middleware.ts       # Next.js middleware
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── docker-compose.prod.yml
├── .env.example
├── .env.local
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
└── README.md
```

---

## Database Architecture (Prisma/PostgreSQL)

### Core Models

```prisma
// Users & Authentication
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  passwordHash  String?
  image         String?
  role          Role      @default(CUSTOMER)
  twoFactorEnabled Boolean @default(false)
  twoFactorSecret String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
  vpsInstances  VPSInstance[]
  orders        Order[]
  invoices      Invoice[]
  tickets       Ticket[]
  notifications Notification[]
  auditLogs     AuditLog[]
  apiKeys       ApiKey[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

// VPS Management
model VPSPlan {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?  @db.Text
  cpu         Int
  ram         Int      // GB
  storage     Int      // GB
  bandwidth   Int      // TB
  ipv4Count   Int      @default(1)
  ipv6Count   Int      @default(1)
  priceMonthly Decimal @db.Decimal(10, 2)
  priceYearly  Decimal? @db.Decimal(10, 2)
  features    String[]
  location    String
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  instances   VPSInstance[]
}

model VPSInstance {
  id              String      @id @default(cuid())
  userId          String
  planId          String
  hostname        String
  ipv4Address     String?     @unique
  ipv6Address     String?     @unique
  rootPassword    String      // Encrypted
  sshPort         Int         @default(22)
  status          VPSStatus   @default(PENDING)
  osTemplate      String
  controlPanel    String?     // Optional: cPanel, Plesk, etc.
  backupEnabled   Boolean     @default(false)
  monitoringEnabled Boolean   @default(true)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  expiresAt       DateTime
  suspendedAt     DateTime?
  suspendedReason String?
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan            VPSPlan     @relation(fields: [planId], references: [id])
  backups         VPSBackup[]
  metrics         VPSMetric[]
  actions         VPSAction[]
  @@index([userId])
  @@index([status])
}

enum VPSStatus {
  PENDING
  PROVISIONING
  RUNNING
  STOPPED
  SUSPENDED
  TERMINATED
  ERROR
}

model VPSBackup {
  id          String   @id @default(cuid())
  instanceId  String
  name        String
  size        BigInt   // Bytes
  status      BackupStatus @default(PENDING)
  filePath    String?
  createdAt   DateTime @default(now())
  completedAt DateTime?
  instance    VPSInstance @relation(fields: [instanceId], references: [id], onDelete: Cascade)
  @@index([instanceId])
}

enum BackupStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  FAILED
}

model VPSMetric {
  id          String   @id @default(cuid())
  instanceId  String
  cpuUsage    Float    // Percentage
  ramUsage    BigInt   // Bytes
  diskUsage   BigInt   // Bytes
  networkIn   BigInt   // Bytes
  networkOut  BigInt   // Bytes
  timestamp   DateTime @default(now())
  instance    VPSInstance @relation(fields: [instanceId], references: [id], onDelete: Cascade)
  @@index([instanceId, timestamp])
}

model VPSAction {
  id          String      @id @default(cuid())
  instanceId  String
  type        VPSActionType
  status      ActionStatus @default(PENDING)
  payload     Json?
  result      Json?
  error       String?
  startedAt   DateTime?
  completedAt DateTime?
  createdAt   DateTime    @default(now())
  instance    VPSInstance @relation(fields: [instanceId], references: [id], onDelete: Cascade)
  @@index([instanceId])
}

enum VPSActionType {
  START
  STOP
  REBOOT
  REINSTALL
  RESIZE
  BACKUP
  RESTORE
  CHANGE_PASSWORD
  CHANGE_HOSTNAME
  ENABLE_BACKUP
  DISABLE_BACKUP
}

enum ActionStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  FAILED
  CANCELLED
}

// Billing & Orders
model Order {
  id              String      @id @default(cuid())
  userId          String
  orderNumber     String      @unique
  status          OrderStatus @default(PENDING)
  subtotal        Decimal     @db.Decimal(10, 2)
  tax             Decimal     @db.Decimal(10, 2)
  total           Decimal     @db.Decimal(10, 2)
  currency        String      @default("USD")
  notes           String?     @db.Text
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  paidAt          DateTime?
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  items           OrderItem[]
  invoices        Invoice[]
  @@index([userId])
  @@index([status])
}

enum OrderStatus {
  PENDING
  PROCESSING
  COMPLETED
  CANCELLED
  REFUNDED
  FAILED
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  type        OrderItemType
  name        String
  description String?
  quantity    Int      @default(1)
  unitPrice   Decimal  @db.Decimal(10, 2)
  totalPrice  Decimal  @db.Decimal(10, 2)
  metadata    Json?    // Plan ID, VPS config, etc.
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  @@index([orderId])
}

enum OrderItemType {
  VPS_PLAN
  ADDON
  DOMAIN
  SSL_CERTIFICATE
  BACKUP_SERVICE
  MANAGED_SERVICE
}

model Invoice {
  id            String         @id @default(cuid())
  userId        String
  orderId       String?
  invoiceNumber String         @unique
  status        InvoiceStatus  @default(DRAFT)
  subtotal      Decimal        @db.Decimal(10, 2)
  tax           Decimal        @db.Decimal(10, 2)
  total         Decimal        @db.Decimal(10, 2)
  currency      String         @default("USD")
  dueDate       DateTime
  paidAt        DateTime?
  pdfUrl        String?
  stripeInvoiceId String?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  order         Order?         @relation(fields: [orderId], references: [id], onDelete: SetNull)
  payments      Payment[]
  @@index([userId])
  @@index([status])
}

enum InvoiceStatus {
  DRAFT
  SENT
  PAID
  OVERDUE
  CANCELLED
  REFUNDED
}

model Payment {
  id              String         @id @default(cuid())
  invoiceId       String
  amount          Decimal        @db.Decimal(10, 2)
  currency        String         @default("USD")
  method          PaymentMethod
  status          PaymentStatus  @default(PENDING)
  transactionId   String?        @unique
  provider        String         // stripe, paypal, crypto, bank
  providerData    Json?
  metadata        Json?
  createdAt       DateTime       @default(now())
  completedAt     DateTime?
  invoice         Invoice        @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  @@index([invoiceId])
  @@index([transactionId])
}

enum PaymentMethod {
  CREDIT_CARD
  PAYPAL
  CRYPTO
  BANK_TRANSFER
  BALANCE
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
  DISPUTED
}

// Support Tickets
model Ticket {
  id          String       @id @default(cuid())
  userId      String
  subject     String
  status      TicketStatus @default(OPEN)
  priority    TicketPriority @default(NORMAL)
  category    TicketCategory
  assignedTo  String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  closedAt    DateTime?
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages    TicketMessage[]
  @@index([userId])
  @@index([status])
  @@index([assignedTo])
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  WAITING_CUSTOMER
  WAITING_STAFF
  RESOLVED
  CLOSED
}

enum TicketPriority {
  LOW
  NORMAL
  HIGH
  URGENT
  CRITICAL
}

enum TicketCategory {
  GENERAL
  BILLING
  TECHNICAL
  VPS
  NETWORK
  SECURITY
  ABUSE
  SALES
  FEATURE_REQUEST
}

model TicketMessage {
  id        String   @id @default(cuid())
  ticketId  String
  userId    String
  message   String   @db.Text
  isStaff   Boolean  @default(false)
  attachments String[]
  createdAt DateTime @default(now())
  ticket    Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([ticketId])
}

// Notifications
model Notification {
  id        String             @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  message   String             @db.Text
  data      Json?
  read      Boolean            @default(false)
  readAt    DateTime?
  createdAt DateTime           @default(now())
  user      User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId, read])
  @@index([createdAt])
}

enum NotificationType {
  INFO
  SUCCESS
  WARNING
  ERROR
  VPS_STATUS
  BILLING
  TICKET
  SECURITY
  MAINTENANCE
  PROMOTIONAL
}

// Audit Logs
model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  action    String
  entity    String
  entityId  String?
  oldData   Json?
  newData   Json?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  @@index([userId])
  @@index([entity, entityId])
  @@index([createdAt])
}

// API Keys
model ApiKey {
  id          String   @id @default(cuid())
  userId      String
  name        String
  keyHash     String   @unique
  keyPrefix   String   // First 8 chars for identification
  permissions String[]
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
}

// System Settings
model Setting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     Json
  category  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## Authentication Architecture

### NextAuth.js Configuration

**Providers:**
- Credentials (email/password with bcrypt)
- OAuth: GitHub, Google, Discord
- API Key authentication for programmatic access

**Security Features:**
- Argon2id password hashing
- TOTP 2FA support (optional)
- Session management with JWT + database sessions
- Rate limiting on auth endpoints
- CSRF protection
- Secure cookie settings (HttpOnly, Secure, SameSite)

**Role-Based Access Control (RBAC):**
```
SUPER_ADMIN    -> Full system access
ADMIN          -> Admin dashboard, user management, billing
SUPPORT        -> Ticket management, user view
BILLING        -> Invoice/payment management
CUSTOMER       -> Own dashboard, VPS, billing, tickets
API            -> Programmatic access with scoped permissions
```

**Middleware Protection:**
- Public routes: `/`, `/pricing`, `/features`, `/login`, `/register`, `/status`
- Auth routes: `/dashboard/*` (CUSTOMER+)
- Admin routes: `/admin/*` (ADMIN+)
- API routes: Role-based per endpoint

---

## API Architecture

### RESTful Endpoints Structure

```
/api/v1/
├── auth/
│   ├── POST   /register
│   ├── POST   /login
│   ├── POST   /logout
│   ├── POST   /forgot-password
│   ├── POST   /reset-password
│   ├── POST   /verify-email
│   ├── POST   /resend-verification
│   ├── GET    /me
│   ├── PUT    /me
│   ├── PUT    /me/password
│   ├── POST   /2fa/enable
│   ├── POST   /2fa/disable
│   └── POST   /2fa/verify
├── vps/
│   ├── GET    /plans
│   ├── GET    /plans/:id
│   ├── GET    /instances
│   ├── POST   /instances
│   ├── GET    /instances/:id
│   ├── PUT    /instances/:id
│   ├── DELETE /instances/:id
│   ├── POST   /instances/:id/start
│   ├── POST   /instances/:id/stop
│   ├── POST   /instances/:id/reboot
│   ├── POST   /instances/:id/reinstall
│   ├── POST   /instances/:id/resize
│   ├── GET    /instances/:id/metrics
│   ├── GET    /instances/:id/backups
│   ├── POST   /instances/:id/backups
│   ├── POST   /instances/:id/backups/:backupId/restore
│   ├── DELETE /instances/:id/backups/:backupId
│   ├── GET    /instances/:id/actions
│   └── GET    /instances/:id/console
├── billing/
│   ├── GET    /invoices
│   ├── GET    /invoices/:id
│   ├── GET    /invoices/:id/pdf
│   ├── POST   /invoices/:id/pay
│   ├── GET    /payments
│   ├── GET    /payments/:id
│   ├── GET    /balance
│   ├── POST   /balance/topup
│   ├── GET    /payment-methods
│   ├── POST   /payment-methods
│   └── DELETE /payment-methods/:id
├── orders/
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /:id
│   └── POST   /:id/cancel
├── tickets/
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /:id
│   ├── PUT    /:id
│   ├── POST   /:id/messages
│   ├── PUT    /:id/status
│   ├── PUT    /:id/priority
│   └── PUT    /:id/assign
├── notifications/
│   ├── GET    /
│   ├── PUT    /:id/read
│   ├── PUT    /read-all
│   └── DELETE /:id
├── admin/
│   ├── GET    /stats
│   ├── GET    /users
│   ├── GET    /users/:id
│   ├── PUT    /users/:id
│   ├── DELETE /users/:id
│   ├── GET    /vps
│   ├── PUT    /vps/:id
│   ├── GET    /orders
│   ├── PUT    /orders/:id
│   ├── GET    /invoices
│   ├── PUT    /invoices/:id
│   ├── GET    /tickets
│   ├── PUT    /tickets/:id
│   ├── GET    /audit-logs
│   └── GET    /settings
└── webhooks/
    ├── POST   /stripe
    ├── POST   /paypal
    └── POST   /crypto
```

### API Standards
- JSON request/response
- Standardized error format: `{ error: { code, message, details } }`
- Pagination: `?page=1&limit=20` → `{ data, meta: { page, limit, total, totalPages } }`
- Filtering: `?status=running&location=nyc`
- Sorting: `?sort=createdAt&order=desc`
- Rate limiting: 100 req/min (authenticated), 20 req/min (public)

---

## Admin Architecture

### Admin Dashboard Sections

1. **Overview** - System stats, revenue, active VPS, tickets
2. **User Management** - List, search, view, edit, suspend, impersonate
3. **VPS Management** - All instances, provisioning queue, node status
4. **Order Management** - Orders, processing, fulfillment
5. **Billing** - Invoices, payments, refunds, revenue reports
6. **Support** - Ticket queue, assignment, SLA tracking
7. **Audit Logs** - Searchable system activity
8. **Settings** - Plans, pricing, email templates, system config

### Admin Permissions
- Role-based menu visibility
- Action-level permissions
- Audit trail for all admin actions

---

## Customer Architecture

### Customer Dashboard Sections

1. **Dashboard** - VPS summary, recent activity, quick actions
2. **VPS Instances** - List, create, manage (start/stop/reboot/console/backups)
3. **Billing** - Invoices, payment history, balance, payment methods
4. **Orders** - Order history, status tracking
5. **Support** - Ticket list, create ticket, view/respond
6. **Notifications** - Bell icon, notification center
7. **Settings** - Profile, security (2FA, password), API keys, preferences

---

## VPS Provisioning Architecture

### Real Infrastructure Integration (No Mocks)

**Provider Abstraction Layer:**
```typescript
interface VPSProvider {
  create(config: VPSConfig): Promise<VPSResult>
  start(id: string): Promise<void>
  stop(id: string, force?: boolean): Promise<void>
  reboot(id: string): Promise<void>
  reinstall(id: string, osTemplate: string): Promise<void>
  resize(id: string, plan: VPSPlan): Promise<void>
  getConsole(id: string): Promise<ConsoleUrl>
  getMetrics(id: string): Promise<VPSMetrics>
  delete(id: string): Promise<void>
  backup(id: string): Promise<BackupResult>
  restore(id: string, backupId: string): Promise<void>
}
```

**Supported Providers:**
- Hetzner Cloud API
- DigitalOcean API
- Vultr API
- AWS Lightsail/EC2
- Custom KVM/Proxmox via API

**Provisioning Flow:**
1. Order placed → Payment confirmed
2. Create VPSInstance record (PENDING)
3. Queue provisioning job (BullMQ/Redis)
4. Worker calls provider API
5. On success: Update instance (RUNNING), send credentials
6. On failure: Update instance (ERROR), notify admin, refund

**Monitoring:**
- Collectd/Telegraf on VPS → InfluxDB/VictoriaMetrics
- Metrics API for dashboard charts
- Alerting on CPU/RAM/Disk thresholds

---

## Payment Architecture

### Payment Flow

1. **Order Creation** → Pending invoice generated
2. **Payment Initiation** → Redirect to provider (Stripe/PayPal/Crypto)
3. **Webhook Handling** → Verify signature, update payment/invoice
4. **Fulfillment** → On payment success, trigger VPS provisioning
5. **Receipt** → Generate PDF invoice, email customer

### Supported Gateways
- **Stripe** - Cards, Apple Pay, Google Pay, SEPA, ACH
- **PayPal** - PayPal balance, cards via PayPal
- **Crypto** - Coinbase Commerce / NOWPayments (BTC, ETH, USDT, USDC)
- **Bank Transfer** - Manual verification for enterprise

### Security
- PCI DSS compliance via Stripe/PayPal (no card data stored)
- Webhook signature verification
- Idempotency keys for all payment operations
- Refund workflow with approval

---

## Security Architecture

### Application Security
- **Headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **Rate Limiting**: Per-IP and per-user (Redis-backed)
- **Input Validation**: Zod schemas on all API inputs
- **SQL Injection**: Prisma parameterized queries
- **XSS**: React auto-escaping, CSP
- **CSRF**: NextAuth.js built-in + SameSite cookies

### Infrastructure Security
- **Secrets**: Environment variables only, never in code
- **Database**: TLS connections, connection pooling
- **API Keys**: Hashed storage (bcrypt), prefix for identification
- **Passwords**: Argon2id with configurable work factor
- **2FA**: TOTP (RFC 6238), backup codes
- **Session**: Secure HttpOnly cookies, short expiry, rotation

### Audit & Compliance
- **Audit Logs**: All state-changing actions logged
- **Data Retention**: Configurable per entity type
- **GDPR**: Data export, deletion endpoints
- **Abuse Handling**: Automated suspension, manual review

---

## Deployment Architecture

### Docker Setup
```yaml
# docker-compose.yml (development)
services:
  app:
    build: .
    ports: ["3000:3000"]
    env_file: .env.local
    depends_on: [db, redis]
  
  db:
    image: postgres:16-alpine
    environment: POSTGRES_*
    volumes: [pgdata:/var/lib/postgresql/data]
    ports: ["5432:5432"]
  
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
  
  # Optional: mailhog, minio for local dev

# docker-compose.prod.yml
services:
  app:
    build: 
      context: .
      dockerfile: Dockerfile.prod
    deploy:
      replicas: 3
      resources:
        limits: { cpus: '1', memory: '1G' }
    environment: [NODE_ENV=production]
  
  db:
    image: postgres:16-alpine
    deploy:
      resources:
        limits: { cpus: '2', memory: '4G' }
    volumes: [pgdata:/var/lib/postgresql/data]
  
  redis:
    image: redis:7-alpine
    deploy:
      resources:
        limits: { cpus: '0.5', memory: '512M' }
  
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes: [./nginx.conf:/etc/nginx/nginx.conf, certs:/etc/letsencrypt]
```

### Environment Variables
```env
# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://notixcloud.com
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://notixcloud.com

# Database
DATABASE_URL=postgresql://user:pass@db:5432/notixcloud
DATABASE_POOL_SIZE=10

# Redis
REDIS_URL=redis://redis:6379

# Email
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="NotixCloud <noreply@notixcloud.com>"

# OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# PayPal
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=

# VPS Providers
HETZNER_API_TOKEN=
DIGITALOCEAN_API_TOKEN=
VULTR_API_TOKEN=

# Monitoring
SENTRY_DSN=
LOG_LEVEL=info
```

### CI/CD Pipeline
1. **Lint & Typecheck** - ESLint, TypeScript
2. **Test** - Unit (Vitest), Integration (Playwright)
3. **Build** - Next.js production build
4. **Docker Build** - Multi-stage, push to registry
5. **Deploy** - Zero-downtime to Kubernetes/ECS/VM
6. **Migrate** - Prisma migrate deploy
7. **Smoke Test** - Health checks

---

## Key Technical Decisions

| Area | Choice | Rationale |
|------|--------|-----------|
| Framework | Next.js 14 App Router | React Server Components, streaming, SEO |
| ORM | Prisma | Type-safe, migrations, relation API |
| Auth | NextAuth.js v5 | Battle-tested, multiple providers |
| UI | Tailwind + shadcn/ui | Customizable, accessible, no runtime |
| Validation | Zod | Schema-first, TypeScript inference |
| Queue | BullMQ/Redis | Reliable job processing |
| Email | Nodemailer + React Email | Template-based, previewable |
| Monitoring | Sentry + Vercel Analytics | Error tracking, performance |
| Logging | Pino | Structured JSON logs |

---

## Development Workflow

```bash
# Setup
pnpm install
cp .env.example .env.local
pnpm db:generate
pnpm db:push
pnpm dev

# Database
pnpm db:studio     # Prisma Studio
pnpm db:migrate    # Create migration
pnpm db:seed       # Seed development data

# Testing
pnpm test          # Unit tests
pnpm test:e2e      # E2E tests
pnpm test:coverage

# Code Quality
pnpm lint
pnpm typecheck
pnpm format

# Docker
docker compose up -d
docker compose logs -f app
```

---

## Future Extensibility

- **Marketplace**: Third-party applications/images
- **Kubernetes**: Managed K8s clusters
- **CDN**: Edge caching integration
- **DNS Management**: Zone management
- **Load Balancers**: Managed LB service
- **Object Storage**: S3-compatible API
- **Database as a Service**: Managed PostgreSQL/MySQL/Redis
- **Multi-region**: Geographic distribution
- **Reseller/White-label**: Agency support