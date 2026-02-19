# 🚀 Azora Stack - SaaS Marketplace Platform

A production-ready SaaS marketplace platform where developers can upload and sell ready-made software projects.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)

## ✨ Features

### For Buyers
- Browse and search projects with filters (tech stack, difficulty, price)
- Full-text search capabilities
- Secure payment processing (Razorpay/Stripe)
- Instant download access with signed URLs
- Order history and tracking

### For Sellers
- Upload projects (ZIP files up to 200MB)
- Project management dashboard
- Wallet system with transaction history
- Withdrawal request system
- Real-time sales notifications
- Analytics and insights

### For Admins
- Comprehensive admin dashboard
- Project approval/rejection workflow
- User management and suspension
- Withdrawal approval system
- Platform settings configuration
- Revenue analytics
- Audit logs for all actions

## 🛠 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **ShadCN UI**
- **React Hook Form** with Zod validation
- **Zustand** for state management
- **Framer Motion** for animations

### Backend
- **Next.js API Routes** (Serverless)
- **PostgreSQL** (Neon)
- **Prisma ORM**
- **JWT Authentication** (jose)
- **Bcrypt** for password hashing

### Infrastructure & Services
- **Vercel** (Hosting)
- **Cloudflare R2 / AWS S3** (File Storage)
- **Cloudinary** (Image Thumbnails)
- **Razorpay** (India Payments)
- **Stripe** (Global Payments)
- **Resend** (Email Service)
- **Sentry** (Error Monitoring)

## 📦 Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database (or Neon account)
- Cloudflare R2 or AWS S3 account
- Razorpay account (for Indian payments)
- Stripe account (for global payments)
- Resend account (for emails)
- Cloudinary account (for images)

## 🚀 Installation

1. **Clone or extract the project**
```bash
cd azora-stack
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```
Edit `.env` with your actual values.

4. **Generate Prisma Client**
```bash
npm run prisma:generate
```

5. **Push database schema**
```bash
npm run prisma:push
```

6. **Seed the database**
```bash
npm run prisma:seed
```

## 🔐 Environment Variables

Create a `.env` file with the following variables (see `.env.example` for template):

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NEXT_PUBLIC_APP_URL` - Your app URL
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` - Razorpay credentials
- `S3_*` - S3/R2 storage credentials
- `RESEND_API_KEY` - Resend email API key
- `CLOUDINARY_*` - Cloudinary credentials

### Optional
- `STRIPE_*` - Stripe credentials (for global payments)
- `SENTRY_DSN` - Sentry error tracking

## 🗄 Database Setup

### Using Neon (Recommended)

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to `DATABASE_URL`
4. Run migrations:
```bash
npm run prisma:push
npm run prisma:seed
```

### Using Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database:
```sql
CREATE DATABASE azora_stack;
```
3. Update `DATABASE_URL` in `.env`
4. Run migrations

## ▶️ Running the Application

### Development Mode
```bash
npm run dev
```
Visit `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

### Database Studio
```bash
npm run prisma:studio
```

## 📁 Project Structure

```
azora-stack/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── payments/        # Payment endpoints
│   │   ├── projects/        # Project CRUD
│   │   ├── withdrawals/     # Withdrawal management
│   │   └── admin/           # Admin endpoints
│   ├── (auth)/              # Auth pages
│   ├── (buyer)/             # Buyer dashboard
│   ├── (seller)/            # Seller dashboard
│   ├── (admin)/             # Admin dashboard
│   └── layout.tsx           # Root layout
├── components/
│   ├── ui/                  # ShadCN UI components
│   ├── layout/              # Layout components
│   └── features/            # Feature-specific components
├── lib/
│   ├── db.ts               # Prisma client
│   ├── auth.ts             # JWT authentication
│   ├── utils.ts            # Utility functions
│   ├── api-response.ts     # API response helpers
│   └── validations.ts      # Zod schemas
├── services/
│   ├── platform-settings.service.ts
│   ├── storage.service.ts
│   ├── email.service.ts
│   ├── payment.service.ts
│   └── wallet.service.ts
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Database seeder
├── config/
│   └── constants.ts        # App configuration
└── types/                  # TypeScript type definitions
```

## 📡 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify-email?token=xxx` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Projects
- `GET /api/projects` - List projects (with filters)
- `GET /api/projects/[id]` - Get project details
- `POST /api/projects` - Create project (Seller)
- `PUT /api/projects/[id]` - Update project (Seller)
- `DELETE /api/projects/[id]` - Delete project (Seller)

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/webhook` - Payment webhook

### Wallet & Withdrawals
- `GET /api/wallet/balance` - Get wallet balance
- `GET /api/wallet/transactions` - Get transactions
- `POST /api/withdrawals` - Request withdrawal
- `GET /api/withdrawals` - List withdrawals

### Admin
- `GET /api/admin/analytics` - Dashboard analytics
- `PUT /api/admin/projects/[id]/approve` - Approve project
- `PUT /api/admin/projects/[id]/reject` - Reject project
- `PUT /api/admin/users/[id]/suspend` - Suspend user
- `PUT /api/admin/withdrawals/[id]/review` - Review withdrawal
- `PUT /api/admin/settings` - Update platform settings

## 🎨 Default Credentials

After seeding the database:

### Admin
- Email: `admin@azorastack.com`
- Password: `Admin@123456`

### Demo Seller
- Email: `seller@test.com`
- Password: `Seller@123`

### Demo Buyer
- Email: `buyer@test.com`
- Password: `Buyer@123`

**⚠️ IMPORTANT: Change these passwords in production!**

## 🚢 Deployment

### Vercel Deployment

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables from `.env`
   - Deploy

3. **Configure Database**
   - Ensure DATABASE_URL is set correctly
   - Run `npm run prisma:push` in Vercel CLI or after deployment

### Environment-specific Settings

**Production Checklist:**
- [ ] Change default admin password
- [ ] Update `JWT_SECRET` to a strong random value
- [ ] Configure proper CORS origins
- [ ] Set up Sentry for error tracking
- [ ] Configure proper email templates
- [ ] Test payment flows thoroughly
- [ ] Set up backup strategy for database
- [ ] Configure rate limiting
- [ ] Review and test all security measures

## 🔒 Security Features

- JWT authentication with HTTP-only cookies
- Bcrypt password hashing
- Input validation with Zod
- SQL injection prevention via Prisma
- Role-based access control
- Rate limiting on sensitive endpoints
- Signed download URLs with expiry
- Audit logs for admin actions
- Payment verification signatures

## 📧 Email Templates

Email templates are included for:
- Welcome/verification emails
- Order confirmations
- Seller sale notifications
- Withdrawal requests/completions
- Password reset
- Project approval/rejection

Customize templates in `services/email.service.ts`

## 🧪 Testing

### Run Tests
```bash
npm test
```

### API Testing
Use tools like:
- Postman
- Thunder Client (VS Code extension)
- Insomnia

Import the API collection from `docs/api-collection.json` (to be created)

## 📝 License

This project is proprietary software. All rights reserved.

## 🤝 Support

For support:
- Email: support@azorastack.com
- Documentation: [docs.azorastack.com](https://docs.azorastack.com)

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Complete marketplace functionality
- Admin dashboard
- Payment integration
- Wallet system

---

**Built with ❤️ for the developer community**
