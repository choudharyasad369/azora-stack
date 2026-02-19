# 🚀 Azora Stack - Complete Setup Guide

This guide will help you set up and run Azora Stack from scratch.

## Prerequisites Checklist

Before you begin, make sure you have:

- [ ] Node.js 18+ installed ([Download](https://nodejs.org/))
- [ ] Git installed
- [ ] A code editor (VS Code recommended)
- [ ] Terminal/Command Prompt access

## Step 1: Project Setup

### 1.1 Install Dependencies

```bash
cd azora-stack
npm install
```

This will install all required packages including Next.js, Prisma, React, and other dependencies.

## Step 2: Database Setup

### Option A: Using Neon (Recommended - Free PostgreSQL)

1. **Create Neon Account**
   - Go to [neon.tech](https://neon.tech)
   - Sign up for a free account
   - Create a new project

2. **Get Connection String**
   - In your Neon dashboard, find the connection string
   - It looks like: `postgresql://username:password@ep-xxx.region.aws.neon.tech/database?sslmode=require`

3. **Add to .env**
   ```env
   DATABASE_URL="your-neon-connection-string-here"
   ```

### Option B: Using Local PostgreSQL

1. **Install PostgreSQL**
   - Download from [postgresql.org](https://www.postgresql.org/download/)
   - Install and remember your password

2. **Create Database**
   ```sql
   CREATE DATABASE azora_stack;
   ```

3. **Add to .env**
   ```env
   DATABASE_URL="postgresql://postgres:your-password@localhost:5432/azora_stack"
   ```

## Step 3: External Services Setup

### 3.1 Razorpay (Indian Payments)

1. **Create Account**
   - Go to [razorpay.com](https://razorpay.com)
   - Sign up and complete KYC

2. **Get API Keys**
   - Go to Settings → API Keys
   - Generate Test Mode keys for development

3. **Add to .env**
   ```env
   RAZORPAY_KEY_ID="rzp_test_xxxxx"
   RAZORPAY_KEY_SECRET="your_secret_key"
   NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_xxxxx"
   ```

### 3.2 Cloudflare R2 (File Storage)

1. **Create Cloudflare Account**
   - Go to [cloudflare.com](https://www.cloudflare.com)
   - Navigate to R2

2. **Create Bucket**
   - Create a new R2 bucket named "azora-stack"
   - Get API credentials

3. **Add to .env**
   ```env
   S3_ENDPOINT="https://xxxxx.r2.cloudflarestorage.com"
   S3_ACCESS_KEY_ID="your_access_key"
   S3_SECRET_ACCESS_KEY="your_secret_key"
   S3_BUCKET_NAME="azora-stack"
   S3_REGION="auto"
   ```

### 3.3 Cloudinary (Images)

1. **Create Account**
   - Go to [cloudinary.com](https://cloudinary.com)
   - Sign up for free account

2. **Get Credentials**
   - From dashboard, note your Cloud Name, API Key, API Secret

3. **Add to .env**
   ```env
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
   ```

### 3.4 Resend (Email Service)

1. **Create Account**
   - Go to [resend.com](https://resend.com)
   - Sign up for free (100 emails/day)

2. **Get API Key**
   - Go to API Keys section
   - Create a new API key

3. **Add to .env**
   ```env
   RESEND_API_KEY="re_xxxxx"
   RESEND_FROM_EMAIL="noreply@yourdomain.com"
   ```

   Note: In development, you can use any email. For production, verify your domain.

### 3.5 Stripe (Optional - Global Payments)

1. **Create Account**
   - Go to [stripe.com](https://stripe.com)
   - Sign up

2. **Get API Keys**
   - Use Test Mode for development
   - Get Publishable and Secret keys

3. **Add to .env**
   ```env
   STRIPE_SECRET_KEY="sk_test_xxxxx"
   STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxx"
   ```

## Step 4: Environment Variables

### 4.1 Copy Example File

```bash
cp .env.example .env
```

### 4.2 Complete All Variables

Your `.env` file should have:

```env
# Database (Required)
DATABASE_URL="postgresql://..."

# JWT (Required)
JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters-long"

# App (Required)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Razorpay (Required)
RAZORPAY_KEY_ID="rzp_test_xxxxx"
RAZORPAY_KEY_SECRET="xxxxx"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_xxxxx"

# Storage (Required)
S3_ENDPOINT="https://xxxxx.r2.cloudflarestorage.com"
S3_ACCESS_KEY_ID="xxxxx"
S3_SECRET_ACCESS_KEY="xxxxx"
S3_BUCKET_NAME="azora-stack"
S3_REGION="auto"

# Cloudinary (Required)
CLOUDINARY_CLOUD_NAME="xxxxx"
CLOUDINARY_API_KEY="xxxxx"
CLOUDINARY_API_SECRET="xxxxx"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="xxxxx"

# Resend (Required)
RESEND_API_KEY="re_xxxxx"
RESEND_FROM_EMAIL="noreply@localhost"

# Admin (Required)
ADMIN_EMAIL="admin@azorastack.com"
ADMIN_PASSWORD="YourStrongPassword123!"

# Stripe (Optional)
STRIPE_SECRET_KEY="sk_test_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxx"

# Sentry (Optional)
NEXT_PUBLIC_SENTRY_DSN=""
```

## Step 5: Database Initialization

### 5.1 Generate Prisma Client

```bash
npm run prisma:generate
```

This generates the TypeScript types for your database.

### 5.2 Push Schema to Database

```bash
npm run prisma:push
```

This creates all the tables in your database.

### 5.3 Seed Database

```bash
npm run prisma:seed
```

This creates:
- Default platform settings
- Admin user
- Demo seller and buyer accounts

**Important:** Note the credentials displayed. Default admin login:
- Email: `admin@azorastack.com`
- Password: `Admin@123456` (change this!)

## Step 6: Run the Application

### 6.1 Start Development Server

```bash
npm run dev
```

### 6.2 Access the Application

Open your browser and go to:
- **Frontend**: http://localhost:3000
- **Database Studio**: Run `npm run prisma:studio` then open http://localhost:5555

## Step 7: Test the Setup

### 7.1 Login as Admin

1. Go to http://localhost:3000/login
2. Use admin credentials from seed output
3. You should see the admin dashboard

### 7.2 Check Database

```bash
npm run prisma:studio
```

Browse your database tables and verify data was seeded correctly.

### 7.3 Test API Endpoints

Try accessing:
- http://localhost:3000/api/projects (should return empty array or projects)

## Common Issues & Solutions

### Issue: "Cannot connect to database"

**Solution:**
- Check DATABASE_URL is correct
- Verify database is running
- Check network/firewall settings
- For Neon, ensure connection string includes `?sslmode=require`

### Issue: "Prisma Client not generated"

**Solution:**
```bash
npm run prisma:generate
npm run prisma:push
```

### Issue: "Module not found"

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Kill process on port 3000
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port:
PORT=3001 npm run dev
```

### Issue: "JWT Secret Error"

**Solution:**
- Ensure JWT_SECRET in .env is at least 32 characters
- No spaces or special characters in secret
- Restart dev server after changing .env

## Next Steps

### For Development

1. **Explore the Code**
   - Check `app/` for pages and API routes
   - Review `services/` for business logic
   - See `components/` for UI components

2. **Customize**
   - Update branding in `app/page.tsx`
   - Modify email templates in `services/email.service.ts`
   - Adjust platform settings in database

3. **Add Features**
   - Create new API routes in `app/api/`
   - Add new pages in `app/`
   - Extend Prisma schema as needed

### For Production

1. **Security**
   - Change all default passwords
   - Generate strong JWT_SECRET
   - Enable HTTPS
   - Configure CORS properly

2. **Services**
   - Switch Razorpay/Stripe to live mode
   - Verify email domain with Resend
   - Configure production S3/R2 bucket
   - Set up Sentry for error tracking

3. **Deploy**
   - Push to GitHub
   - Deploy on Vercel
   - Configure environment variables
   - Test payment flows thoroughly

## Support & Resources

- **Documentation**: README.md
- **Database Schema**: prisma/schema.prisma
- **API Routes**: app/api/
- **Components**: components/

## Development Tips

1. **Use TypeScript**: Take advantage of type safety
2. **Follow Structure**: Keep code organized in appropriate directories
3. **Test Locally**: Always test changes locally before deploying
4. **Use Prisma Studio**: Great for inspecting database during development
5. **Check Logs**: Monitor console for errors and warnings

## Quick Commands Reference

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm start                  # Start production server

# Database
npm run prisma:generate    # Generate Prisma client
npm run prisma:push        # Push schema to database
npm run prisma:studio      # Open database GUI
npm run prisma:seed        # Seed database

# Other
npm run lint               # Run linter
```

## Success Checklist

- [ ] All dependencies installed
- [ ] Database connected and seeded
- [ ] All external services configured
- [ ] Environment variables set
- [ ] Development server running
- [ ] Can login as admin
- [ ] Prisma Studio accessible
- [ ] No console errors

Congratulations! 🎉 Your Azora Stack development environment is ready!

---

**Need Help?**
- Check the README.md for more details
- Review error messages carefully
- Ensure all environment variables are correct
- Try restarting the development server
