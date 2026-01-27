# Better Coaching - Kamal Deployment Guide

Deploy Better Coaching to your DigitalOcean droplet using Kamal (same setup as your other projects).

## Prerequisites

- Kamal installed: `gem install kamal`
- Docker Hub account (zelusottomayor)
- Docker Hub access token
- DigitalOcean droplet with Traefik configured
- Domain purchased in GoDaddy

---

## Step 1: Configure Deployment

### Update config/deploy.yml

Replace these placeholders:
1. `DROPLET_IP_HERE` → Your droplet IP (e.g., 143.110.169.251)
2. `YOUR_DOMAIN_HERE` → Your GoDaddy domain (e.g., bettercoaching.app)

```bash
# Quick sed replacement (or edit manually)
sed -i '' 's/DROPLET_IP_HERE/143.110.169.251/g' config/deploy.yml
sed -i '' 's/YOUR_DOMAIN_HERE/bettercoaching.app/g' config/deploy.yml
```

### Update .kamal/secrets

Edit `.kamal/secrets` and set:
- `KAMAL_REGISTRY_PASSWORD` → Your Docker Hub token

The secrets file will auto-generate secure passwords for:
- JWT_SECRET (64 chars)
- JWT_REFRESH_SECRET (64 chars)
- ENCRYPTION_KEY (32 chars)
- POSTGRES_PASSWORD (32 chars)

---

## Step 2: DNS Configuration (GoDaddy)

Add these DNS records in GoDaddy:

```
Type: A
Name: @
Value: YOUR_DROPLET_IP
TTL: 600

Type: A
Name: www
Value: YOUR_DROPLET_IP
TTL: 600
```

Wait 5-10 minutes for DNS propagation.

---

## Step 3: Initial Deployment

### Setup Kamal on Server

```bash
# First time only - setup Kamal infrastructure
kamal setup
```

This will:
1. Install Docker on droplet (if needed)
2. Set up Traefik reverse proxy
3. Create PostgreSQL container
4. Build and push Docker image
5. Deploy the application
6. Run database migrations
7. Configure SSL with Let's Encrypt

**Wait about 2-3 minutes for setup to complete.**

---

## Step 4: Database Setup

```bash
# Run Prisma migrations
kamal app exec -i "npx prisma migrate deploy"

# Seed demo data
kamal app exec -i "npm run db:seed"
```

---

## Step 5: Verify Deployment

```bash
# Check if app is running
kamal app details

# View logs
kamal app logs

# Test health endpoint
curl https://bettercoaching.app/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2026-01-27T...",
  "database": "connected"
}
```

---

## Step 6: Update Mobile App

```bash
cd mobile
echo "EXPO_PUBLIC_API_URL=https://bettercoaching.app/api" > .env
npx expo start
```

Test the mobile app - it should connect to production!

---

## Future Deployments (After Code Changes)

```bash
# Just run deploy command
kamal deploy

# Kamal will:
# 1. Build new Docker image
# 2. Push to Docker Hub
# 3. Pull on server
# 4. Zero-downtime swap (old → new)
# 5. Health check before completing
```

---

## Useful Commands

```bash
# View logs (live tail)
kamal app logs -f

# SSH into container
kamal app exec -i "bash"

# Run Rails/Node console
kamal app exec -i "node"

# Run database migrations
kamal app exec -i "npx prisma migrate deploy"

# Restart app
kamal app restart

# Stop app
kamal app stop

# Remove everything (⚠️ dangerous)
kamal remove
```

---

## Database Access

```bash
# Connect to PostgreSQL container
kamal accessory exec db -i "psql -U bettercoaching -d bettercoaching_production"

# Backup database
kamal accessory exec db "pg_dump -U bettercoaching bettercoaching_production" > backup-$(date +%Y%m%d).sql

# Restore database
cat backup.sql | kamal accessory exec db -i "psql -U bettercoaching -d bettercoaching_production"
```

---

## Architecture

```
┌─────────────────────────────────────────────┐
│  DigitalOcean Droplet (143.110.169.251)    │
│                                             │
│  ┌─────────────────────────────────────┐  │
│  │  Traefik (Reverse Proxy)            │  │
│  │  - SSL/TLS (Let's Encrypt)          │  │
│  │  - Domain routing                   │  │
│  └─────────────────────────────────────┘  │
│                    │                        │
│  ┌─────────────────┴─────────────────┐    │
│  │  Better Coaching API              │    │
│  │  Container: bettercoaching        │    │
│  │  Port: 3000                       │    │
│  │  Health: /health                  │    │
│  └───────────────────────────────────┘    │
│                    │                        │
│  ┌─────────────────┴─────────────────┐    │
│  │  PostgreSQL                       │    │
│  │  Container: bettercoaching-db     │    │
│  │  Port: 5432                       │    │
│  │  Extension: pgvector              │    │
│  └───────────────────────────────────┘    │
│                                             │
│  Other Apps:                                │
│  - zelusottomayor.com (port 4000)          │
│  - leads.zelusottomayor.com (port 8000)    │
└─────────────────────────────────────────────┘
```

---

## Traefik Configuration

If Traefik isn't set up yet on your droplet, Kamal will do it automatically during `kamal setup`.

Traefik handles:
- SSL certificate generation (Let's Encrypt)
- Automatic certificate renewal
- Multiple domains on same droplet
- HTTP → HTTPS redirect

---

## Cost Breakdown

### DigitalOcean Droplet (Shared with other apps)
- **Current**: Already paid for
- **Additional Cost**: $0 (shared resources)

### Docker Hub
- **Free Plan**: Unlimited public repositories
- **Cost**: $0

### Domain (GoDaddy)
- **Cost**: ~$12/year (.app domain)

### AI API Usage
- **Claude Sonnet 4.5**: ~$50-100/month (1000+ conversations)
- **GPT-5 Mini**: ~$30-60/month

**Total New Cost**: ~$12/year domain + AI usage

---

## Troubleshooting

### Deployment Fails

```bash
# Check Kamal can connect to server
kamal server check

# Check Docker is running
kamal server exec "docker ps"

# Rebuild image locally
cd backend
docker build -t zelusottomayor/bettercoaching .
docker push zelusottomayor/bettercoaching
```

### Database Connection Error

```bash
# Check PostgreSQL is running
kamal accessory details db

# Restart database
kamal accessory restart db

# Check connection from app
kamal app exec -i "npx prisma db push"
```

### SSL Certificate Issues

```bash
# Check Traefik logs
kamal traefik logs

# Reboot Traefik
kamal traefik reboot
```

### Health Check Failing

```bash
# Test locally first
curl http://YOUR_DROPLET_IP:3000/health

# Check if port is exposed
kamal app exec "netstat -tlnp | grep 3000"
```

---

## Security Notes

- `.kamal/secrets` is in `.gitignore` - never commit it
- Secrets are generated automatically with `openssl rand`
- SSL certificates auto-renew via Let's Encrypt
- All traffic encrypted (HTTPS only)
- Rate limiting already configured in backend code

---

## Monitoring

### Basic Monitoring

```bash
# Watch logs
kamal app logs -f

# Check resource usage
kamal server exec "docker stats"

# Check disk space
kamal server exec "df -h"
```

### External Monitoring (Optional)

Consider adding:
- **UptimeRobot**: Free uptime monitoring
- **Sentry**: Error tracking (sentry.io)
- **DigitalOcean Monitoring**: Built-in droplet metrics

---

## Deployment Checklist

- [ ] Update `config/deploy.yml` with droplet IP and domain
- [ ] Update `.kamal/secrets` with Docker Hub token
- [ ] Configure DNS in GoDaddy (A records)
- [ ] Run `kamal setup` (first time only)
- [ ] Run `kamal app exec -i "npx prisma migrate deploy"`
- [ ] Run `kamal app exec -i "npm run db:seed"`
- [ ] Test: `curl https://your-domain.com/health`
- [ ] Update mobile app `.env` with production URL
- [ ] Test mobile app with production backend
- [ ] Set up monitoring alerts
- [ ] Configure API key spending limits

---

**Ready to deploy?**

1. Update `config/deploy.yml` with your droplet IP and domain
2. Run `kamal setup`
3. Done! ✅

**Questions?** Check your other projects (signal-harvester, portfolio) for reference.
