import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create default platform settings
  const defaultSettings = [
    {
      key: 'commission_percentage',
      value: '50',
      description: 'Platform commission percentage on each sale',
      dataType: 'number'
    },
    {
      key: 'listing_fee',
      value: '49',
      description: 'Fee charged for listing a project (in INR)',
      dataType: 'number'
    },
    {
      key: 'minimum_withdrawal',
      value: '300',
      description: 'Minimum amount required for withdrawal (in INR)',
      dataType: 'number'
    },
    {
      key: 'currency',
      value: 'INR',
      description: 'Default platform currency',
      dataType: 'string'
    },
    {
      key: 'withdrawal_processing_days',
      value: '3-5',
      description: 'Expected withdrawal processing time',
      dataType: 'string'
    },
    {
      key: 'max_file_size_mb',
      value: '200',
      description: 'Maximum file size allowed for project uploads (in MB)',
      dataType: 'number'
    },
    {
      key: 'allowed_file_types',
      value: JSON.stringify(['zip']),
      description: 'Allowed file types for project uploads',
      dataType: 'json'
    },
    {
      key: 'platform_name',
      value: 'Azora Stack',
      description: 'Platform name',
      dataType: 'string'
    },
    {
      key: 'support_email',
      value: 'support@azorastack.com',
      description: 'Support email address',
      dataType: 'string'
    },
    {
      key: 'razorpay_enabled',
      value: 'true',
      description: 'Enable Razorpay payments',
      dataType: 'boolean'
    },
    {
      key: 'stripe_enabled',
      value: 'true',
      description: 'Enable Stripe payments',
      dataType: 'boolean'
    }
  ];

  console.log('📝 Creating platform settings...');
  for (const setting of defaultSettings) {
    await prisma.platformSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting
    });
    console.log(`  ✅ ${setting.key}`);
  }

  // Create admin user
  console.log('👤 Creating admin user...');
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@azorastack.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin',
      role: UserRole.ADMIN,
      emailVerified: true,
      status: 'ACTIVE'
    }
  });

  console.log(`  ✅ Admin created: ${admin.email}`);
  console.log(`     Password: ${adminPassword}`);
  console.log('');
  console.log('⚠️  IMPORTANT: Change the admin password after first login!');
  console.log('');

  // Create sample buyer and seller for testing
  console.log('👥 Creating sample users...');
  
  const sellerPassword = await bcrypt.hash('Seller@123', 10);
  const seller = await prisma.user.upsert({
    where: { email: 'seller@test.com' },
    update: {},
    create: {
      email: 'seller@test.com',
      password: sellerPassword,
      name: 'Demo Seller',
      role: UserRole.SELLER,
      emailVerified: true,
      status: 'ACTIVE',
      bio: 'Experienced full-stack developer',
      bankName: 'HDFC Bank',
      accountNumber: '1234567890',
      ifscCode: 'HDFC0000123',
      accountHolderName: 'Demo Seller',
      walletBalance: 0
    }
  });
  console.log(`  ✅ Seller: seller@test.com / Seller@123`);

  const buyerPassword = await bcrypt.hash('Buyer@123', 10);
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@test.com' },
    update: {},
    create: {
      email: 'buyer@test.com',
      password: buyerPassword,
      name: 'Demo Buyer',
      role: UserRole.BUYER,
      emailVerified: true,
      status: 'ACTIVE'
    }
  });
  console.log(`  ✅ Buyer: buyer@test.com / Buyer@123`);

  console.log('');
  console.log('✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
