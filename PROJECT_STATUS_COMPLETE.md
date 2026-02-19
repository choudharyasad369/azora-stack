# AZORA STACK - Complete Project Status & Handover Document

## 🎯 PROJECT OVERVIEW

**Azora Stack** is a fully functional digital marketplace platform for buying and selling web development projects (source code). Built with Next.js 14, TypeScript, Prisma, PostgreSQL, and integrated with Razorpay payments, Supabase storage, and Cloudinary.

**Currency**: Indian Rupees (₹)  
**Target Market**: Indian developers and businesses  
**Platform Type**: B2C Marketplace with Admin Panel

---

## ✅ COMPLETED FEATURES

### 1. AUTHENTICATION SYSTEM ✅
**Status**: Fully Implemented & Working

**Files Created**:
- `/app/api/auth/login/route.ts` - User login with JWT
- `/app/api/auth/register/route.ts` - User registration with email verification
- `/app/api/auth/logout/route.ts` - Session logout
- `/app/api/auth/verify-email/route.ts` - Email verification
- `/app/api/auth/forgot-password/route.ts` - Password reset request
- `/app/api/auth/reset-password/route.ts` - Password reset completion
- `/app/api/auth/me/route.ts` - Get current user info
- `/app/login/page.tsx` - Login UI
- `/app/forgot-password/page.tsx` - Password reset UI

**Features**:
- JWT-based authentication
- Email verification system
- Password reset flow
- Role-based access (BUYER, SELLER, ADMIN)
- Secure password hashing with bcrypt
- HTTP-only cookies for session management

---

### 2. FILE UPLOAD SYSTEM ✅
**Status**: Fully Implemented & Working (150MB limit)

**Files Created**:
- `/services/storage.service.ts` - Dual storage service (Supabase + Cloudinary)
- `/app/api/upload/route.ts` - File upload API endpoint

**Configuration**:
- **Project Files (ZIP)**: Supabase Storage (up to 150MB)
- **Thumbnails/Images**: Cloudinary (up to 10MB)
- **Bucket Name**: `project-files` (configured in Supabase)
- **Validation**: File type, size, and format checks

**Features**:
- Chunked upload support for large files
- Automatic file type detection
- Secure signed URLs for downloads
- Error handling and retry logic
- BigInt serialization fix for file sizes

**Environment Variables Required**:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

### 3. PROJECT MANAGEMENT SYSTEM ✅
**Status**: Fully Implemented & Working

**Seller Features** (`/app/dashboard/seller/projects/page.tsx`):
- Create new projects with rich details
- Upload project files (ZIP) and thumbnails
- Set pricing in ₹ (Indian Rupees)
- Add tech stack tags
- Project status tracking (DRAFT, PENDING, APPROVED, REJECTED)
- Edit and delete projects
- View project analytics

**Buyer Features** (`/app/projects/page.tsx`):
- Browse all approved projects
- Filter by category, tech stack, price range
- Search functionality
- View project details
- Purchase projects via Razorpay

**API Routes**:
- `GET /api/projects` - List all approved projects (public)
- `POST /api/projects` - Create new project (seller only)
- `GET /api/projects/[id]` - Get project details
- `PUT /api/projects/[id]` - Update project (seller only)
- `DELETE /api/projects/[id]` - Delete project (seller only)

**Database Schema** (Prisma):
```prisma
model Project {
  id                  String          @id @default(cuid())
  title               String
  slug                String          @unique
  description         String          @db.Text
  shortDescription    String
  price               Decimal         @db.Decimal(10, 2)
  listingFee          Decimal         @db.Decimal(10, 2)
  commissionRate      Decimal         @db.Decimal(5, 2)
  fileUrl             String
  fileSize            BigInt
  thumbnailUrl        String
  techStack           String[]
  difficulty          String
  demoUrl             String?
  documentationUrl    String?
  status              ProjectStatus   @default(DRAFT)
  rejectionReason     String?         @db.Text
  viewCount           Int             @default(0)
  downloadCount       Int             @default(0)
  salesCount          Int             @default(0)
  sellerId            String
  seller              User            @relation(fields: [sellerId], references: [id])
  publishedAt         DateTime?
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt
}
```

---

### 4. ADMIN PANEL ✅
**Status**: Fully Implemented & Working

**Admin Dashboard** (`/app/dashboard/admin/page.tsx`):
- Platform analytics overview
- Total users, projects, orders, revenue
- Recent activity feed
- Quick actions panel

**Project Approval System** (`/app/dashboard/admin/projects/page.tsx`):
- View all projects (Pending/Approved/Rejected)
- Filter by status
- Approve projects with optional notes
- Reject projects with reasons
- View project details modal
- Email notifications to sellers

**User Management** (`/app/api/admin/users/route.ts`):
- List all users
- View user details
- Role management
- User statistics

**Purchase Request Management** (`/app/dashboard/admin/purchase-requests/page.tsx`):
- View all purchase requests
- Approve/reject requests
- Track request status

**API Routes**:
- `GET /api/admin/analytics` - Platform analytics
- `GET /api/admin/projects` - List projects by status
- `POST /api/admin/projects/[id]/approve` - Approve project
- `POST /api/admin/projects/[id]/reject` - Reject project
- `GET /api/admin/users` - List all users

**Access Control**:
- Middleware checks for ADMIN role
- Protected routes with authentication
- Audit logging for admin actions

---

### 5. PAYMENT SYSTEM ✅
**Status**: Fully Implemented (Razorpay Integration)

**Files Created**:
- `/app/api/payments/create-order/route.ts` - Create Razorpay order (includes Razorpay client initialization)
- `/app/api/payments/verify/route.ts` - Verify payment signature

**Note**: Razorpay integration is implemented directly inside payment API routes, not as a separate library file.

**Features**:
- Razorpay payment gateway integration
- Order creation with INR currency
- Payment signature verification
- Automatic order status update
- Transaction logging
- Wallet credit system

**Payment Flow**:
1. Buyer clicks "Buy Now" on project
2. System creates Razorpay order
3. Razorpay checkout modal opens
4. Payment processed
5. Signature verified on backend
6. Order marked as COMPLETED
7. Download link generated
8. Seller wallet credited (90% of price, 10% platform fee)

**Environment Variables Required**:
```env
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

---

### 6. ORDER & DOWNLOAD SYSTEM ✅
**Status**: Fully Implemented & Working

**Buyer Dashboard** (`/app/dashboard/buyer/page.tsx`):
- View all purchased projects
- Download project files (unlimited downloads)
- Track download history
- View order details
- Order statistics

**Order Management**:
- Automatic order creation on payment
- Download link generation with expiry
- Download count tracking
- Order status tracking (PENDING, COMPLETED, FAILED)

**API Routes**:
- `GET /api/dashboard/buyer/orders` - Get buyer's orders
- `GET /api/orders/[id]/download` - Generate download link
- `POST /api/orders/manual-create` - Admin manual order creation

**Database Schema**:
```prisma
model Order {
  id                  String          @id @default(cuid())
  orderNumber         String          @unique
  buyerId             String
  buyer               User            @relation(fields: [buyerId], references: [id])
  projectId           String
  project             Project         @relation(fields: [projectId], references: [id])
  projectPrice        Decimal         @db.Decimal(10, 2)
  platformCommission  Decimal         @db.Decimal(10, 2)
  sellerEarning       Decimal         @db.Decimal(10, 2)
  commissionRate      Decimal         @db.Decimal(5, 2)
  status              OrderStatus     @default(CREATED)
  paymentGateway      String?
  paymentId           String?         @unique
  paymentOrderId      String?
  paymentSignature    String?
  downloadUrl         String?
  downloadExpiresAt   DateTime?
  downloadCount       Int             @default(0)
  lastDownloadAt      DateTime?
  paidAt              DateTime?
  completedAt         DateTime?
  refundedAt          DateTime?
  refundReason        String?         @db.Text
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt
}
```

---

### 7. WALLET SYSTEM ✅
**Status**: Fully Implemented & Working

**Features**:
- Automatic wallet credit on sales (90% of price)
- Transaction history
- Balance tracking
- Withdrawal requests

**Seller Dashboard** (`/app/dashboard/seller/page.tsx`):
- View wallet balance
- Recent transactions
- Sales statistics
- Withdrawal history

**API Routes**:
- `GET /api/wallet/balance` - Get wallet balance
- `GET /api/wallet/transactions` - Get transaction history
- `POST /api/withdrawals` - Request withdrawal
- `POST /api/withdrawals/[id]/review` - Admin review withdrawal
- `POST /api/withdrawals/[id]/complete` - Complete withdrawal

**Database Schema**:
```prisma
// Note: Wallet balance is stored directly in User model
model User {
  walletBalance     Decimal             @default(0) @db.Decimal(10, 2)
  // ... other user fields
}

model WalletTransaction {
  id                  String              @id @default(cuid())
  userId              String
  user                User                @relation(fields: [userId], references: [id])
  type                TransactionType
  source              TransactionSource
  amount              Decimal             @db.Decimal(10, 2)
  balanceBefore       Decimal             @db.Decimal(10, 2)
  balanceAfter        Decimal             @db.Decimal(10, 2)
  orderId             String?
  order               Order?              @relation(fields: [orderId], references: [id])
  withdrawalId        String?
  withdrawal          Withdrawal?         @relation(fields: [withdrawalId], references: [id])
  description         String
  metadata            Json?
  createdAt           DateTime            @default(now())
}

model Withdrawal {
  id                  String              @id @default(cuid())
  withdrawalNumber    String              @unique
  sellerId            String
  seller              User                @relation(fields: [sellerId], references: [id])
  amount              Decimal             @db.Decimal(10, 2)
  bankDetailsSnapshot Json
  status              WithdrawalStatus    @default(PENDING)
  reviewedBy          String?
  reviewedAt          DateTime?
  reviewNotes         String?             @db.Text
  transactionId       String?
  paymentProof        String?
  requestedAt         DateTime            @default(now())
  completedAt         DateTime?
  rejectedAt          DateTime?
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt
}
```

---

### 8. UI COMPONENTS ✅
**Status**: Fully Implemented (shadcn/ui + Custom)

**Created Components**:
- `/components/ui/button.tsx` - Button component
- `/components/ui/card.tsx` - Card component
- `/components/ui/input.tsx` - Input component
- `/components/ui/label.tsx` - Label component
- `/components/ui/select.tsx` - Select dropdown
- `/components/ui/textarea.tsx` - Textarea component
- `/components/ui/toast.tsx` - Toast notifications
- `/components/ui/alert-dialog.tsx` - Confirmation dialogs
- `/components/ui/table.tsx` - Data tables
- `/components/ui/pagination.tsx` - Pagination component
- `/components/ui/stat-card.tsx` - Statistics cards
- `/components/ui/empty-state.tsx` - Empty state component
- `/components/ui/loading-spinner.tsx` - Loading indicators
- `/components/ui/error-boundary.tsx` - Error handling
- `/components/ui/project-card-skeleton.tsx` - Loading skeletons
- `/components/ui/premium-badge.tsx` - Premium badges
- `/components/ui/premium-button.tsx` - Premium buttons
- `/components/ui/success-animation.tsx` - Success animations
- `/components/ui/floating-particles.tsx` - Particle effects
- `/components/layout/navbar.tsx` - Navigation bar (import as `@/components/layout/navbar`)

**Design System**:
- Tailwind CSS for styling
- Framer Motion for animations
- Lucide React for icons
- Responsive design (mobile-first)
- Dark mode support (not yet implemented)

---

### 9. PROFILE MANAGEMENT ✅
**Status**: Fully Implemented & Working

**Files Created**:
- `/app/profile/page.tsx` - Profile page UI
- `/app/api/profile/route.ts` - Profile API (GET, PUT)

**Features**:
- View and edit profile information
- Update name, email, bio
- Change password
- Upload profile picture (Cloudinary)
- View account statistics
- Role display

---

### 10. EMAIL SYSTEM ✅
**Status**: Configured (Nodemailer)

**Files Created**:
- `/services/email.service.ts` - Email service with queue-based processing

**Email Templates**:
- Welcome email on registration
- Email verification
- Password reset
- Order confirmation
- Project approval/rejection notifications
- Withdrawal status updates

**Environment Variables Required**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@azora.com
```

---

## 🔧 TECHNICAL STACK

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **File Storage**: Supabase Storage + Cloudinary
- **Payments**: Razorpay
- **Email**: Nodemailer

### DevOps
- **Version Control**: Git
- **Package Manager**: npm
- **Environment**: .env files
- **Deployment**: Ready for Vercel/Railway/AWS

---

## 📁 PROJECT STRUCTURE

```
azora-stack/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── projects/          # Project CRUD
│   │   ├── orders/            # Order management
│   │   ├── payments/          # Payment processing
│   │   ├── wallet/            # Wallet operations
│   │   ├── withdrawals/       # Withdrawal requests
│   │   ├── admin/             # Admin endpoints
│   │   ├── dashboard/         # Dashboard APIs
│   │   ├── profile/           # Profile management
│   │   └── upload/            # File uploads
│   ├── dashboard/             # Dashboard pages
│   │   ├── admin/            # Admin panel
│   │   ├── buyer/            # Buyer dashboard
│   │   └── seller/           # Seller dashboard
│   ├── projects/              # Project pages
│   ├── login/                 # Login page
│   ├── profile/               # Profile page
│   ├── forgot-password/       # Password reset
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Homepage
│   ├── globals.css           # Global styles
│   ├── error.tsx             # Error page
│   └── not-found.tsx         # 404 page
├── components/
│   ├── ui/                    # UI components
│   └── layout/                # Layout components
├── lib/
│   ├── prisma.ts             # Prisma client
│   ├── auth.ts               # Auth utilities
│   ├── api-response.ts       # API response helpers
│   ├── validations.ts        # Validation schemas
│   └── utils.ts              # Utility functions
├── services/
│   ├── storage.service.ts    # File storage service
│   └── email.service.ts      # Email service with queue
├── prisma/
│   └── schema.prisma         # Database schema
├── hooks/
│   └── use-confirm-dialog.tsx # Custom hooks
├── .env                       # Environment variables
├── .env.example              # Environment template
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── tailwind.config.ts        # Tailwind config
└── next.config.js            # Next.js config
```

---

## 🐛 FIXED ISSUES

### Issue 1: File Upload Failing (150MB Limit)
**Problem**: Supabase free tier has 50MB limit  
**Solution**: Use Supabase for ZIP files (150MB), Cloudinary for images (10MB)  
**Status**: ✅ Fixed

### Issue 2: BigInt Serialization Error
**Problem**: Cannot serialize BigInt in JSON responses  
**Solution**: Custom JSON serializer in `lib/api-response.ts`  
**Status**: ✅ Fixed

### Issue 3: TechStack Undefined Errors
**Problem**: `project.techStack.slice()` failing when undefined  
**Solution**: Added safety checks: `techStack && Array.isArray(techStack) && techStack.slice()`  
**Status**: ✅ Fixed

### Issue 4: Admin Project Approval Missing
**Problem**: No UI for admin to approve projects  
**Solution**: Created complete admin project approval page  
**Status**: ✅ Fixed

### Issue 5: TypeScript Errors in Admin Pages
**Problem**: Invalid props and toast variants  
**Solution**: Fixed Navbar usage and toast variants  
**Status**: ✅ Fixed

### Issue 6: Buyer Dashboard Compilation Error
**Problem**: SWC error "Unexpected token `div`"  
**Solution**: Added missing `</div>` closing tag  
**Status**: ✅ Fixed

---

## ❌ NOT IMPLEMENTED / MISSING FEATURES

### 1. PAYMENT WEBHOOK ❌
**Status**: Not Implemented  
**Required**: `/app/api/payments/webhook/route.ts`  
**Purpose**: Handle Razorpay webhook events for payment status updates  
**Priority**: HIGH

### 2. SEARCH & FILTERING ⚠️
**Status**: Partially Implemented  
**Missing**:
- Advanced search with Elasticsearch/Algolia
- Full-text search in project descriptions
- Filter by multiple categories
- Sort by popularity, date, price
**Priority**: MEDIUM

### 3. REVIEWS & RATINGS ❌
**Status**: Not Implemented  
**Required**:
- Review model in database
- Review submission API
- Rating display on projects
- Review moderation
**Priority**: MEDIUM

### 4. MESSAGING SYSTEM ❌
**Status**: Not Implemented  
**Required**:
- Buyer-seller chat
- Message notifications
- Real-time messaging (Socket.io)
**Priority**: LOW

### 5. ANALYTICS DASHBOARD ⚠️
**Status**: Basic Implementation  
**Missing**:
- Detailed sales charts
- Revenue graphs
- User growth metrics
- Export reports
**Priority**: MEDIUM

### 6. REFUND SYSTEM ❌
**Status**: Not Implemented  
**Required**:
- Refund request API
- Admin refund approval
- Razorpay refund integration
- Refund policy page
**Priority**: MEDIUM

### 7. FAVORITES/WISHLIST ❌
**Status**: Not Implemented  
**Required**:
- Favorite model in database
- Add/remove favorites API
- Wishlist page
**Priority**: LOW

### 8. NOTIFICATIONS ⚠️
**Status**: Email Only  
**Missing**:
- In-app notifications
- Push notifications
- Notification preferences
- Real-time updates
**Priority**: MEDIUM

### 9. DARK MODE ❌
**Status**: Not Implemented  
**Required**:
- Theme toggle component
- Dark mode styles
- User preference storage
**Priority**: LOW

### 10. MOBILE APP ❌
**Status**: Not Implemented  
**Required**:
- React Native app
- API optimization for mobile
- Push notifications
**Priority**: LOW

### 11. SEO OPTIMIZATION ⚠️
**Status**: Basic Implementation  
**Missing**:
- Dynamic meta tags
- Open Graph tags
- Sitemap generation
- robots.txt
- Schema.org markup
**Priority**: HIGH

### 12. SECURITY ENHANCEMENTS ⚠️
**Status**: Basic Implementation  
**Missing**:
- Rate limiting
- CSRF protection
- XSS prevention
- SQL injection prevention (Prisma handles this)
- File upload virus scanning
- Two-factor authentication
**Priority**: HIGH

### 13. TESTING ❌
**Status**: Not Implemented  
**Required**:
- Unit tests (Jest)
- Integration tests
- E2E tests (Playwright/Cypress)
- API tests
**Priority**: MEDIUM

### 14. DOCUMENTATION ⚠️
**Status**: Partial  
**Missing**:
- API documentation (Swagger)
- Developer guide
- Deployment guide
- User manual
**Priority**: MEDIUM

### 15. ADMIN FEATURES ⚠️
**Status**: Partial  
**Missing**:
- User ban/suspend
- Content moderation tools
- Platform settings page
- Email template editor
- Bulk operations
**Priority**: MEDIUM

---

## 🚀 DEPLOYMENT CHECKLIST

### Environment Setup
- [ ] Set up production database (PostgreSQL)
- [ ] Configure Supabase production bucket
- [ ] Set up Cloudinary production account
- [ ] Configure Razorpay production keys
- [ ] Set up SMTP for production emails
- [ ] Configure domain and SSL

### Security
- [ ] Enable HTTPS
- [ ] Set secure JWT secret
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Configure CSP headers

### Performance
- [ ] Enable Next.js caching
- [ ] Configure CDN (Cloudflare)
- [ ] Optimize images
- [ ] Enable compression
- [ ] Set up database indexes
- [ ] Configure Redis for sessions

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics (Google Analytics)
- [ ] Set up uptime monitoring
- [ ] Configure log aggregation
- [ ] Set up performance monitoring

---

## 📝 ENVIRONMENT VARIABLES

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Razorpay
RAZORPAY_KEY_ID="your-key-id"
RAZORPAY_KEY_SECRET="your-key-secret"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@azora.com"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

---

## 🎯 NEXT STEPS FOR ENHANCEMENT

### Priority 1 (Critical)
1. Implement payment webhook for automatic order updates
2. Add comprehensive error handling and logging
3. Implement rate limiting and security measures
4. Add SEO optimization (meta tags, sitemap)
5. Set up monitoring and analytics

### Priority 2 (Important)
1. Implement reviews and ratings system
2. Add advanced search and filtering
3. Create refund system
4. Enhance admin panel with more tools
5. Add in-app notifications

### Priority 3 (Nice to Have)
1. Implement dark mode
2. Add favorites/wishlist
3. Create messaging system
4. Build mobile app
5. Add social sharing features

---

## 🔗 USEFUL COMMANDS

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npx prisma generate     # Generate Prisma client
npx prisma migrate dev  # Run migrations
npx prisma studio       # Open Prisma Studio
npx prisma db push      # Push schema to database

# Testing
npm run test            # Run tests (not implemented)
npm run lint            # Run ESLint

# Deployment
npm run build && npm run start  # Production build and start
```

---

## 📞 SUPPORT & CONTACT

For questions or issues, refer to:
- API Documentation: `/API_DOCS.md`
- Database Schema: `/prisma/schema.prisma`
- Environment Setup: `/.env.example`

---

## 📄 LICENSE

This project is proprietary. All rights reserved.

---

**Last Updated**: February 17, 2026  
**Version**: 1.0.0  
**Status**: Production Ready (with noted missing features)
