import crypto from 'crypto';
import { config } from '@/config/constants';
import { prisma } from '@/lib/db';
import { calculateCommission } from '@/lib/utils';
import { PlatformSettingsService } from './platform-settings.service';
import { EmailService } from './email.service';
import { Decimal } from '@prisma/client/runtime/library';

export interface RazorpayOrderOptions {
  amount: number; // in paise
  currency: string;
  receipt: string;
}

export class PaymentService {
  private static getRazorpayInstance() {
    // Note: In production, use the official Razorpay Node SDK
    return {
      keyId: config.razorpay.keyId,
      keySecret: config.razorpay.keySecret,
    };
  }

  static async createRazorpayOrder(
    projectId: string,
    buyerId: string
  ): Promise<{ orderId: string; amount: number; currency: string; orderNumber: string }> {
    // Fetch project with seller details
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { seller: true },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    if (project.status !== 'APPROVED') {
      throw new Error('Project is not available for purchase');
    }

    // Get current commission rate
    const commissionRate = await PlatformSettingsService.getCommissionRate();
    const price = Number(project.price);
    const { commission, sellerEarning } = calculateCommission(price, commissionRate);

    // Generate order number
    const orderNumber = `AZR-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        buyerId,
        projectId,
        projectPrice: new Decimal(price),
        platformCommission: new Decimal(commission),
        sellerEarning: new Decimal(sellerEarning),
        commissionRate: new Decimal(commissionRate),
        status: 'CREATED',
        paymentGateway: 'RAZORPAY',
      },
    });

    // Create Razorpay order
    // In production, use: const razorpayOrder = await razorpay.orders.create({...})
    const razorpayOrderId = `order_${crypto.randomBytes(12).toString('hex')}`;
    
    // Update order with Razorpay order ID
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentOrderId: razorpayOrderId },
    });

    return {
      orderId: order.id,
      amount: price * 100, // Convert to paise
      currency: 'INR',
      orderNumber,
    };
  }

  static verifyRazorpaySignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    const razorpay = this.getRazorpayInstance();
    const text = `${orderId}|${paymentId}`;
    const generated_signature = crypto
      .createHmac('sha256', razorpay.keySecret)
      .update(text)
      .digest('hex');

    return generated_signature === signature;
  }

  static async processSuccessfulPayment(
    orderId: string,
    paymentId: string,
    signature: string
  ): Promise<void> {
    // Verify signature
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: true,
        project: {
          include: { seller: true },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === 'PAYMENT_COMPLETED') {
      // Already processed (idempotency)
      return;
    }

    const isValid = this.verifyRazorpaySignature(
      order.paymentOrderId!,
      paymentId,
      signature
    );

    if (!isValid) {
      throw new Error('Invalid payment signature');
    }

    // Use transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Update order
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'PAYMENT_COMPLETED',
          paymentId,
          paymentSignature: signature,
          paidAt: new Date(),
        },
      });

      // Get seller's current balance
      const seller = await tx.user.findUnique({
        where: { id: order.project.sellerId },
        select: { walletBalance: true },
      });

      const currentBalance = Number(seller!.walletBalance);
      const sellerEarning = Number(order.sellerEarning);
      const newBalance = currentBalance + sellerEarning;

      // Credit seller wallet
      await tx.user.update({
        where: { id: order.project.sellerId },
        data: {
          walletBalance: new Decimal(newBalance),
        },
      });

      // Create wallet transaction
      await tx.walletTransaction.create({
        data: {
          userId: order.project.sellerId,
          type: 'CREDIT',
          source: 'SALE',
          amount: new Decimal(sellerEarning),
          balanceBefore: new Decimal(currentBalance),
          balanceAfter: new Decimal(newBalance),
          orderId: order.id,
          description: `Sale of ${order.project.title}`,
        },
      });

      // Update project stats
      await tx.project.update({
        where: { id: order.projectId },
        data: {
          salesCount: { increment: 1 },
        },
      });
    });

    // Send emails (non-blocking)
    EmailService.sendOrderConfirmation(
      order.buyer.email,
      order.buyer.name,
      {
        orderNumber: order.orderNumber,
        projectTitle: order.project.title,
        price: Number(order.projectPrice),
        downloadUrl: '', // Will be generated later
      }
    ).catch(console.error);

    EmailService.sendSaleNotification(
      order.project.seller.email,
      order.project.seller.name,
      {
        projectTitle: order.project.title,
        buyerEmail: order.buyer.email,
        saleAmount: Number(order.projectPrice),
        commission: Number(order.platformCommission),
        earnings: Number(order.sellerEarning),
      }
    ).catch(console.error);
  }

  static async handleWebhook(event: any): Promise<void> {
    // Handle Razorpay webhooks
    const { entity, event: eventType } = event;

    if (eventType === 'payment.captured') {
      // Payment was successful
      const paymentId = entity.id;
      const orderId = entity.order_id;

      const order = await prisma.order.findFirst({
        where: { paymentOrderId: orderId },
      });

      if (order && order.status === 'CREATED') {
        // Process the payment
        // Note: For webhooks, you might want to verify using a different method
        await this.processSuccessfulPayment(
          order.id,
          paymentId,
          '' // Signature not available in webhook
        );
      }
    } else if (eventType === 'payment.failed') {
      // Payment failed
      const orderId = entity.order_id;

      const order = await prisma.order.findFirst({
        where: { paymentOrderId: orderId },
      });

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'PAYMENT_FAILED' },
        });
      }
    }
  }
}
