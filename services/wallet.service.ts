import { prisma } from '@/lib/db';
import { PlatformSettingsService } from './platform-settings.service';
import { EmailService } from './email.service';
import { generateWithdrawalNumber } from '@/lib/utils';
import { Decimal } from '@prisma/client/runtime/library';

export class WalletService {
  static async getBalance(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true },
    });

    return user ? Number(user.walletBalance) : 0;
  }

  static async getTransactions(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          order: {
            include: {
              project: true,
            },
          },
          withdrawal: true,
        },
      }),
      prisma.walletTransaction.count({
        where: { userId },
      }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async createWithdrawal(userId: string, amount: number): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        walletBalance: true,
        bankName: true,
        accountNumber: true,
        ifscCode: true,
        accountHolderName: true,
        upiId: true,
        email: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Validate bank details
    if (!user.bankName || !user.accountNumber || !user.ifscCode || !user.accountHolderName) {
      throw new Error('Please complete your bank details before requesting a withdrawal');
    }

    // Check minimum withdrawal
    const minWithdrawal = await PlatformSettingsService.getMinimumWithdrawal();
    if (amount < minWithdrawal) {
      throw new Error(`Minimum withdrawal amount is ₹${minWithdrawal}`);
    }

    // Check balance
    const currentBalance = Number(user.walletBalance);
    if (amount > currentBalance) {
      throw new Error('Insufficient balance');
    }

    // Create withdrawal in transaction
    const withdrawal = await prisma.$transaction(async (tx) => {
      // Deduct from wallet
      const newBalance = currentBalance - amount;

      await tx.user.update({
        where: { id: userId },
        data: {
          walletBalance: new Decimal(newBalance),
        },
      });

      // Create withdrawal record
      const withdrawalNumber = await generateWithdrawalNumber();
      const withdrawal = await tx.withdrawal.create({
        data: {
          withdrawalNumber,
          sellerId: userId,
          amount: new Decimal(amount),
          bankDetailsSnapshot: {
            bankName: user.bankName,
            accountNumber: user.accountNumber,
            ifscCode: user.ifscCode,
            accountHolderName: user.accountHolderName,
            upiId: user.upiId,
          },
          status: 'PENDING',
        },
      });

      // Create wallet transaction
      await tx.walletTransaction.create({
        data: {
          userId,
          type: 'DEBIT',
          source: 'WITHDRAWAL',
          amount: new Decimal(amount),
          balanceBefore: new Decimal(currentBalance),
          balanceAfter: new Decimal(newBalance),
          withdrawalId: withdrawal.id,
          description: `Withdrawal request ${withdrawalNumber}`,
        },
      });

      return withdrawal;
    });

    // Send email
    EmailService.sendWithdrawalRequest(
      user.email,
      user.name,
      {
        withdrawalNumber: withdrawal.withdrawalNumber,
        amount,
      }
    ).catch(console.error);

    return withdrawal.withdrawalNumber;
  }

  static async getWithdrawals(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where: { sellerId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.withdrawal.count({
        where: { sellerId: userId },
      }),
    ]);

    return {
      withdrawals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getPendingWithdrawals() {
    return prisma.withdrawal.findMany({
      where: {
        status: { in: ['PENDING', 'APPROVED', 'PROCESSING'] },
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async reviewWithdrawal(
    withdrawalId: string,
    adminId: string,
    status: 'APPROVED' | 'REJECTED',
    reviewNotes?: string
  ): Promise<void> {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { seller: true },
    });

    if (!withdrawal) {
      throw new Error('Withdrawal not found');
    }

    if (withdrawal.status !== 'PENDING') {
      throw new Error('Withdrawal has already been reviewed');
    }

    if (status === 'APPROVED') {
      await prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: 'APPROVED',
          reviewedBy: adminId,
          reviewedAt: new Date(),
          reviewNotes,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: adminId,
          action: 'WITHDRAWAL_APPROVED',
          entityType: 'WITHDRAWAL',
          entityId: withdrawalId,
          changes: {
            withdrawalNumber: withdrawal.withdrawalNumber,
            amount: Number(withdrawal.amount),
            seller: withdrawal.seller.email,
          },
        },
      });
    } else {
      // Rejected - refund to wallet
      await prisma.$transaction(async (tx) => {
        // Get current balance
        const seller = await tx.user.findUnique({
          where: { id: withdrawal.sellerId },
          select: { walletBalance: true },
        });

        const currentBalance = Number(seller!.walletBalance);
        const refundAmount = Number(withdrawal.amount);
        const newBalance = currentBalance + refundAmount;

        // Refund to wallet
        await tx.user.update({
          where: { id: withdrawal.sellerId },
          data: {
            walletBalance: new Decimal(newBalance),
          },
        });

        // Update withdrawal
        await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: 'REJECTED',
            reviewedBy: adminId,
            reviewedAt: new Date(),
            rejectedAt: new Date(),
            reviewNotes,
          },
        });

        // Create refund transaction
        await tx.walletTransaction.create({
          data: {
            userId: withdrawal.sellerId,
            type: 'CREDIT',
            source: 'REFUND',
            amount: new Decimal(refundAmount),
            balanceBefore: new Decimal(currentBalance),
            balanceAfter: new Decimal(newBalance),
            withdrawalId: withdrawal.id,
            description: `Refund for rejected withdrawal ${withdrawal.withdrawalNumber}`,
          },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: adminId,
            action: 'WITHDRAWAL_REJECTED',
            entityType: 'WITHDRAWAL',
            entityId: withdrawalId,
            changes: {
              withdrawalNumber: withdrawal.withdrawalNumber,
              amount: refundAmount,
              reason: reviewNotes,
            },
          },
        });
      });
    }
  }

  static async completeWithdrawal(
    withdrawalId: string,
    adminId: string,
    transactionId: string,
    paymentProof?: string
  ): Promise<void> {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { seller: true },
    });

    if (!withdrawal) {
      throw new Error('Withdrawal not found');
    }

    if (!['APPROVED', 'PROCESSING'].includes(withdrawal.status)) {
      throw new Error('Withdrawal is not in a state that can be completed');
    }

    await prisma.$transaction(async (tx) => {
      await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          transactionId,
          paymentProof,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: 'WITHDRAWAL_COMPLETED',
          entityType: 'WITHDRAWAL',
          entityId: withdrawalId,
          changes: {
            withdrawalNumber: withdrawal.withdrawalNumber,
            amount: Number(withdrawal.amount),
            transactionId,
          },
        },
      });
    });

    // Send email
    EmailService.sendWithdrawalCompleted(
      withdrawal.seller.email,
      withdrawal.seller.name,
      {
        withdrawalNumber: withdrawal.withdrawalNumber,
        amount: Number(withdrawal.amount),
        transactionId,
      }
    ).catch(console.error);
  }
}
