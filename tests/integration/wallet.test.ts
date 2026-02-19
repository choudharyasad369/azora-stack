/**
 * Wallet Integration Tests
 * Tests wallet balance, transactions, and withdrawals
 */

import { prisma } from '@/lib/db';
import {
  createTestSeller,
} from '../helpers/test-utils';
import { Decimal } from '@prisma/client/runtime/library';

describe('Wallet Integration Tests', () => {
  describe('Wallet Balance', () => {
    it('should initialize wallet balance to zero', async () => {
      const { user: seller } = await createTestSeller({ walletBalance: 0 });

      expect(Number(seller.walletBalance)).toBe(0);
    });

    it('should get current wallet balance', async () => {
      const { user: seller } = await createTestSeller({ walletBalance: 5000 });

      const user = await prisma.user.findUnique({
        where: { id: seller.id },
        select: { walletBalance: true },
      });

      expect(Number(user?.walletBalance)).toBe(5000);
    });

    it('should update wallet balance', async () => {
      const { user: seller } = await createTestSeller({ walletBalance: 1000 });

      const updatedUser = await prisma.user.update({
        where: { id: seller.id },
        data: { walletBalance: new Decimal(3000) },
      });

      expect(Number(updatedUser.walletBalance)).toBe(3000);
    });

    it('should handle decimal wallet balance', async () => {
      const { user: seller } = await createTestSeller({ walletBalance: 1234.56 });

      expect(Number(seller.walletBalance)).toBe(1234.56);
    });
  });

  describe('Wallet Transactions', () => {
    it('should create credit transaction', async () => {
      const { user: seller } = await createTestSeller({ walletBalance: 0 });

      const transaction = await prisma.walletTransaction.create({
        data: {
          userId: seller.id,
          type: 'CREDIT',
          source: 'SALE',
          amount: new Decimal(5000),
          balanceBefore: new Decimal(0),
          balanceAfter: new Decimal(5000),
          description: 'Sale of project',
        },
      });

      expect(transaction).toBeDefined();
      expect(transaction.type).toBe('CREDIT');
      expect(transaction.source).toBe('SALE');
      expect(Number(transaction.amount)).toBe(5000);
    });

    it('should create debit transaction', async () => {
      const { user: seller } = await createTestSeller({ walletBalance: 5000 });

      const transaction = await prisma.walletTransaction.create({
        data: {
          userId: seller.id,
          type: 'DEBIT',
          source: 'WITHDRAWAL',
          amount: new Decimal(2000),
          balanceBefore: new Decimal(5000),
          balanceAfter: new Decimal(3000),
          description: 'Withdrawal request',
        },
      });

      expect(transaction).toBeDefined();
      expect(transaction.type).toBe('DEBIT');
      expect(transaction.source).toBe('WITHDRAWAL');
      expect(Number(transaction.amount)).toBe(2000);
    });

    it('should fetch transaction history', async () => {
      const { user: seller } = await createTestSeller();

      await prisma.walletTransaction.create({
        data: {
          userId: seller.id,
          type: 'CREDIT',
          source: 'SALE',
          amount: new Decimal(1000),
          balanceBefore: new Decimal(0),
          balanceAfter: new Decimal(1000),
          description: 'Transaction 1',
        },
      });

      await prisma.walletTransaction.create({
        data: {
          userId: seller.id,
          type: 'CREDIT',
          source: 'SALE',
          amount: new Decimal(2000),
          balanceBefore: new Decimal(1000),
          balanceAfter: new Decimal(3000),
          description: 'Transaction 2',
        },
      });

      const transactions = await prisma.walletTransaction.findMany({
        where: { userId: seller.id },
        orderBy: { createdAt: 'desc' },
      });

      expect(transactions).toHaveLength(2);
      expect(transactions[0].description).toBe('Transaction 2');
      expect(transactions[1].description).toBe('Transaction 1');
    });

    it('should track balance before and after', async () => {
      const { user: seller } = await createTestSeller({ walletBalance: 1000 });

      const transaction = await prisma.walletTransaction.create({
        data: {
          userId: seller.id,
          type: 'CREDIT',
          source: 'SALE',
          amount: new Decimal(500),
          balanceBefore: new Decimal(1000),
          balanceAfter: new Decimal(1500),
          description: 'Balance tracking test',
        },
      });

      expect(Number(transaction.balanceBefore)).toBe(1000);
      expect(Number(transaction.balanceAfter)).toBe(1500);
      expect(Number(transaction.balanceAfter) - Number(transaction.balanceBefore)).toBe(500);
    });
  });

  describe('Withdrawal Requests', () => {
    it('should create withdrawal request', async () => {
      const { user: seller } = await createTestSeller({ walletBalance: 10000 });

      const withdrawal = await prisma.withdrawal.create({
        data: {
          withdrawalNumber: `WD-TEST-${Date.now()}`,
          sellerId: seller.id,
          amount: new Decimal(5000),
          bankDetailsSnapshot: {
            bankName: seller.bankName,
            accountNumber: seller.accountNumber,
            ifscCode: seller.ifscCode,
            accountHolderName: seller.accountHolderName,
          },
          status: 'PENDING',
        },
      });

      expect(withdrawal).toBeDefined();
      expect(withdrawal.sellerId).toBe(seller.id);
      expect(Number(withdrawal.amount)).toBe(5000);
      expect(withdrawal.status).toBe('PENDING');
    });

    it('should store bank details snapshot', async () => {
      const { user: seller } = await createTestSeller({
        walletBalance: 10000,
        bankName: 'Test Bank',
        accountNumber: '1234567890',
        ifscCode: 'TEST0001234',
        accountHolderName: 'Test Seller',
      });

      const withdrawal = await prisma.withdrawal.create({
        data: {
          withdrawalNumber: `WD-TEST-${Date.now()}`,
          sellerId: seller.id,
          amount: new Decimal(3000),
          bankDetailsSnapshot: {
            bankName: seller.bankName,
            accountNumber: seller.accountNumber,
            ifscCode: seller.ifscCode,
            accountHolderName: seller.accountHolderName,
          },
          status: 'PENDING',
        },
      });

      const snapshot = withdrawal.bankDetailsSnapshot as any;
      expect(snapshot.bankName).toBe('Test Bank');
      expect(snapshot.accountNumber).toBe('1234567890');
      expect(snapshot.ifscCode).toBe('TEST0001234');
    });

    it('should deduct amount from wallet on withdrawal request', async () => {
      const { user: seller } = await createTestSeller({ walletBalance: 10000 });

      const withdrawalAmount = 3000;
      const newBalance = Number(seller.walletBalance) - withdrawalAmount;

      await prisma.user.update({
        where: { id: seller.id },
        data: { walletBalance: new Decimal(newBalance) },
      });

      const updatedSeller = await prisma.user.findUnique({
        where: { id: seller.id },
      });

      expect(Number(updatedSeller?.walletBalance)).toBe(7000);
    });

    it('should fetch pending withdrawals', async () => {
      const { user: seller } = await createTestSeller({ walletBalance: 10000 });

      await prisma.withdrawal.create({
        data: {
          withdrawalNumber: `WD-TEST-1-${Date.now()}`,
          sellerId: seller.id,
          amount: new Decimal(2000),
          bankDetailsSnapshot: {},
          status: 'PENDING',
        },
      });

      await prisma.withdrawal.create({
        data: {
          withdrawalNumber: `WD-TEST-2-${Date.now()}`,
          sellerId: seller.id,
          amount: new Decimal(3000),
          bankDetailsSnapshot: {},
          status: 'COMPLETED',
        },
      });

      const pendingWithdrawals = await prisma.withdrawal.findMany({
        where: {
          sellerId: seller.id,
          status: 'PENDING',
        },
      });

      expect(pendingWithdrawals).toHaveLength(1);
      expect(pendingWithdrawals[0].status).toBe('PENDING');
    });

    it('should update withdrawal status to COMPLETED', async () => {
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

      const completedWithdrawal = await prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: 'COMPLETED',
          transactionId: 'TXN123456',
          completedAt: new Date(),
        },
      });

      expect(completedWithdrawal.status).toBe('COMPLETED');
      expect(completedWithdrawal.transactionId).toBe('TXN123456');
      expect(completedWithdrawal.completedAt).toBeDefined();
    });

    it('should reject withdrawal with reason', async () => {
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
          reviewNotes: 'Invalid bank details',
          rejectedAt: new Date(),
        },
      });

      expect(rejectedWithdrawal.status).toBe('REJECTED');
      expect(rejectedWithdrawal.reviewNotes).toBe('Invalid bank details');
      expect(rejectedWithdrawal.rejectedAt).toBeDefined();
    });
  });

  describe('Withdrawal Validation', () => {
    it('should verify seller has sufficient balance', async () => {
      const { user: seller } = await createTestSeller({ walletBalance: 1000 });

      const withdrawalAmount = 2000;
      const hasSufficientBalance = Number(seller.walletBalance) >= withdrawalAmount;

      expect(hasSufficientBalance).toBe(false);
    });

    it('should verify bank details are complete', async () => {
      const { user: seller } = await createTestSeller({
        bankName: 'Test Bank',
        accountNumber: '1234567890',
        ifscCode: 'TEST0001234',
        accountHolderName: 'Test Seller',
      });

      const hasCompleteBankDetails = !!(
        seller.bankName &&
        seller.accountNumber &&
        seller.ifscCode &&
        seller.accountHolderName
      );

      expect(hasCompleteBankDetails).toBe(true);
    });
  });
});
