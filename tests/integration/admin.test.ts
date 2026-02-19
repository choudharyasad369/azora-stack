/**
 * Admin Integration Tests
 * Tests admin operations for user management and withdrawal processing
 */

import { prisma } from '@/lib/db';
import {
  createTestUser,
  createTestSeller,
  createTestAdmin,
} from '../helpers/test-utils';
import { Decimal } from '@prisma/client/runtime/library';

describe('Admin Integration Tests', () => {
  describe('Admin User Management', () => {
    it('should fetch all users', async () => {
      await createTestUser('BUYER', { name: 'Buyer 1' });
      await createTestUser('BUYER', { name: 'Buyer 2' });
      await createTestSeller({ name: 'Seller 1' });

      const users = await prisma.user.findMany({
        where: {
          email: {
            contains: '@example.com',
          },
        },
      });

      expect(users.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter users by role', async () => {
      await createTestUser('BUYER');
      await createTestUser('BUYER');
      await createTestSeller();
      await createTestAdmin();

      const buyers = await prisma.user.findMany({
        where: {
          role: 'BUYER',
          email: { contains: '@example.com' },
        },
      });

      const sellers = await prisma.user.findMany({
        where: {
          role: 'SELLER',
          email: { contains: '@example.com' },
        },
      });

      const admins = await prisma.user.findMany({
        where: {
          role: 'ADMIN',
          email: { contains: '@example.com' },
        },
      });

      expect(buyers.length).toBeGreaterThanOrEqual(2);
      expect(sellers.length).toBeGreaterThanOrEqual(1);
      expect(admins.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter users by status', async () => {
      await createTestUser('BUYER', { status: 'ACTIVE' });
      await createTestUser('BUYER', { status: 'PENDING_VERIFICATION' });
      await createTestUser('BUYER', { status: 'SUSPENDED' });

      const activeUsers = await prisma.user.findMany({
        where: {
          status: 'ACTIVE',
          email: { contains: '@example.com' },
        },
      });

      const pendingUsers = await prisma.user.findMany({
        where: {
          status: 'PENDING_VERIFICATION',
          email: { contains: '@example.com' },
        },
      });

      expect(activeUsers.length).toBeGreaterThanOrEqual(1);
      expect(pendingUsers.length).toBeGreaterThanOrEqual(1);
    });

    it('should get user statistics', async () => {
      await createTestUser('BUYER');
      await createTestUser('BUYER');
      await createTestSeller();
      await createTestAdmin();

      const stats = {
        total: await prisma.user.count({
          where: { email: { contains: '@example.com' } },
        }),
        buyers: await prisma.user.count({
          where: { role: 'BUYER', email: { contains: '@example.com' } },
        }),
        sellers: await prisma.user.count({
          where: { role: 'SELLER', email: { contains: '@example.com' } },
        }),
        admins: await prisma.user.count({
          where: { role: 'ADMIN', email: { contains: '@example.com' } },
        }),
      };

      expect(stats.total).toBeGreaterThanOrEqual(4);
      expect(stats.buyers).toBeGreaterThanOrEqual(2);
      expect(stats.sellers).toBeGreaterThanOrEqual(1);
      expect(stats.admins).toBeGreaterThanOrEqual(1);
    });

    it('should fetch user with project count', async () => {
      const { user: seller } = await createTestSeller();

      const userWithCounts = await prisma.user.findUnique({
        where: { id: seller.id },
        include: {
          _count: {
            select: {
              projects: true,
              orders: true,
            },
          },
        },
      });

      expect(userWithCounts).toBeDefined();
      expect(userWithCounts?._count).toBeDefined();
      expect(userWithCounts?._count.projects).toBeDefined();
      expect(userWithCounts?._count.orders).toBeDefined();
    });

    it('should search users by name or email', async () => {
      await createTestUser('BUYER', { name: 'John Doe' });
      await createTestUser('BUYER', { name: 'Jane Smith' });

      const searchResults = await prisma.user.findMany({
        where: {
          AND: [
            { email: { contains: '@example.com' } },
            {
              OR: [
                { name: { contains: 'John', mode: 'insensitive' } },
                { email: { contains: 'John', mode: 'insensitive' } },
              ],
            },
          ],
        },
      });

      expect(searchResults.length).toBeGreaterThanOrEqual(1);
      expect(searchResults[0].name).toContain('John');
    });
  });

  describe('Admin Withdrawal Management', () => {
    it('should fetch all withdrawal requests', async () => {
      const { user: seller1 } = await createTestSeller({ walletBalance: 10000 });
      const { user: seller2 } = await createTestSeller({ walletBalance: 15000 });

      await prisma.withdrawal.create({
        data: {
          withdrawalNumber: `WD-TEST-1-${Date.now()}`,
          sellerId: seller1.id,
          amount: new Decimal(5000),
          bankDetailsSnapshot: {},
          status: 'PENDING',
        },
      });

      await prisma.withdrawal.create({
        data: {
          withdrawalNumber: `WD-TEST-2-${Date.now()}`,
          sellerId: seller2.id,
          amount: new Decimal(8000),
          bankDetailsSnapshot: {},
          status: 'PENDING',
        },
      });

      const withdrawals = await prisma.withdrawal.findMany({
        include: {
          seller: true,
        },
      });

      expect(withdrawals.length).toBeGreaterThanOrEqual(2);
      expect(withdrawals[0].seller).toBeDefined();
    });

    it('should filter withdrawals by status', async () => {
      const { user: seller } = await createTestSeller({ walletBalance: 20000 });

      await prisma.withdrawal.create({
        data: {
          withdrawalNumber: `WD-PENDING-${Date.now()}`,
          sellerId: seller.id,
          amount: new Decimal(5000),
          bankDetailsSnapshot: {},
          status: 'PENDING',
        },
      });

      await prisma.withdrawal.create({
        data: {
          withdrawalNumber: `WD-COMPLETED-${Date.now()}`,
          sellerId: seller.id,
          amount: new Decimal(3000),
          bankDetailsSnapshot: {},
          status: 'COMPLETED',
        },
      });

      const pendingWithdrawals = await prisma.withdrawal.findMany({
        where: { status: 'PENDING' },
      });

      const completedWithdrawals = await prisma.withdrawal.findMany({
        where: { status: 'COMPLETED' },
      });

      expect(pendingWithdrawals.length).toBeGreaterThanOrEqual(1);
      expect(completedWithdrawals.length).toBeGreaterThanOrEqual(1);
    });

    it('should approve withdrawal request', async () => {
      const { user: admin } = await createTestAdmin();
      const { user: seller } = await createTestSeller({ walletBalance: 10000 });

      const withdrawal = await prisma.withdrawal.create({
        data: {
          withdrawalNumber: `WD-TEST-${Date.now()}`,
          sellerId: seller.id,
          amount: new Decimal(5000),
          bankDetailsSnapshot: {},
          status: 'PENDING',
        },
      });

      const approvedWithdrawal = await prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: 'APPROVED',
          reviewedBy: admin.id,
          reviewedAt: new Date(),
          reviewNotes: 'Approved by admin',
        },
      });

      expect(approvedWithdrawal.status).toBe('APPROVED');
      expect(approvedWithdrawal.reviewedBy).toBe(admin.id);
      expect(approvedWithdrawal.reviewedAt).toBeDefined();
    });

    it('should reject withdrawal request', async () => {
      const { user: admin } = await createTestAdmin();
      const { user: seller } = await createTestSeller({ walletBalance: 10000 });

      const withdrawal = await prisma.withdrawal.create({
        data: {
          withdrawalNumber: `WD-TEST-${Date.now()}`,
          sellerId: seller.id,
          amount: new Decimal(5000),
          bankDetailsSnapshot: {},
          status: 'PENDING',
        },
      });

      const rejectedWithdrawal = await prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: 'REJECTED',
          reviewedBy: admin.id,
          reviewedAt: new Date(),
          reviewNotes: 'Invalid bank details',
          rejectedAt: new Date(),
        },
      });

      expect(rejectedWithdrawal.status).toBe('REJECTED');
      expect(rejectedWithdrawal.reviewedBy).toBe(admin.id);
      expect(rejectedWithdrawal.reviewNotes).toBe('Invalid bank details');
    });

    it('should complete withdrawal with transaction ID', async () => {
      const { user: admin } = await createTestAdmin();
      const { user: seller } = await createTestSeller({ walletBalance: 10000 });

      const withdrawal = await prisma.withdrawal.create({
        data: {
          withdrawalNumber: `WD-TEST-${Date.now()}`,
          sellerId: seller.id,
          amount: new Decimal(5000),
          bankDetailsSnapshot: {},
          status: 'APPROVED',
        },
      });

      const completedWithdrawal = await prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: 'COMPLETED',
          transactionId: 'TXN123456789',
          paymentProof: 'https://example.com/proof.pdf',
          completedAt: new Date(),
        },
      });

      expect(completedWithdrawal.status).toBe('COMPLETED');
      expect(completedWithdrawal.transactionId).toBe('TXN123456789');
      expect(completedWithdrawal.paymentProof).toBe('https://example.com/proof.pdf');
      expect(completedWithdrawal.completedAt).toBeDefined();
    });

    it('should fetch withdrawal with seller details', async () => {
      const { user: seller } = await createTestSeller({
        name: 'Test Seller',
        walletBalance: 10000,
      });

      const withdrawal = await prisma.withdrawal.create({
        data: {
          withdrawalNumber: `WD-TEST-${Date.now()}`,
          sellerId: seller.id,
          amount: new Decimal(5000),
          bankDetailsSnapshot: {
            bankName: 'Test Bank',
            accountNumber: '1234567890',
          },
          status: 'PENDING',
        },
      });

      const withdrawalWithSeller = await prisma.withdrawal.findUnique({
        where: { id: withdrawal.id },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              walletBalance: true,
            },
          },
        },
      });

      expect(withdrawalWithSeller).toBeDefined();
      expect(withdrawalWithSeller?.seller.name).toBe('Test Seller');
      expect(withdrawalWithSeller?.seller.id).toBe(seller.id);
    });

    it('should get withdrawal statistics', async () => {
      const { user: seller } = await createTestSeller({ walletBalance: 20000 });

      await prisma.withdrawal.create({
        data: {
          withdrawalNumber: `WD-1-${Date.now()}`,
          sellerId: seller.id,
          amount: new Decimal(5000),
          bankDetailsSnapshot: {},
          status: 'PENDING',
        },
      });

      await prisma.withdrawal.create({
        data: {
          withdrawalNumber: `WD-2-${Date.now()}`,
          sellerId: seller.id,
          amount: new Decimal(3000),
          bankDetailsSnapshot: {},
          status: 'COMPLETED',
        },
      });

      await prisma.withdrawal.create({
        data: {
          withdrawalNumber: `WD-3-${Date.now()}`,
          sellerId: seller.id,
          amount: new Decimal(2000),
          bankDetailsSnapshot: {},
          status: 'REJECTED',
        },
      });

      const stats = {
        total: await prisma.withdrawal.count(),
        pending: await prisma.withdrawal.count({ where: { status: 'PENDING' } }),
        completed: await prisma.withdrawal.count({ where: { status: 'COMPLETED' } }),
        rejected: await prisma.withdrawal.count({ where: { status: 'REJECTED' } }),
      };

      expect(stats.total).toBeGreaterThanOrEqual(3);
      expect(stats.pending).toBeGreaterThanOrEqual(1);
      expect(stats.completed).toBeGreaterThanOrEqual(1);
      expect(stats.rejected).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Admin Authorization', () => {
    it('should verify admin role', async () => {
      const { user: admin } = await createTestAdmin();

      expect(admin.role).toBe('ADMIN');
    });

    it('should distinguish admin from other roles', async () => {
      const { user: buyer } = await createTestUser('BUYER');
      const { user: seller } = await createTestSeller();
      const { user: admin } = await createTestAdmin();

      expect(buyer.role).not.toBe('ADMIN');
      expect(seller.role).not.toBe('ADMIN');
      expect(admin.role).toBe('ADMIN');
    });
  });
});
