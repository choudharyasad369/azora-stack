# 🚀 STEP-BY-STEP GUIDE TO RUN YOUR PROJECT

**Date:** February 17, 2026  
**Platform:** Windows  
**Status:** Ready to Run ✅  

---

## ✅ PREREQUISITES CHECK

Before we start, make sure you have:
- ✅ Node.js installed (v18 or higher)
- ✅ PostgreSQL installed and running
- ✅ Git installed
- ✅ Code editor (VS Code recommended)

---

## 🎯 STEP-BY-STEP INSTRUCTIONS

### STEP 1: Navigate to Project Directory

Open Command Prompt or PowerShell and run:

```bash
cd azora-stack
```

---

### STEP 2: Install Dependencies

Install all required packages:

```bash
npm install
```

**Expected Output:**
```
added 500+ packages in 30s
```

**If you see errors:**
- Try: `npm install --legacy-peer-deps`
- Or: `npm install --force`

---

### STEP 3: Check PostgreSQL Database

Make sure PostgreSQL is running:

**Option A: Check if running**
```bash
# Check PostgreSQL service status
sc query postgresql-x64-14
```

**Option B: Start PostgreSQL (if not running)**
```bash
# Start PostgreSQL service
net start postgresql-x64-14
```

**Your Database Connection:**
- Host: localhost
- Port: 5432
- Database: azora_stack
- Username: postgres
- Password: root

---

### STEP 4: Setup Database Schema

Push the database schema to PostgreSQL:

```bash
npm run prisma:push
```

**Expected Output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "azora_stack"

🚀  Your database is now in sync with your Prisma schema.
✔ Generated Prisma Client
```

**If you see "Database does not exist" error:**
```bash
# Create database manually
psql -U postgres
CREATE DATABASE azora_stack;
\q

# Then run prisma:push again
npm run prisma:push
```

---

### STEP 5: Generate Prisma Client

Generate the Prisma client for database access:

```bash
npm run prisma:generate
```

**Expected Output:**
```
✔ Generated Prisma Client to .\node_modules\@prisma\client
```

---

### STEP 6: Seed Database (Optional but Recommended)

Add test data to your database:

```bash
npm run prisma:seed
```

**Expected Output:**
```
🌱 Seeding database...
✅ Created admin user
✅ Created test sellers
✅ Created test buyers
✅ Created test projects
✅ Seeding completed!
```

**This creates:**
- 1 Admin user (admin@azorastack.com / Admin@123456)
- 3 Seller users
- 3 Buyer users
- 10 Sample projects
- Sample orders and transactions

---

### STEP 7: Start Development Server

Start the Next.js development server:

```bash
npm run dev
```

**Expected Output:**
```
   ▲ Next.js 14.1.0
   - Local:        http://localhost:3000
   - Environments: .env

 ✓ Ready in 3.5s
```

**Keep this terminal window open!** The server needs to keep running.

---

### STEP 8: Open in Browser

Open your browser and go to:

```
http://localhost:3000
```

**You should see:**
- Beautiful homepage with gradient background
- Navigation bar with Login/Register buttons
- "Browse Premium Projects" section

---

## 🎉 SUCCESS! YOUR PROJECT IS RUNNING!

---

## 🔐 TEST ACCOUNTS

### Admin Account
- **Email:** admin@azorastack.com
- **Password:** Admin@123456
- **Access:** Full admin panel

### Test Seller Account
- **Email:** seller1@test.com
- **Password:** password123
- **Access:** Upload projects, view earnings

### Test Buyer Account
- **Email:** buyer1@test.com
- **Password:** password123
- **Access:** Browse and purchase projects

---

## 🧪 TESTING THE PLATFORM

### Test 1: Login as Admin
1. Click "Login" in navbar
2. Enter: admin@azorastack.com / Admin@123456
3. You should see Admin Dashboard
4. Check analytics, pending approvals

### Test 2: Browse Projects
1. Click "Projects" in navbar
2. You should see 10 sample projects
3. Try filters (tech stack, difficulty, price)
4. Try search functionality

### Test 3: Login as Seller
1. Logout (if logged in)
2. Login as: seller1@test.com / password123
3. Go to Seller Dashboard
4. Check wallet balance, projects, sales

### Test 4: Login as Buyer
1. Logout
2. Login as: buyer1@test.com / password123
3. Go to Buyer Dashboard
4. Check purchases and downloads

---

## 🛠️ USEFUL COMMANDS

### View Database in GUI
```bash
npm run prisma:studio
```
Opens Prisma Studio at http://localhost:5555

### Check for Errors
```bash
npm run lint
```

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm run start
```

---

## 🐛 TROUBLESHOOTING

### Problem 1: Port 3000 Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Or use different port
set PORT=3001 && npm run dev
```

---

### Problem 2: Database Connection Error

**Error:**
```
Can't reach database server at localhost:5432
```

**Solution:**
```bash
# Check if PostgreSQL is running
sc query postgresql-x64-14

# Start PostgreSQL
net start postgresql-x64-14

# Check connection
psql -U postgres -d azora_stack
```

---

### Problem 3: Prisma Client Not Generated

**Error:**
```
Cannot find module '@prisma/client'
```

**Solution:**
```bash
npm run prisma:generate
```

---

### Problem 4: Module Not Found

**Error:**
```
Module not found: Can't resolve '@/components/...'
```

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

---

### Problem 5: Environment Variables Not Loading

**Error:**
```
DATABASE_URL is not defined
```

**Solution:**
1. Check `.env` file exists in `azora-stack` folder
2. Restart development server
3. Make sure no spaces around `=` in .env file

---

## 📊 VERIFY EVERYTHING IS WORKING

### Checklist:

1. ✅ **Homepage loads** - http://localhost:3000
2. ✅ **Can register new user** - Click Register
3. ✅ **Can login** - Use test accounts
4. ✅ **Projects page shows data** - /projects
5. ✅ **Dashboards load** - /dashboard/seller or /dashboard/buyer
6. ✅ **Admin panel works** - /dashboard/admin (admin account)
7. ✅ **No console errors** - Check browser DevTools (F12)
8. ✅ **Database has data** - Run `npm run prisma:studio`

---

## 🎨 WHAT YOU SHOULD SEE

### Homepage
- Beautiful gradient background (purple to blue)
- Animated navigation bar
- "Browse Premium Projects" button
- Footer with links

### Projects Page
- Grid of project cards
- Filters sidebar (tech stack, difficulty, price)
- Search bar
- Sort dropdown
- 10 sample projects (if seeded)

### Seller Dashboard
- Wallet balance card
- Total revenue card
- Total sales card
- Active projects card
- Recent projects list
- Recent sales list

### Buyer Dashboard
- Total purchases card
- Total spent card
- Available downloads card
- Order list with download buttons

### Admin Dashboard
- Platform analytics
- Total users, projects, revenue
- Pending approvals
- Purchase requests
- Quick action buttons

---

## 🚀 NEXT STEPS AFTER RUNNING

### 1. Explore the Platform (10 minutes)
- Browse all pages
- Test all features
- Check dashboards
- Try filters and search

### 2. Test User Flows (15 minutes)
- Register new user
- Upload project (as seller)
- Create purchase request (as buyer)
- Approve project (as admin)
- Process purchase request (as admin)

### 3. Check Database (5 minutes)
```bash
npm run prisma:studio
```
- View all tables
- Check data
- Verify relationships

### 4. Review Code (Optional)
- Check API routes in `app/api/`
- Review components in `components/`
- Look at database schema in `prisma/schema.prisma`

---

## 💡 TIPS

### Tip 1: Keep Terminal Open
The `npm run dev` terminal must stay open while developing.

### Tip 2: Auto-Reload
Next.js automatically reloads when you save files. No need to restart!

### Tip 3: Check Console
Always check browser console (F12) for errors.

### Tip 4: Use Prisma Studio
Best way to view and edit database data:
```bash
npm run prisma:studio
```

### Tip 5: Clear Cache
If something looks wrong:
```bash
# Delete .next folder
rm -rf .next

# Restart dev server
npm run dev
```

---

## 🎯 COMMON FIRST-TIME ISSUES

### Issue 1: White Screen
**Cause:** JavaScript error
**Fix:** Check browser console (F12) for errors

### Issue 2: Styles Not Loading
**Cause:** Tailwind CSS not compiled
**Fix:** Restart dev server

### Issue 3: API Errors
**Cause:** Database not connected
**Fix:** Check PostgreSQL is running

### Issue 4: Images Not Loading
**Cause:** Cloudinary not configured
**Fix:** Images will show placeholder (this is fine for testing)

---

## 📞 NEED HELP?

### Quick Checks:
1. Is PostgreSQL running? ✅
2. Is dev server running? ✅
3. Is .env file present? ✅
4. Did you run `npm install`? ✅
5. Did you run `prisma:push`? ✅

### Debug Commands:
```bash
# Check Node version
node --version

# Check npm version
npm --version

# Check PostgreSQL
psql --version

# View logs
# Check terminal where dev server is running
```

---

## 🎊 YOU'RE READY!

Your platform is now running locally! 

**What you have:**
- ✅ Full marketplace platform
- ✅ Ultra-premium UI
- ✅ Real database connectivity
- ✅ Test data loaded
- ✅ All features working

**Next:**
- Explore the platform
- Test all features
- Make any customizations
- Deploy to production (when ready)

---

## 🚀 QUICK REFERENCE

### Start Project
```bash
cd azora-stack
npm run dev
```

### View Database
```bash
npm run prisma:studio
```

### Reset Database
```bash
npm run prisma:push -- --force-reset
npm run prisma:seed
```

### Stop Server
Press `Ctrl + C` in terminal

---

**ENJOY YOUR ULTRA-PREMIUM MARKETPLACE! 🎉**

**Platform Status:** Running ✅  
**Database:** Connected ✅  
**Test Data:** Loaded ✅  
**Ready to Use:** YES ✅  

**HAPPY CODING! 🚀**
