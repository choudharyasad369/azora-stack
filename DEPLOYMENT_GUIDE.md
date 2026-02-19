# 🚢 Azora Stack - Deployment Guide

Complete guide for deploying Azora Stack to production.

## Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Database backed up
- [ ] Environment variables prepared
- [ ] Domain name configured
- [ ] SSL certificate ready
- [ ] Payment gateways in live mode
- [ ] Email service configured
- [ ] Storage bucket ready

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides seamless Next.js deployment with zero configuration.

#### Step 1: Prepare Repository

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/azora-stack.git
git branch -M main
git push -u origin main
```

#### Step 2: Deploy on Vercel

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Select your repository
   - Click "Import"

3. **Configure Project**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Add Environment Variables**

Click "Environment Variables" and add all from `.env`:

**Required Variables:**
```
DATABASE_URL=
JWT_SECRET=
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
S3_ENDPOINT=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=
S3_REGION=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

**Optional Variables:**
```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your site will be live at `your-project.vercel.app`

#### Step 3: Configure Custom Domain

1. **Add Domain in Vercel**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Environment Variables**
   ```
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

3. **Redeploy**
   - Trigger a new deployment for changes to take effect

#### Step 4: Post-Deployment

1. **Run Database Migrations**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login
   vercel login

   # Link project
   vercel link

   # Run command
   vercel env pull .env.production
   npx prisma db push
   npx prisma db seed
   ```

2. **Test the Application**
   - Visit your domain
   - Test user registration
   - Test login
   - Test payment flow
   - Test email sending

3. **Monitor**
   - Check Vercel deployment logs
   - Monitor error rates
   - Check database connections

### Option 2: Custom Server (Advanced)

For deployment on your own VPS/server.

#### Requirements

- Ubuntu 20.04+ or similar
- Node.js 18+
- Nginx
- PM2
- PostgreSQL

#### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y
```

#### Step 2: Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE azora_stack;
CREATE USER azora_user WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE azora_stack TO azora_user;
\q
```

#### Step 3: Deploy Application

```bash
# Clone repository
git clone https://github.com/yourusername/azora-stack.git
cd azora-stack

# Install dependencies
npm install

# Create .env file
nano .env
# Add all environment variables

# Build application
npm run build

# Push database schema
npx prisma db push
npx prisma db seed

# Start with PM2
pm2 start npm --name "azora-stack" -- start
pm2 save
pm2 startup
```

#### Step 4: Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/azora-stack
```

Add configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/azora-stack /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Production Configuration

### 1. Environment Variables

**Critical Production Settings:**

```env
# Use strong, random secret
JWT_SECRET="generate-using-openssl-rand-hex-64"

# Production URLs
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Live Payment Credentials
RAZORPAY_KEY_ID="rzp_live_xxxxx"
RAZORPAY_KEY_SECRET="live_secret"

# Verified Email Domain
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# Production Database
DATABASE_URL="postgresql://..."
```

### 2. Security Hardening

**Change Default Admin Credentials:**
```bash
# After deployment, immediately:
# 1. Login as admin
# 2. Go to Profile Settings
# 3. Change password
# 4. Update email if needed
```

**Update Platform Settings:**
- Review commission rates
- Set proper listing fees
- Configure withdrawal limits
- Update support email

### 3. Payment Gateway Setup

**Razorpay Live Mode:**

1. Complete KYC verification
2. Generate live API keys
3. Update webhook URL:
   ```
   https://yourdomain.com/api/payments/webhook
   ```
4. Test with small transaction
5. Verify webhook delivery

**Stripe Live Mode (if using):**

1. Complete business verification
2. Generate live API keys
3. Update webhook endpoint
4. Test payment flow

### 4. Email Configuration

**Resend Production:**

1. Verify your domain:
   - Add DNS records
   - Wait for verification
   - Test email sending

2. Update templates:
   - Add proper branding
   - Include unsubscribe links
   - Test all email types

### 5. File Storage

**Production Bucket:**

1. Create production bucket
2. Configure CORS if needed
3. Set appropriate permissions
4. Test file upload/download
5. Configure backup policy

### 6. Monitoring

**Set up Sentry:**

```bash
# Install Sentry CLI
npm install -g @sentry/cli

# Configure
sentry-cli login

# Create release
npm run build
sentry-cli releases new <version>
sentry-cli releases files <version> upload-sourcemaps .next
sentry-cli releases finalize <version>
```

**Monitor:**
- Error rates
- API response times
- Database performance
- Payment success rate
- Email delivery rate

### 7. Backups

**Database Backup:**

```bash
# Automated daily backup
0 2 * * * pg_dump azora_stack > /backups/azora-$(date +\%Y\%m\%d).sql
```

**File Storage Backup:**
- Configure S3/R2 versioning
- Set up cross-region replication
- Regular backup verification

## Performance Optimization

### 1. Caching

- Enable Vercel Edge Caching
- Configure Redis for session storage
- Implement API response caching

### 2. CDN

- Use Vercel CDN (automatic)
- Or configure Cloudflare

### 3. Database

- Add indexes (already in schema)
- Enable connection pooling
- Monitor slow queries

### 4. Images

- Use Cloudinary transformations
- Implement lazy loading
- WebP format for thumbnails

## Monitoring & Maintenance

### Daily Checks

- [ ] Check error logs
- [ ] Monitor payment success rate
- [ ] Review pending withdrawals
- [ ] Check email delivery

### Weekly Tasks

- [ ] Review analytics
- [ ] Check disk space
- [ ] Update dependencies (security)
- [ ] Verify backups

### Monthly Tasks

- [ ] Review and update pricing
- [ ] Analyze user feedback
- [ ] Security audit
- [ ] Performance optimization

## Rollback Plan

If deployment fails:

1. **Vercel:**
   - Go to Deployments
   - Click on previous working deployment
   - Click "Promote to Production"

2. **Custom Server:**
   ```bash
   # Stop current version
   pm2 stop azora-stack

   # Revert to previous version
   git checkout <previous-commit>

   # Rebuild
   npm install
   npm run build

   # Restart
   pm2 restart azora-stack
   ```

## Troubleshooting

### Build Fails

**Issue:** Build fails on Vercel

**Solutions:**
- Check build logs for errors
- Verify all environment variables are set
- Test build locally: `npm run build`
- Check Node.js version compatibility

### Database Connection Issues

**Issue:** Cannot connect to database

**Solutions:**
- Verify DATABASE_URL is correct
- Check database is accessible from Vercel IP
- For Neon, ensure SSL mode is enabled
- Test connection using Prisma Studio

### Payment Issues

**Issue:** Payments failing

**Solutions:**
- Verify API keys are live mode
- Check webhook configuration
- Test with different amounts
- Review payment gateway logs
- Verify signature validation

### Email Not Sending

**Issue:** Emails not delivered

**Solutions:**
- Verify Resend API key
- Check domain verification
- Review email logs in Resend dashboard
- Test with different email providers
- Check spam folders

## Support

**Documentation:**
- README.md
- SETUP_GUIDE.md
- API_DOCS.md

**External Services:**
- Vercel: support.vercel.com
- Neon: neon.tech/docs
- Razorpay: razorpay.com/docs
- Resend: resend.com/docs

---

**Deployment Complete!** 🎉

Your Azora Stack application should now be live and running in production.
