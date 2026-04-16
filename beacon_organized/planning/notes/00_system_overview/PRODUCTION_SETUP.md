# Beacon Production Infrastructure Setup

## Overview

| Service | Provider | Purpose | Free Tier |
|---------|----------|---------|-----------|
| PostgreSQL + PostGIS | Supabase | Main database | 500MB, 2 projects |
| Redis | Upstash | Sessions, real-time, queues | 10K commands/day |
| API Hosting | Railway | beacon_api server | $5 credit/month |
| Web Admin | Vercel | beacon_admin Next.js | Unlimited |
| Mobile Builds | Expo EAS | iOS/Android builds | 30 builds/month |
| File Storage | Cloudflare R2 | Map tiles, media uploads | 10GB free |
| Push Notifications | Expo Push | Mobile notifications | Free |
| SMS Alerts | Twilio | Emergency SMS campaigns | Pay-as-you-go |
| Email | Resend | Transactional email | 3K emails/month |
| Domain/DNS | Cloudflare | DNS, SSL, CDN | Free |

---

## Step 1: Supabase (PostgreSQL + PostGIS)

### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up / Log in
3. "New Project" → Organization → "beacon-production"
4. **Database Password**: Generate strong password, SAVE IT
5. **Region**: Choose closest to primary users (e.g., `us-west-1` for California)
6. Click "Create new project" (takes ~2 minutes)

### Enable PostGIS
1. Go to **SQL Editor** in left sidebar
2. Run this SQL:
```sql
-- Enable PostGIS for spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Verify installation
SELECT PostGIS_Version();
```

### Get Connection String
1. Go to **Settings** → **Database**
2. Scroll to "Connection string" → "URI"
3. Copy the connection string, it looks like:
```
postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
```
4. Replace `[PASSWORD]` with your actual password

### Connection Pooling (Important for Production)
1. In **Settings** → **Database** → scroll to "Connection Pooling"
2. Copy the "Pooler" connection string (port 6543)
3. Use this for your app (handles many connections better)

```
# Direct connection (for migrations)
DATABASE_URL="postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres"

# Pooled connection (for app)
DATABASE_URL_POOLED="postgresql://postgres:PASSWORD@db.xxx.supabase.co:6543/postgres?pgbouncer=true"
```

---

## Step 2: Upstash (Redis)

### Create Database
1. Go to [upstash.com](https://upstash.com)
2. Sign up / Log in
3. "Create Database"
4. **Name**: `beacon-redis`
5. **Type**: Regional
6. **Region**: Same as Supabase (e.g., `us-west-1`)
7. Enable **TLS** (security)
8. Click "Create"

### Get Credentials
From the database dashboard, copy:
- **UPSTASH_REDIS_REST_URL**: `https://xxx.upstash.io`
- **UPSTASH_REDIS_REST_TOKEN**: `AXxx...`

Or use the Redis URL format:
- **REDIS_URL**: `rediss://default:xxx@xxx.upstash.io:6379`

Note: `rediss://` (with double s) means TLS-encrypted connection.

---

## Step 3: Railway (API Hosting)

### Create Project
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Connect your beacon_module repository
5. Select the `beacon_api` directory as root

### Configure Service
1. In project settings:
   - **Root Directory**: `/beacon_api`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

2. Add environment variables (Settings → Variables):
```
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://...  (from Supabase pooled)
REDIS_URL=rediss://...  (from Upstash)
JWT_SECRET=generate-a-64-char-random-string
JWT_REFRESH_SECRET=generate-another-64-char-random-string
CORS_ORIGINS=https://beacon-admin.vercel.app,https://your-domain.com
```

3. Generate domain: Settings → Networking → Generate Domain
   - You'll get: `beacon-api-production.up.railway.app`
   - Or add custom domain: `api.beacon-emergency.com`

---

## Step 4: Vercel (Admin Dashboard)

### Deploy beacon_admin
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. "Import Project" → Select your repo
4. **Root Directory**: `beacon_admin`
5. **Framework Preset**: Next.js (auto-detected)

### Environment Variables
Add in Vercel dashboard:
```
DATABASE_URL=postgresql://...  (Supabase pooled)
NEXTAUTH_SECRET=generate-a-64-char-random-string
NEXTAUTH_URL=https://beacon-admin.vercel.app
```

### Custom Domain (Optional)
- Settings → Domains → Add `admin.beacon-emergency.com`

---

## Step 5: Cloudflare R2 (File Storage)

### Create Bucket
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Sign up / Log in
3. R2 → "Create bucket"
4. **Name**: `beacon-storage`
5. **Location**: Auto or specific region

### Get Credentials
1. R2 → "Manage R2 API Tokens"
2. "Create API Token"
3. **Permissions**: Object Read & Write
4. **Bucket**: `beacon-storage`
5. Copy:
   - **Access Key ID**
   - **Secret Access Key**
   - **Endpoint**: `https://<account-id>.r2.cloudflarestorage.com`

### Create Folders Structure
```
beacon-storage/
├── map-tiles/          # Processed map tiles
├── datasets/           # Raw geodata uploads
├── media/              # User-uploaded photos/videos
│   ├── posts/
│   ├── tags/
│   └── profiles/
└── demos/              # Demo scenario assets
```

---

## Step 6: Expo EAS (Mobile Builds)

### Setup
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS for beacon_ems
cd beacon_ems
eas build:configure

# Configure EAS for beacon_public
cd ../beacon_public
eas build:configure
```

### Create eas.json (for each app)
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-store-connect-app-id"
      },
      "android": {
        "serviceAccountKeyPath": "./google-services.json"
      }
    }
  }
}
```

### Build Commands
```bash
# Development build (for testing)
eas build --platform all --profile development

# Preview build (TestFlight/Internal)
eas build --platform all --profile preview

# Production build (App Store/Play Store)
eas build --platform all --profile production
```

---

## Step 7: Twilio (SMS Alerts)

### Setup
1. Go to [twilio.com](https://www.twilio.com)
2. Sign up (get $15 free credit)
3. Get a phone number with SMS capability

### Get Credentials
From Console Dashboard:
- **Account SID**: `ACxxxxxxxxx`
- **Auth Token**: `xxxxxxxxx`
- **Phone Number**: `+1xxxxxxxxxx`

### Environment Variables
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

---

## Step 8: Resend (Email)

### Setup
1. Go to [resend.com](https://resend.com)
2. Sign up
3. Verify your domain (add DNS records)

### Get API Key
- API Keys → Create API Key
- Copy: `re_xxxxxxxxx`

### Environment Variables
```
RESEND_API_KEY=re_xxxxxxxxx
EMAIL_FROM=alerts@beacon-emergency.com
```

---

## Step 9: Domain & DNS (Cloudflare)

### Add Domain
1. Cloudflare Dashboard → "Add a Site"
2. Enter your domain: `beacon-emergency.com`
3. Select Free plan
4. Update nameservers at your registrar

### DNS Records
```
# API (Railway)
CNAME  api      beacon-api-production.up.railway.app

# Admin Dashboard (Vercel)
CNAME  admin    cname.vercel-dns.com

# Main website (if any)
A      @        your-server-ip
CNAME  www      your-domain.com
```

### SSL
- Cloudflare auto-provisions SSL certificates
- Enable "Full (strict)" SSL mode

---

## Complete Environment Variables

### beacon_api/.env.production
```bash
# Server
NODE_ENV=production
PORT=4000
API_URL=https://api.beacon-emergency.com

# Database (Supabase)
DATABASE_URL="postgresql://postgres:PASSWORD@db.xxx.supabase.co:6543/postgres?pgbouncer=true"

# Redis (Upstash)
REDIS_URL="rediss://default:xxx@xxx.upstash.io:6379"

# Auth
JWT_SECRET="your-64-char-secret-here"
JWT_REFRESH_SECRET="another-64-char-secret-here"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# CORS
CORS_ORIGINS="https://admin.beacon-emergency.com,https://beacon-emergency.com"

# Storage (Cloudflare R2)
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_BUCKET_NAME="beacon-storage"
R2_PUBLIC_URL="https://storage.beacon-emergency.com"

# SMS (Twilio)
TWILIO_ACCOUNT_SID="ACxxxxxxxxx"
TWILIO_AUTH_TOKEN="xxxxxxxxx"
TWILIO_PHONE_NUMBER="+1xxxxxxxxxx"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxx"
EMAIL_FROM="alerts@beacon-emergency.com"

# Push Notifications (Expo)
EXPO_ACCESS_TOKEN="your-expo-token"
```

### beacon_admin/.env.production
```bash
# Database
DATABASE_URL="postgresql://postgres:PASSWORD@db.xxx.supabase.co:6543/postgres?pgbouncer=true"

# NextAuth
NEXTAUTH_SECRET="your-64-char-secret-here"
NEXTAUTH_URL="https://admin.beacon-emergency.com"

# API
NEXT_PUBLIC_API_URL="https://api.beacon-emergency.com"
```

### beacon_ems & beacon_public (app.config.js)
```javascript
export default {
  expo: {
    // ... other config
    extra: {
      apiUrl: process.env.API_URL || "https://api.beacon-emergency.com",
      socketUrl: process.env.SOCKET_URL || "wss://api.beacon-emergency.com",
    },
  },
};
```

---

## Deployment Checklist

### Before First Deploy
- [ ] Supabase project created
- [ ] PostGIS extension enabled
- [ ] Upstash Redis database created
- [ ] All environment variables set in Railway
- [ ] All environment variables set in Vercel
- [ ] Domain DNS configured in Cloudflare
- [ ] SSL certificates active

### Database Setup
```bash
# Run from beacon_api directory
cd beacon_api

# Generate Prisma client
npx prisma generate

# Push schema to production database
npx prisma db push

# Seed initial data (optional, or create admin manually)
npx prisma db seed
```

### First Deploy
```bash
# Railway will auto-deploy on git push
git push origin main

# Or trigger manually
railway up
```

### Mobile App Builds
```bash
# Build for testing
cd beacon_ems
eas build --platform ios --profile preview

cd ../beacon_public
eas build --platform ios --profile preview
```

---

## Monitoring & Maintenance

### Supabase
- Dashboard shows query performance, storage usage
- Enable email alerts for errors
- Set up database backups (automatic on paid plans)

### Railway
- Built-in logging and metrics
- Set up health check endpoint: `GET /health`
- Configure auto-restart on crashes

### Upstash
- Dashboard shows request counts, latency
- Set up alerts for high usage

### Error Tracking (Recommended)
Add Sentry for error tracking:
```bash
npm install @sentry/node
```

---

## Cost Estimates (Monthly)

### Free Tier (Development/MVP)
| Service | Cost |
|---------|------|
| Supabase | $0 (500MB) |
| Upstash | $0 (10K/day) |
| Railway | $0-5 (hobby) |
| Vercel | $0 |
| Cloudflare R2 | $0 (10GB) |
| Expo EAS | $0 (30 builds) |
| **Total** | **$0-5/month** |

### Production (Scaling)
| Service | Cost |
|---------|------|
| Supabase Pro | $25/month |
| Upstash Pro | $10/month |
| Railway Pro | $20/month |
| Vercel Pro | $20/month |
| Cloudflare R2 | ~$5/month |
| Twilio | ~$20/month (usage) |
| **Total** | **~$100/month** |

### Enterprise (High Scale)
- Supabase Team: $599/month
- Dedicated Redis: $100+/month
- Multiple Railway instances: $100+/month
- Consider AWS/GCP for full control

---

## Security Checklist

- [ ] All secrets in environment variables, never in code
- [ ] Database password is strong (32+ chars)
- [ ] JWT secrets are unique and random
- [ ] CORS restricted to known domains
- [ ] Rate limiting enabled on API
- [ ] HTTPS enforced everywhere
- [ ] Remove dev-bypass auth endpoint before production
- [ ] Database connection uses SSL
- [ ] Redis connection uses TLS
- [ ] Regular security audits
- [ ] Penetration testing before public launch
