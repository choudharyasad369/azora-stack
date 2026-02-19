# 🗄️ DATABASE UPDATE REQUIRED

## ⚠️ IMPORTANT: Run These Commands Before Testing

The PurchaseRequest model has been added to the schema. You need to update your database.

---

## 📋 Step-by-Step Instructions

### 1. Navigate to Project Directory
```bash
cd azora-stack
```

### 2. Push Schema Changes to Database
```bash
npx prisma db push
```

**Expected Output:**
```
✔ Generated Prisma Client
✔ The database is now in sync with the Prisma schema
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

**Expected Output:**
```
✔ Generated Prisma Client to ./node_modules/@prisma/client
```

### 4. (Optional) Seed Database
```bash
npm run prisma:seed
```

This will create:
- Admin account (admin@azorastack.com / Admin@123456)
- Test seller (seller@test.com / Seller@123)
- Test buyer (buyer@test.com / Buyer@123)
- Platform settings

---

## 🧪 Test the New Features

### Test Purchase Request Flow

1. **As Buyer:**
   - Login as buyer@test.com
   - Browse projects at `/projects`
   - Click on a project
   - Click "Request to Purchase"
   - Check `/dashboard/buyer` for your request

2. **As Admin:**
   - Login as admin@azorastack.com
   - Go to `/dashboard/admin/purchase-requests`
   - See the purchase request
   - Copy buyer's email/phone
   - Contact buyer with payment details
   - After receiving payment, click "Create Order"

3. **As Buyer (Again):**
   - Go to `/dashboard/buyer`
   - See your completed order
   - Click "Download Project"

---

## 🔍 Verify Database Changes

### Open Prisma Studio
```bash
npm run prisma:studio
```

Visit: http://localhost:5555

Check:
- [ ] `purchase_requests` table exists
- [ ] Has columns: id, buyerId, projectId, status, message, etc.
- [ ] Relations to User and Project work

---

## ❌ Troubleshooting

### Error: "Can't reach database server"
**Solution:** Make sure PostgreSQL is running
```bash
# Check if PostgreSQL is running
# Windows: Check Services
# Mac: brew services list
# Linux: sudo systemctl status postgresql
```

### Error: "Database does not exist"
**Solution:** Create the database first
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE azora_stack;

# Exit
\q

# Try again
npx prisma db push
```

### Error: "Prisma Client not generated"
**Solution:** Generate it manually
```bash
npx prisma generate
```

### Error: "Module not found: @prisma/client"
**Solution:** Install dependencies
```bash
npm install
npx prisma generate
```

---

## ✅ Success Checklist

After running the commands, verify:

- [ ] No errors in terminal
- [ ] Prisma Client generated successfully
- [ ] Database schema updated
- [ ] Can start dev server: `npm run dev`
- [ ] Can access Prisma Studio: `npm run prisma:studio`
- [ ] purchase_requests table visible in Prisma Studio

---

## 🚀 Ready to Test!

Once all commands succeed, start the development server:

```bash
npm run dev
```

Visit: http://localhost:3000

Test the complete purchase flow! 🎉

---

## 📝 What Changed?

### New Database Model: PurchaseRequest

```prisma
model PurchaseRequest {
  id                  String    @id @default(cuid())
  buyerId             String
  buyer               User      @relation(...)
  projectId           String
  project             Project   @relation(...)
  message             String?
  status              String    @default("PENDING")
  paymentProof        String?
  paymentMethod       String?
  transactionId       String?
  reviewedBy          String?
  reviewedAt          DateTime?
  reviewNotes         String?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}
```

### New Relations Added

- User → PurchaseRequest (one-to-many)
- Project → PurchaseRequest (one-to-many)

---

**Need Help?** Check the main README.md or LAUNCH_CHECKLIST.md
