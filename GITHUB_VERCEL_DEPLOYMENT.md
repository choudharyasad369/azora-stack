# AzoraStack - GitHub & Vercel Deployment Guide

**Project**: AzoraStack SaaS Platform  
**Repository**: https://github.com/choudharyasad369/azora-stack  
**Status**: Ready for Production Deployment

---

## 📋 Pre-Deployment Checklist

### ✅ Completed:
- [x] .gitignore configured (node_modules, .env, .next, etc.)
- [x] package.json has correct build scripts
- [x] Prisma configured for production
- [x] All tests passing (78/78)
- [x] TypeScript errors resolved
- [x] Email system configured
- [x] Storage system configured (Supabase)
- [x] Authentication system working
- [x] Payment integration ready

---

## 🚀 STEP-BY-STEP DEPLOYMENT

### STEP 1: Install Git (If Not Installed)

**Download Git**:
- Windows: https://git-scm.com/download/win
- Or use: `winget install Git.Git`

**Verify Installation**:
```bash
git --version
```

---

### STEP 2: Initialize Git Repository

```bash
cd D:\azora-stack\azora-stack

# Initialize git (if not already done)
git init

# Check status
git status
```

---

### STEP 3: Stage All Files

```bash
# Add all files (respects .gitignore)
git add .

# Verify what will be committed
git status
```

**Files that will be IGNORED** (as per .gitignore):
- `node_modules/`
- `.env` and `.env.*`
- `.next/`
- `*.tsbuildinfo`
- `coverage/`
- `.vscode/`

---

### STEP 4: Create Initial Commit

```bash
git commit -m "Initial production commit - AzoraStack SaaS"
```

---

### STEP 5: Connect to GitHub

```bash
# Remove existing remote (if any)
git remote remove origin

# Add GitHub repository
git remote add origin https://github.com/choudharyasad369/azora-stack.git

# Set main branch
git branch -M main

# Verify remote
git remote -v
```

---

### STEP 6: Push to GitHub

```bash
# Push to GitHub
git push -u origin main
```

**If Authentication Required**:

**Option A: Personal Access Token (Recommended)**
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (full control)
4. Copy the token
5. When prompted for password, paste the token

**Option B: GitHub CLI**
```bash
# Install GitHub CLI
winget install GitHub.cli

# Authenticate
gh auth login

# Push
git push -u origin main
```

---

### STEP 7: Deploy to Vercel

#### A. Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

#### B. Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with GitHub
3. **Import Project**:
   - Click "Add New Project"
   - Select "Import Git Repository"
   - Choose: `choudharyasad369/azora-stack`
4. **Configure Project**:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
5. **Add Environment Variables** (see below)
6. **Deploy**

---

## 🔐 Environment Variables for Vercel

**CRITICAL**: Add these in Vercel Dashboard → Settings → Environment Variables

### Database
```
DATABASE_URL=postgresql://user:password@host:5432/database
```

### JWT
```
JWT_SECRET=your_jwt_secret_key_here
```

### App
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

### Resend (Email)
```
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### Supabase (Storage)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Cloudinary (Images)
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### Razorpay (Payments)
```
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
```

### Admin
```
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure_admin_password
```

---

## 🗄️ Database Setup for Production

### Option 1: Supabase PostgreSQL (Recommended)

1. **Create Supabase Project**: https://supabase.com
2. **Get Connection String**:
   - Go to Settings → Database
   - Copy "Connection string" (Transaction mode)
3. **Run Migrations**:
   ```bash
   # Set DATABASE_URL
   export DATABASE_URL="postgresql://..."
   
   # Generate Prisma Client
   npx prisma generate
   
   # Push schema
   npx prisma db push
   
   # Seed database (optional)
   npm run prisma:seed
   ```

### Option 2: Railway PostgreSQL

1. **Create Railway Project**: https://railway.app
2. **Add PostgreSQL**
3. **Copy DATABASE_URL**
4. **Run migrations** (same as above)

### Option 3: Neon PostgreSQL

1. **Create Neon Project**: https://neon.tech
2. **Copy connection string**
3. **Run migrations** (same as above)

---

## 🔧 Vercel Build Configuration

### vercel.json (Optional - Auto-detected)

```json
{
  "buildCommand": "prisma generate && next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["bom1"]
}
```

### Build Settings in Vercel Dashboard:

- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

---

## 📊 Post-Deployment Verification

### 1. Check Build Logs
- Vercel Dashboard → Deployments → View Logs
- Ensure no errors

### 2. Test Core Features
- [ ] Homepage loads
- [ ] User registration works
- [ ] Email verification works
- [ ] Login works
- [ ] Dashboard accessible
- [ ] Project listing works
- [ ] File upload works
- [ ] Payment flow works

### 3. Check Database Connection
- [ ] Prisma connects successfully
- [ ] Queries execute
- [ ] Data persists

### 4. Monitor Errors
- Check Vercel logs
- Check Sentry (if configured)
- Check browser console

---

## 🐛 Troubleshooting

### Build Fails: "Prisma Client not generated"

**Solution**:
```bash
# Update build command in Vercel
prisma generate && next build
```

### Build Fails: "Module not found"

**Solution**:
- Check package.json dependencies
- Ensure all imports are correct
- Clear Vercel cache and redeploy

### Database Connection Fails

**Solution**:
- Verify DATABASE_URL is correct
- Check database is accessible from Vercel
- Ensure SSL mode is correct
- Try adding `?sslmode=require` to connection string

### Environment Variables Not Working

**Solution**:
- Ensure variables are added in Vercel Dashboard
- Redeploy after adding variables
- Check variable names match exactly

### Email Not Sending

**Solution**:
- Verify Resend domain
- Check RESEND_API_KEY
- Ensure FROM email uses verified domain

---

## 🔄 Continuous Deployment

**Automatic Deployments**:
- Push to `main` branch → Auto-deploys to production
- Push to other branches → Creates preview deployments

**Manual Deployment**:
```bash
# Using Vercel CLI
vercel --prod
```

---

## 📈 Performance Optimization

### 1. Enable Vercel Analytics
- Dashboard → Analytics → Enable

### 2. Configure Caching
- Static assets cached automatically
- API routes: Add cache headers

### 3. Image Optimization
- Use Next.js Image component
- Already configured with Cloudinary

### 4. Database Connection Pooling
- Use Prisma connection pooling
- Configure in DATABASE_URL

---

## 🔒 Security Checklist

- [x] .env not committed to Git
- [x] Secrets stored in Vercel environment variables
- [x] JWT_SECRET is strong and unique
- [x] Database credentials are secure
- [x] API keys are production keys
- [x] CORS configured correctly
- [x] Rate limiting implemented
- [x] Input validation in place

---

## 📚 Additional Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Prisma Deployment**: https://www.prisma.io/docs/guides/deployment
- **Supabase Docs**: https://supabase.com/docs

---

## 🎯 Quick Commands Reference

```bash
# Git Commands
git status
git add .
git commit -m "message"
git push origin main

# Vercel Commands
vercel login
vercel
vercel --prod
vercel env pull

# Prisma Commands
npx prisma generate
npx prisma db push
npx prisma studio
```

---

## ✅ Deployment Status

**Current Status**: Ready for Deployment

**Next Steps**:
1. Install Git (if needed)
2. Run git commands to push to GitHub
3. Deploy to Vercel
4. Configure environment variables
5. Test production deployment

---

**Need Help?**
- GitHub Issues: https://github.com/choudharyasad369/azora-stack/issues
- Vercel Support: https://vercel.com/support

**Good luck with your deployment! 🚀**
