# 🚀 Deployment Guide - PrimeTrade Frontend

Complete guide for deploying the PrimeTrade Frontend application to various platforms.

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Vercel Deployment](#vercel-deployment-recommended)
3. [AWS Deployment](#aws-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Traditional Server Deployment](#traditional-server-deployment)
6. [Database Deployment](#database-deployment)
7. [Post-Deployment Steps](#post-deployment-steps)

---

## 🔍 Pre-Deployment Checklist

Before deploying, ensure you have completed:

### Code & Configuration
- [ ] All features tested locally
- [ ] No console errors or warnings
- [ ] All tests passing (if you have tests)
- [ ] `.env.local` configured correctly
- [ ] Removed any debug/console.log statements
- [ ] Updated `README.md` with deployment URL

### Security
- [ ] Strong JWT_SECRET generated (64+ characters)
- [ ] Database uses dedicated user (not superuser)
- [ ] `.env.local` in `.gitignore`
- [ ] No hardcoded secrets in code
- [ ] Password validation enabled
- [ ] Rate limiting considered (optional)

### Database
- [ ] PostgreSQL database created
- [ ] Schema applied (`schema.sql`)
- [ ] Database backups configured
- [ ] Connection limits set appropriately
- [ ] SSL enabled for production database

### Performance
- [ ] Images optimized
- [ ] Unused dependencies removed
- [ ] Build completes without errors: `npm run build`

---

## 🎯 Vercel Deployment (Recommended)

Vercel is the easiest way to deploy Next.js applications.

### Step 1: Prepare Your Repository

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/primetrade-frontend.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: primetrade-frontend
# - Directory: ./primetrade_frontend
# - Override settings? No
```

**Option B: Using Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `primetrade_frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

### Step 3: Configure Environment Variables

In Vercel Dashboard:

1. Go to Project → Settings → Environment Variables
2. Add the following variables:

```
PGHOST = your-database-host.com
PGPORT = 5432
PGUSER = primetrade_prod
PGPASSWORD = your-secure-password
PGDATABASE = primetrade_production
JWT_SECRET = your-production-jwt-secret-64-characters-min
NODE_ENV = production
```

3. Select environments: **Production**, **Preview**, **Development**
4. Click "Save"

### Step 4: Deploy

```bash
# Deploy to production
vercel --prod
```

Your app will be live at: `https://primetrade-frontend.vercel.app`

### Step 5: Custom Domain (Optional)

1. Go to Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic)

---

## ☁️ AWS Deployment

### Architecture
- **Frontend:** AWS Amplify or EC2
- **Database:** AWS RDS (PostgreSQL)
- **Static Assets:** S3 + CloudFront

### Step 1: Setup RDS PostgreSQL

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier primetrade-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password YourStrongPassword \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxx \
  --db-name primetrade

# Wait for instance to be available (5-10 minutes)
aws rds wait db-instance-available --db-instance-identifier primetrade-db

# Get endpoint
aws rds describe-db-instances \
  --db-instance-identifier primetrade-db \
  --query 'DBInstances[0].Endpoint.Address'
```

### Step 2: Run Database Schema

```bash
# Connect to RDS and run schema
psql -h primetrade-db.xxxxx.us-east-1.rds.amazonaws.com \
     -U postgres \
     -d primetrade \
     -f db/schema.sql
```

### Step 3: Deploy with AWS Amplify

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure Amplify
amplify configure

# Initialize Amplify in project
cd primetrade_frontend
amplify init

# Add hosting
amplify add hosting

# Select: Hosting with Amplify Console (Managed hosting)

# Publish
amplify publish
```

### Step 4: Configure Environment Variables

In AWS Amplify Console:
1. Go to App Settings → Environment variables
2. Add all environment variables
3. Redeploy

---

## 🐳 Docker Deployment

### Step 1: Create Dockerfile

Create `Dockerfile` in `primetrade_frontend`:

```dockerfile
# Use Node.js 18 Alpine
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1

# Build application
RUN npm run build

# Production image, copy all files and run Next.js
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

# Start application
CMD ["node", "server.js"]
```

### Step 2: Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build:
      context: ./primetrade_frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - PGHOST=postgres
      - PGPORT=5432
      - PGUSER=postgres
      - PGPASSWORD=secure_password
      - PGDATABASE=primetrade
      - JWT_SECRET=docker_jwt_secret_min_64_chars_xxxxxxxxxxxxxxxxxx
      - NODE_ENV=production
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_PASSWORD=secure_password
      - POSTGRES_DB=primetrade
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./primetrade_frontend/db/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./primetrade_frontend/db/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  postgres_data:
```

### Step 3: Build and Run

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Step 4: Production Deployment

```bash
# Build for production
docker build -t primetrade-frontend:latest ./primetrade_frontend

# Tag for registry
docker tag primetrade-frontend:latest yourusername/primetrade-frontend:latest

# Push to Docker Hub
docker push yourusername/primetrade-frontend:latest

# Deploy to server
ssh user@your-server.com
docker pull yourusername/primetrade-frontend:latest
docker-compose up -d
```

---

## 🖥️ Traditional Server Deployment

For deployment on VPS (DigitalOcean, Linode, etc.)

### Step 1: Server Setup

```bash
# Connect to server
ssh user@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

### Step 2: Setup PostgreSQL

```bash
# Create database and user
sudo -u postgres psql

CREATE DATABASE primetrade;
CREATE USER primetrade_app WITH PASSWORD 'StrongPassword123';
GRANT ALL PRIVILEGES ON DATABASE primetrade TO primetrade_app;
\q

# Run schema
psql -U primetrade_app -d primetrade -f schema.sql
```

### Step 3: Deploy Application

```bash
# Clone repository
cd /var/www
git clone https://github.com/yourusername/primetrade-frontend.git
cd primetrade-frontend/primetrade_frontend

# Install dependencies
npm install

# Create .env.local
nano .env.local
# (Add environment variables)

# Build application
npm run build

# Start with PM2
pm2 start npm --name "primetrade" -- start
pm2 save
pm2 startup
```

### Step 4: Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/primetrade

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/primetrade /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🗄️ Database Deployment

### Managed Database Services (Recommended)

**Vercel Postgres**
```bash
# Install Vercel Postgres
npm install @vercel/postgres

# In Vercel Dashboard, add Vercel Postgres
# Automatically sets connection environment variables
```

**AWS RDS** (See AWS Deployment section)

**Google Cloud SQL**
```bash
# Create instance
gcloud sql instances create primetrade-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1

# Create database
gcloud sql databases create primetrade --instance=primetrade-db

# Set root password
gcloud sql users set-password postgres \
    --instance=primetrade-db \
    --password=YourStrongPassword
```

**Heroku Postgres**
```bash
heroku addons:create heroku-postgresql:mini
```

### Self-Hosted PostgreSQL

See [Traditional Server Deployment](#traditional-server-deployment)

---

## ✅ Post-Deployment Steps

### 1. Test Application

- [ ] Visit deployment URL
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Create/Read/Update/Delete tasks
- [ ] Test profile update
- [ ] Test logout
- [ ] Check mobile responsiveness
- [ ] Test in different browsers

### 2. Monitor Application

```bash
# View logs (Vercel)
vercel logs

# View logs (PM2)
pm2 logs primetrade

# View logs (Docker)
docker-compose logs -f
```

### 3. Setup Monitoring (Optional)

- **Vercel Analytics:** Enable in dashboard
- **Sentry:** Error tracking
- **LogRocket:** Session replay
- **Google Analytics:** User tracking

### 4. Setup Database Backups

**AWS RDS:**
- Automatic backups enabled by default
- Retention: 7-35 days

**Manual Backup:**
```bash
# Create backup
pg_dump -h your-db-host.com -U postgres -d primetrade > backup.sql

# Restore backup
psql -h your-db-host.com -U postgres -d primetrade < backup.sql
```

### 5. Update Documentation

- [ ] Add deployment URL to README
- [ ] Document any deployment-specific configurations
- [ ] Update API endpoint URLs if changed

---

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Database Connection Errors

```bash
# Test connection
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT NOW();"

# Check environment variables
env | grep PG
```

### 502 Bad Gateway (Nginx)

```bash
# Check if app is running
pm2 status

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## 📚 Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [AWS Amplify Docs](https://docs.amplify.aws/)
- [Docker Documentation](https://docs.docker.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/)

---

**Your application is now deployed! 🎉**

For scaling recommendations, see [SCALING.md](./SCALING.md).
