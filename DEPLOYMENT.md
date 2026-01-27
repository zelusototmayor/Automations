# Better Coaching - Production Deployment Guide

This guide covers deploying Better Coaching to production across all platforms.

## Architecture Overview

- **Backend API**: Node.js/Express with Prisma ORM (Port 3000)
- **Web App**: Next.js creator portal (Port 3001)
- **Mobile App**: React Native with Expo
- **Database**: PostgreSQL with pgvector extension

---

## Quick Start - Railway Deployment (Recommended)

Railway is the simplest option for deploying the full stack with PostgreSQL.

### 1. Prerequisites

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login
```

### 2. Create New Project

```bash
cd /path/to/bettercoaching
railway init
```

### 3. Add PostgreSQL Database

```bash
railway add --database postgres
```

Railway will automatically set `DATABASE_URL` environment variable.

### 4. Configure Environment Variables

In Railway dashboard, add these environment variables:

```bash
# Required
NODE_ENV=production
PORT=3000
JWT_SECRET=<generate with: openssl rand -hex 64>
JWT_REFRESH_SECRET=<generate with: openssl rand -hex 64>
ENCRYPTION_KEY=<generate with: openssl rand -hex 32>
CORS_ORIGIN=https://your-domain.com
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-proj-...

# Optional
GOOGLE_API_KEY=...
REVENUECAT_WEBHOOK_SECRET=...
```

### 5. Deploy Backend

```bash
cd backend
railway up
```

### 6. Run Database Migrations

```bash
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

### 7. Deploy Web App (Optional)

Create a new Railway service for the web app:

```bash
cd ../web
railway up
```

Add environment variable:
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
```

### 8. Get Your URLs

```bash
railway domain
```

---

## Alternative: Render Deployment

Render offers a generous free tier and simple PostgreSQL setup.

### Backend Setup

1. Create new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free or Starter ($7/month)

4. Add PostgreSQL database:
   - Go to Dashboard → New → PostgreSQL
   - Copy `Internal Database URL`
   - Add as `DATABASE_URL` environment variable

5. Add environment variables (same as Railway section above)

6. Deploy and run migrations via Render Shell:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

### Web App Setup

1. Create new **Static Site** on Render
2. Configure:
   - **Root Directory**: `web`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `.next`
3. Add environment variable:
   ```bash
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
   ```

---

## Docker Deployment (Self-Hosted)

For VPS deployment (DigitalOcean, AWS EC2, Linode, etc.)

### 1. Setup Production Environment

```bash
# Copy environment template
cp .env.production.example .env.production

# Edit with your production values
nano .env.production
```

### 2. Generate Secrets

```bash
# JWT secrets (64 characters)
openssl rand -hex 64

# Encryption key (32 characters)
openssl rand -hex 32
```

### 3. Deploy with Docker Compose

```bash
# Load environment variables
export $(cat .env.production | xargs)

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Run database migrations
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed
```

### 4. Configure Reverse Proxy (Nginx)

```nginx
# /etc/nginx/sites-available/bettercoaching
server {
    listen 80;
    server_name api.bettercoaching.app;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name bettercoaching.app www.bettercoaching.app;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/bettercoaching /etc/nginx/sites-enabled/
sudo certbot --nginx -d api.bettercoaching.app -d bettercoaching.app -d www.bettercoaching.app
sudo systemctl restart nginx
```

---

## Mobile App Deployment (Expo)

### Development Builds

For internal testing via Expo Go (current setup):

```bash
cd mobile

# Already working - just update API URL
echo "EXPO_PUBLIC_API_URL=https://api.your-domain.com/api" > .env

# Share via QR code
npx expo start
```

### Production Builds (App Stores)

When ready for App Store / Google Play:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

Update `mobile/app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://api.your-domain.com/api"
    }
  }
}
```

And in `mobile/src/config/api.ts`:
```typescript
import Constants from 'expo-constants';

export const API_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  'http://localhost:3003/api';
```

---

## Vercel Deployment (Web Only)

Best for Next.js web app, but backend needs separate hosting.

### Web App

```bash
cd web

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://your-backend-url.com/api

# Deploy to production
vercel --prod
```

### Backend

Deploy backend to Railway/Render (see above sections) since Vercel serverless isn't ideal for SSE streaming.

---

## Production Checklist

### Security

- [ ] All secrets regenerated (JWT_SECRET, JWT_REFRESH_SECRET, ENCRYPTION_KEY)
- [ ] API keys rotated to production keys
- [ ] CORS_ORIGIN set to specific domains (not "*")
- [ ] Database SSL enabled (sslmode=require)
- [ ] HTTPS enabled (SSL certificates)
- [ ] Rate limiting configured
- [ ] Helmet security headers enabled (already in code)
- [ ] Environment variables secured (not in version control)

### Database

- [ ] PostgreSQL 14+ with pgvector extension
- [ ] Automated backups enabled
- [ ] Connection pooling configured
- [ ] Migrations run successfully
- [ ] Seed data loaded (demo agents)

### Monitoring

- [ ] Health check endpoint accessible (/health)
- [ ] Error tracking setup (Sentry, LogRocket)
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Database query performance monitoring
- [ ] API key usage monitoring (Anthropic/OpenAI dashboards)

### API Keys

- [ ] Anthropic API key with spending limits
- [ ] OpenAI API key with spending limits
- [ ] Google AI API key (if using Gemini)
- [ ] RevenueCat configured for subscriptions

### Testing

- [ ] Test login with demo account
- [ ] Test creating new coach
- [ ] Test chat with AI coach
- [ ] Test subscription paywall
- [ ] Test free trial (5 messages)
- [ ] Test on mobile app (update EXPO_PUBLIC_API_URL)
- [ ] Test all API endpoints
- [ ] Load testing for expected traffic

---

## Deployment Scripts

### Quick Production Deploy (Railway)

```bash
#!/bin/bash
# deploy-railway.sh

echo "🚀 Deploying Better Coaching to Railway..."

# Generate secrets if not exists
if [ ! -f .env.production ]; then
    echo "📝 Generating production secrets..."
    cp .env.production.example .env.production

    JWT_SECRET=$(openssl rand -hex 64)
    JWT_REFRESH=$(openssl rand -hex 64)
    ENCRYPTION=$(openssl rand -hex 32)

    sed -i '' "s/your_production_jwt_secret_here_64_characters_minimum/$JWT_SECRET/" .env.production
    sed -i '' "s/your_production_refresh_secret_here_64_characters_minimum/$JWT_REFRESH/" .env.production
    sed -i '' "s/your_production_encryption_key_here_64_characters/$ENCRYPTION/" .env.production

    echo "⚠️  Please edit .env.production and add your API keys!"
    exit 1
fi

# Deploy backend
cd backend
railway up
cd ..

echo "✅ Deployment complete!"
echo "🔗 Get your URL with: railway domain"
echo "📊 View logs with: railway logs"
```

Make executable:
```bash
chmod +x deploy-railway.sh
./deploy-railway.sh
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL

# Check if pgvector extension is enabled
psql $DATABASE_URL -c "SELECT * FROM pg_extension WHERE extname = 'vector';"

# Enable if missing
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### Build Failures

```bash
# Clear build cache
rm -rf backend/dist backend/node_modules
rm -rf web/.next web/node_modules

# Rebuild
cd backend && npm install && npm run build
cd ../web && npm install && npm run build
```

### Prisma Migration Errors

```bash
# Reset database (⚠️ DESTROYS ALL DATA)
npx prisma migrate reset

# Or force push schema
npx prisma db push --force-reset
```

### API Key Errors

Check environment variables are loaded:
```bash
railway run env | grep API_KEY
```

---

## Cost Estimates

### Railway (Recommended)

- **Hobby Plan**: $5/month (500 hours execution, 512MB RAM)
- **PostgreSQL**: $5/month (1GB storage, 1GB RAM)
- **Total**: ~$10/month + AI API usage

### Render

- **Web Service**: $7/month (512MB RAM)
- **PostgreSQL**: $7/month (1GB storage)
- **Total**: ~$14/month + AI API usage

### Self-Hosted (DigitalOcean)

- **Droplet**: $12/month (2GB RAM, 50GB SSD)
- **Managed PostgreSQL**: $15/month (1GB RAM)
- **Total**: ~$27/month + AI API usage

### AI API Costs

Estimated for 1000 conversations/month:

- **Claude Sonnet 4.5**: ~$50-100/month
- **GPT-5 Mini**: ~$30-60/month
- **Total AI costs**: ~$80-160/month

---

## Support

- **Railway**: https://railway.app/help
- **Render**: https://render.com/docs
- **Prisma**: https://www.prisma.io/docs
- **Expo**: https://docs.expo.dev

## Security Issues

Report security vulnerabilities to: security@bettercoaching.app

---

**Last Updated**: January 2026
**Version**: 1.0.0
