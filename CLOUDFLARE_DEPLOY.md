# 🚀 Notixcloud — Cloudflare Deployment Guide

Deploy Notixcloud using **Cloudflare Tunnel** — zero open ports, free SSL, global CDN, and DDoS protection.

## Architecture

```
[Users] → [Cloudflare Edge (SSL, CDN, WAF, DDoS)] → [Cloudflare Tunnel] → [Your Server]
                                                                              ├── Next.js App (×2 replicas)
                                                                              ├── PostgreSQL 16
                                                                              └── Redis 7
```

> No ports 80/443 need to be open on your server. Cloudflare Tunnel creates an outbound-only encrypted connection.

---

## Prerequisites

- A **VPS server** (Hetzner, DigitalOcean, Contabo, AWS, etc.) with Docker & Docker Compose installed
- A **Cloudflare account** (free tier works)
- Your **domain** (e.g., `notixcloud.com`) added to Cloudflare (nameservers pointed to Cloudflare)

---

## Step-by-Step Setup

### 1. Add Your Domain to Cloudflare

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click **"Add a site"** → enter your domain (e.g., `notixcloud.com`)
3. Select the **Free plan**
4. Cloudflare will show you two nameservers (e.g., `adam.ns.cloudflare.com`)
5. Go to your domain registrar and **replace your current nameservers** with the Cloudflare ones
6. Wait for DNS propagation (usually 5–30 minutes)

### 2. Create a Cloudflare Tunnel

1. Go to **Cloudflare Dashboard → Zero Trust** (left sidebar)
2. Navigate to **Networks → Tunnels**
3. Click **"Create a tunnel"**
4. Choose **Cloudflared** connector
5. Name it `notixcloud-prod`
6. **Copy the Tunnel Token** — it looks like: `eyJhIjoiN2...very-long-string`
7. In the **Public Hostname** tab, add these routes:

| Subdomain | Domain          | Service              |
| --------- | --------------- | -------------------- |
| *(empty)* | notixcloud.com  | `http://app:3000`    |
| `www`     | notixcloud.com  | `http://app:3000`    |

> The service URL `http://app:3000` uses the Docker Compose service name `app`, which resolves internally inside the Docker network.

### 3. Configure Environment Variables

On your server, clone the repo and create the production env file:

```bash
git clone https://github.com/your-repo/notixcloud.git
cd notixcloud

# Copy the template
cp .env.production.example .env.production
```

Edit `.env.production` and fill in:

```bash
nano .env.production
```

**Critical values to set:**
```env
# Strong random passwords
DB_PASSWORD=<generate with: openssl rand -base64 24>
DATABASE_URL="postgresql://notixcloud:<your-db-password>@db:5432/notixcloud?schema=public"

# Generate auth secrets
AUTH_SECRET=<generate with: openssl rand -base64 32>
JWT_SECRET=<generate with: openssl rand -base64 32>

# Your domain
APP_URL="https://notixcloud.com"
AUTH_URL="https://notixcloud.com"

# The tunnel token from Step 2
CLOUDFLARE_TUNNEL_TOKEN=eyJhIjoiN2...your-token-here
```

### 4. Deploy

```bash
# Build and start everything
docker compose -f docker/docker-compose.cloudflare.yml --env-file .env.production up -d --build

# Run Prisma migrations
docker compose -f docker/docker-compose.cloudflare.yml exec app npx prisma migrate deploy

# Check all containers are running
docker compose -f docker/docker-compose.cloudflare.yml ps
```

You should see 4 containers running:
- `app` (×2 replicas)
- `db`
- `redis`
- `cloudflared`

### 5. Verify

1. Visit `https://notixcloud.com` — it should load with a valid Cloudflare SSL certificate
2. Check tunnel status in **Cloudflare Dashboard → Zero Trust → Tunnels** — should show "Healthy"

---

## Cloudflare Settings (Recommended)

### SSL/TLS
- Go to **SSL/TLS → Overview** → set to **Full**

### Speed
- **Speed → Optimization → Auto Minify** → Enable JS, CSS, HTML
- **Speed → Optimization → Brotli** → Enable

### Caching
- **Caching → Configuration → Browser Cache TTL** → 1 month
- Create a **Page Rule** for `notixcloud.com/_next/static/*` → Cache Level: Cache Everything, Edge TTL: 1 month

### Security
- **Security → WAF** → Enable managed rules
- **Security → Bots** → Enable Bot Fight Mode

---

## Common Commands

```bash
# View logs
docker compose -f docker/docker-compose.cloudflare.yml logs -f

# View specific service logs
docker compose -f docker/docker-compose.cloudflare.yml logs -f app
docker compose -f docker/docker-compose.cloudflare.yml logs -f cloudflared

# Restart after code changes
docker compose -f docker/docker-compose.cloudflare.yml up -d --build app

# Stop everything
docker compose -f docker/docker-compose.cloudflare.yml down

# Database backup
docker compose -f docker/docker-compose.cloudflare.yml exec db pg_dump -U notixcloud notixcloud > backup_$(date +%Y%m%d).sql
```

---

## Updating the App

```bash
cd notixcloud
git pull origin main
docker compose -f docker/docker-compose.cloudflare.yml up -d --build app
docker compose -f docker/docker-compose.cloudflare.yml exec app npx prisma migrate deploy
```

---

## Troubleshooting

| Issue | Fix |
| --- | --- |
| Tunnel shows "Inactive" | Check `CLOUDFLARE_TUNNEL_TOKEN` in `.env.production` |
| `502 Bad Gateway` | App container might still be starting. Check `docker logs` |
| Database connection refused | Ensure `db` service is healthy: `docker compose ps` |
| OAuth redirects to `localhost` | Set `AUTH_URL=https://notixcloud.com` in `.env.production` |
| Static assets not caching | Add the Cloudflare Page Rule for `/_next/static/*` |
