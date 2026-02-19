/**
 * Test Utilities
 * Helper functions for creating test data and authentication
 */

import { prisma } from '@/lib/db';
import { createToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Generate unique test email
 * Uses timestamp and random string to ensure uniqueness across all test runs
 */
export function generateTestEmail(): string {
  return `test_${Date.now()}_${Math.random().toString(36).substring(2, 15)}@example.com`;
}

/**
 * Generate unique test slug
 * Uses timestamp and random string to ensure uniqueness across all test runs
 */
export function generateTestSlug(): string {
  return `test-project-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Create test buyer
 * Returns actual persisted user with proper ID
 */
export async function createTestBuyer(overrides: any = {}) {
  const email = generateTestEmail();
  const password = 'Test123!@#';
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: overrides.name || 'Test Buyer',
      role: 'BUYER',
      status: overrides.status || 'ACTIVE',
      emailVerified: true,
      walletBalance: new Decimal(overrides.walletBalance || 0),
      bankName: overrides.bankName || null,
      accountNumber: overrides.accountNumber || null,
      ifscCode: overrides.ifscCode || null,
      accountHolderName: overrides.accountHolderName || null,
      upiId: overrides.upiId || null,
    },
  });

  // Verify user was created and has valid ID
  if (!user || !user.id) {
    throw new Error('Failed to create test buyer - no ID returned');
  }

  return {
    user,
    password,
    email,
  };
}

/**
 * Create test user (generic function for any role)
 * Returns actual persisted user with proper ID
 */
export async function createTestUser(role: UserRole = 'BUYER', overrides: any = {}) {
  if (role === 'BUYER') {
    return createTestBuyer(overrides);
  } else if (role === 'SELLER') {
    return createTestSeller(overrides);
  } else if (role === 'ADMIN') {
    return createTestAdmin(overrides);
  }
  
  // Fallback for any other role
  const email = generateTestEmail();
  const password = 'Test123!@#';
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: overrides.name || `Test User ${role}`,
      role,
      status: overrides.status || 'ACTIVE',
      emailVerified: true,
      walletBalance: new Decimal(overrides.walletBalance || 0),
      bankName: overrides.bankName || null,
      accountNumber: overrides.accountNumber || null,
      ifscCode: overrides.ifscCode || null,
      accountHolderName: overrides.accountHolderName || null,
      upiId: overrides.upiId || null,
    },
  });

  // Verify user was created and has valid ID
  if (!user || !user.id) {
    throw new Error(`Failed to create test user with role ${role} - no ID returned`);
  }

  return {
    user,
    password,
    email,
  };
}

/**
 * Create test seller with bank details
 * Returns actual persisted user with proper ID
 */
export async function createTestSeller(overrides: any = {}) {
  const email = generateTestEmail();
  const password = 'Test123!@#';
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: overrides.name || 'Test Seller',
      role: 'SELLER',
      status: 'ACTIVE',
      emailVerified: true,
      walletBalance: new Decimal(overrides.walletBalance || 0),
      bankName: overrides.bankName || 'Test Bank',
      accountNumber: overrides.accountNumber || '9876543210',
      ifscCode: overrides.ifscCode || 'TEST0009876',
      accountHolderName: overrides.accountHolderName || 'Test Seller',
      upiId: overrides.upiId || 'testseller@upi',
    },
  });

  // Verify user was created and has valid ID
  if (!user || !user.id) {
    throw new Error('Failed to create test seller - no ID returned');
  }

  return {
    user,
    password,
    email,
  };
}

/**
 * Create test admin
 * Returns actual persisted user with proper ID
 */
export async function createTestAdmin(overrides: any = {}) {
  const email = generateTestEmail();
  const password = 'Test123!@#';
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: overrides.name || 'Test Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      walletBalance: new Decimal(0),
      bankName: null,
      accountNumber: null,
      ifscCode: null,
      accountHolderName: null,
      upiId: null,
    },
  });

  // Verify user was created and has valid ID
  if (!user || !user.id) {
    throw new Error('Failed to create test admin - no ID returned');
  }

  return {
    user,
    password,
    email,
  };
}

/**
 * Generate auth token for user
 */
export async function generateAuthToken(userId: string, email: string, role: UserRole): Promise<string> {
  return createToken({ userId, email, role });
}

/**
 * Create test project
 * Ensures seller exists before creating project
 */
export async function createTestProject(sellerId: string, overrides: any = {}) {
  // Verify seller exists
  const seller = await prisma.user.findUnique({
    where: { id: sellerId },
  });

  if (!seller) {
    throw new Error(`Seller with ID ${sellerId} not found - cannot create project`);
  }

  const slug = generateTestSlug();

  const project = await prisma.project.create({
    data: {
      title: overrides.title || 'Test Project',
      slug,
      description: overrides.description || 'This is a test project description',
      shortDescription: overrides.shortDescription || 'Test project',
      price: new Decimal(overrides.price || 5000),
      listingFee: new Decimal(overrides.listingFee || 0),
      commissionRate: new Decimal(overrides.commissionRate || 15),
      fileUrl: overrides.fileUrl || 'https://example.com/test-file.zip',
      fileSize: BigInt(overrides.fileSize || 1024000),
      thumbnailUrl: overrides.thumbnailUrl || 'https://example.com/test-thumb.jpg',
      techStack: overrides.techStack || ['React', 'Node.js', 'PostgreSQL'],
      difficulty: overrides.difficulty || 'INTERMEDIATE',
      demoUrl: overrides.demoUrl || 'https://example.com/demo',
      documentationUrl: overrides.documentationUrl || null,
      status: overrides.status || 'APPROVED',
      sellerId,
      publishedAt: overrides.publishedAt || new Date(),
    },
  });

  // Verify project was created
  if (!project || !project.id) {
    throw new Error('Failed to create test project - no ID returned');
  }

  return project;
}

/**
 * Create test order
 * Ensures buyer and project exist before creating order
 */
export async function createTestOrder(buyerId: string, projectId: string, overrides: any = {}) {
  // Verify buyer exists
  const buyer = await prisma.user.findUnique({
    where: { id: buyerId },
  });

  if (!buyer) {
    throw new Error(`Buyer with ID ${buyerId} not found - cannot create order`);
  }

  // Verify project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error(`Project with ID ${projectId} not found - cannot create order`);
  }

  const orderNumber = `TEST-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const price = project.price.toNumber();
  const commission = price * 0.15;
  const sellerEarning = price - commission;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      buyerId,
      projectId,
      projectPrice: new Decimal(price),
      platformCommission: new Decimal(commission),
      sellerEarning: new Decimal(sellerEarning),
      commissionRate: new Decimal(15),
      status: overrides.status || 'CREATED',
      paymentGateway: 'RAZORPAY',
      paymentOrderId: overrides.paymentOrderId || `order_${Date.now()}`,
    },
  });

  // Verify order was created
  if (!order || !order.id) {
    throw new Error('Failed to create test order - no ID returned');
  }

  return order;
}

/**
 * Create authenticated request headers
 */
export function createAuthHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    'Cookie': `auth_token=${token}`,
  };
}
