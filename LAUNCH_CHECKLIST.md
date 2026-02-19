# 🚀 AZORA STACK - LAUNCH CHECKLIST

**Follow these steps to launch your marketplace!**

---

## ✅ PRE-LAUNCH CHECKLIST

### Step 1: Update Database Schema
```bash
# Navigate to project directory
cd azora-stack

# Push schema changes to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed initial data (creates admin, test users, settings)
npm run prisma:seed
```

### Step 2: Verify Environment Variables
Check your `.env` file has all required variables:
```bash
# Database
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="your-secret-key"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Resend
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="onboarding@resend.dev"

# Admin
ADMIN_EMAIL="admin@azorastack.com"
```

### Step 3: Test Services
```bash
# Test external services connection
npx tsx scripts/test-services.ts
```

Expected output:
```
✅ Supabase Storage: Connected
✅ Cloudinary: Connected
✅ Resend: API Key format is valid
```

### Step 4: Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

---

## 🧪 TESTING CHECKLIST

### Test User Accounts (After Seeding)

**Admin Account:**
- Email: `admin@azorastack.com`
- Password: `Admin@123456`
- Role: ADMIN

**Seller Account:**
- Email: `seller@test.com`
- Password: `Seller@123`
- Role: SELLER

**Buyer Account:**
- Email: `buyer@test.com`
- Password: `Buyer@123`
- Role: BUYER

### Test Flows

#### 1. Test Registration Flow ✅
- [ ] Go to `/register`
- [ ] Register as Seller
- [ ] Check email for verification link
- [ ] Click verification link
- [ ] Login successfully

#### 2. Test Seller Flow ✅
- [ ] Login as seller
- [ ] Go to `/projects/new`
- [ ] Upload a test project
- [ ] Fill all details
- [ ] Upload ZIP file (< 200MB)
- [ ] Upload thumbnail
- [ ] Submit for review
- [ ] Check seller dashboard

#### 3. Test Admin Flow ✅
- [ ] Login as admin
- [ ] Go to admin dashboard
- [ ] See pending project
- [ ] Approve project
- [ ] Check if project appears in `/projects`

#### 4. Test Buyer Flow ✅
- [ ] Login as buyer
- [ ] Browse projects at `/projects`
- [ ] Click on a project
- [ ] Click "Request to Purchase"
- [ ] Check buyer dashboard
- [ ] Verify purchase request created

#### 5. Test Manual Order Creation ✅
- [ ] Login as admin
- [ ] Go to `/dashboard/admin/orders/create`
- [ ] Select buyer
- [ ] Select project
- [ ] Create order
- [ ] Check buyer can download
- [ ] Check seller wallet credited

#### 6. Test Withdrawal Flow ✅
- [ ] Login as seller (with balance)
- [ ] Request withdrawal
- [ ] Login as admin
- [ ] Approve withdrawal
- [ ] Mark as completed

#### 7. Test Profile Management ✅
- [ ] Login as any user
- [ ] Go to `/profile`
- [ ] Update name, phone, bio
- [ ] If seller, add bank details
- [ ] Save changes
- [ ] Verify changes saved

---

## 🐛 COMMON ISSUES & FIXES

### Issue: Database Connection Error
```bash
# Fix: Check DATABASE_URL in .env
# Make sure PostgreSQL is running
# Try: npx prisma db push
```

### Issue: Prisma Client Not Generated
```bash
# Fix: Generate Prisma client
npx prisma generate
```

### Issue: File Upload Fails
```bash
# Fix: Check Supabase credentials
# Verify bucket exists and is private
# Check file size < 200MB
```

### Issue: Email Not Sending
```bash
# Fix: Check Resend API key
# Verify RESEND_FROM_EMAIL is correct
# Check email queue in database
```

### Issue: Images Not Loading
```bash
# Fix: Check Cloudinary credentials
# Verify CLOUDINARY_CLOUD_NAME is correct
```

---

## 📦 DEPLOYMENT CHECKLIST

### Deploy to Vercel (Recommended)

#### 1. Prepare for Production
```bash
# Build locally to test
npm run build

# If build succeeds, you're ready!
```

#### 2. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### 3. Set Environment Variables in Vercel
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add all variables from `.env`:
- DATABASE_URL (use production database)
- JWT_SECRET
- NEXT_PUBLIC_APP_URL (your domain)
- All Supabase variables
- All Cloudinary variables
- RESEND_API_KEY
- RESEND_FROM_EMAIL (verify domain first)

#### 4. Update Database
```bash
# Connect to production database
# Update DATABASE_URL in .env temporarily

# Push schema
npx prisma db push

# Seed initial data
npm run prisma:seed

# Revert DATABASE_URL to local
```

#### 5. Verify Domain in Resend
- Go to Resend dashboard
- Add your domain
- Add DNS records
- Verify domain
- Update RESEND_FROM_EMAIL to use your domain

---

## 🎯 POST-LAUNCH CHECKLIST

### Day 1
- [ ] Monitor error logs
- [ ] Check email delivery
- [ ] Test all user flows
- [ ] Respond to user queries
- [ ] Fix any critical bugs

### Week 1
- [ ] Review purchase requests
- [ ] Process withdrawals
- [ ] Approve projects
- [ ] Collect user feedback
- [ ] Add missing features based on feedback

### Month 1
- [ ] Analyze usage patterns
- [ ] Optimize slow queries
- [ ] Add requested features
- [ ] Improve UI/UX
- [ ] Apply for Razorpay (with traction data)

---

## 📊 MONITORING

### What to Monitor
1. **User Registrations**: Track daily signups
2. **Project Uploads**: Monitor quality and quantity
3. **Purchase Requests**: Response time and conversion
4. **Withdrawals**: Processing time
5. **Errors**: Check logs daily
6. **Performance**: Page load times
7. **Email Delivery**: Success rate

### Tools to Use
- Vercel Analytics (built-in)
- Prisma Studio (database GUI)
- Resend Dashboard (email stats)
- Supabase Dashboard (storage stats)
- Cloudinary Dashboard (image stats)

---

## 💡 GROWTH STRATEGY

### Phase 1: Launch (Week 1-2)
1. Soft launch to friends/network
2. Get 5-10 test users
3. Collect feedback
4. Fix critical issues
5. Improve based on feedback

### Phase 2: Early Traction (Month 1)
1. Public launch on social media
2. Post on relevant communities
3. Reach out to potential sellers
4. Get 50-100 users
5. Process first real transactions

### Phase 3: Scale (Month 2-3)
1. Apply for Razorpay with traction data
2. Automate payment flow
3. Add advanced features
4. Improve SEO
5. Run marketing campaigns

### Phase 4: Growth (Month 4+)
1. Add categories and reviews
2. Implement referral program
3. Create mobile app
4. Expand to more niches
5. Scale to 1000+ users

---

## 🎉 SUCCESS METRICS

### Week 1 Goals
- [ ] 10 registered users
- [ ] 3 projects uploaded
- [ ] 1 successful transaction
- [ ] 0 critical bugs

### Month 1 Goals
- [ ] 100 registered users
- [ ] 20 projects uploaded
- [ ] 10 successful transactions
- [ ] ₹50,000 GMV (Gross Merchandise Value)

### Month 3 Goals
- [ ] 500 registered users
- [ ] 100 projects uploaded
- [ ] 50 successful transactions
- [ ] ₹2,50,000 GMV

---

## 🆘 NEED HELP?

### Resources
- **Documentation**: Check README.md and API_DOCS.md
- **Database**: Use Prisma Studio (`npm run prisma:studio`)
- **Logs**: Check Vercel logs or console
- **Community**: Next.js, Prisma, Supabase communities

### Quick Fixes
```bash
# Reset database (CAUTION: Deletes all data)
npx prisma db push --force-reset

# View database
npm run prisma:studio

# Check for errors
npm run build

# Clear cache
rm -rf .next
npm run dev
```

---

## ✅ FINAL CHECKLIST BEFORE LAUNCH

- [ ] Database schema updated
- [ ] Prisma client generated
- [ ] Initial data seeded
- [ ] All services tested
- [ ] Environment variables set
- [ ] Build succeeds locally
- [ ] All user flows tested
- [ ] Email delivery working
- [ ] File uploads working
- [ ] Downloads working
- [ ] Admin panel accessible
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Security reviewed

---

## 🚀 LAUNCH COMMAND

When everything is ready:

```bash
# Final check
npm run build

# If successful, deploy!
vercel --prod

# 🎉 YOU'RE LIVE!
```

---

**🎊 CONGRATULATIONS! You're ready to launch!**

**Remember:**
- Start small, iterate fast
- Listen to users
- Fix bugs quickly
- Add features based on demand
- Scale gradually

**You've got this! 🚀**

---

_Good luck with your launch! 🌟_
