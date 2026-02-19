import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Razorpay Webhook Handler
 * Handles payment.captured and payment.failed events
 * Verifies webhook signature for security
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const event = JSON.parse(body);
    const { event: eventType, payload } = event;

    console.log(`Received Razorpay webhook: ${eventType}`);

    // Handle payment.captured event
    if (eventType === 'payment.captured') {
      await handlePaymentCaptured(payload.payment.entity);
    }
    
    // Handle payment.failed event
    else if (eventType === 'payment.failed') {
      await handlePaymentFailed(payload.payment.entity);
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment capture
 */
async function handlePaymentCaptured(payment: any) {
  const paymentId = payment.id;
  const paymentOrderId = payment.order_id;
  const amount = payment.amount; // in paise

  console.log(`Processing payment.captured: ${paymentId} for order ${paymentOrderId}`);

  // Find order by Razorpay order ID
  const order = await prisma.order.findFirst({
    where: { paymentOrderId },
    include: {
      project: {
        include: { seller: true },
      },
      buyer: true,
    },
  });

  if (!order) {
    console.error(`Order not found for paymentOrderId: ${paymentOrderId}`);
    return;
  }

  // Check if already processed (idempotency)
  if (order.status === 'PAYMENT_COMPLETED' || order.status === 'COMPLETED') {
    console.log(`Order ${order.id} already processed, skipping`);
    return;
  }

  // Process payment in transaction
  await prisma.$transaction(async (tx) => {
    // Update order status
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: 'COMPLETED',
        paymentId,
        paidAt: new Date(),
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Calculate seller earnings (already stored in order)
    const sellerEarning = Number(order.sellerEarning);
    
    // Get seller's current balance
    const seller = await tx.user.findUnique({
      where: { id: order.project.sellerId },
      select: { walletBalance: true },
    });

    if (!seller) {
      throw new Error(`Seller not found: ${order.project.sellerId}`);
    }

    const currentBalance = Number(seller.walletBalance);
    const newBalance = currentBalance + sellerEarning;

    // Update seller wallet balance
    await tx.user.update({
      where: { id: order.project.sellerId },
      data: {
        walletBalance: new Decimal(newBalance),
      },
    });

    // Create wallet transaction record
    await tx.walletTransaction.create({
      data: {
        userId: order.project.sellerId,
        type: 'CREDIT',
        source: 'SALE',
        amount: new Decimal(sellerEarning),
        balanceBefore: new Decimal(currentBalance),
        balanceAfter: new Decimal(newBalance),
        orderId: order.id,
        description: `Sale of "${order.project.title}" to ${order.buyer.name}`,
        metadata: {
          paymentId,
          paymentOrderId,
          buyerEmail: order.buyer.email,
        },
      },
    });

    // Update project sales count
    await tx.project.update({
      where: { id: order.projectId },
      data: {
        salesCount: { increment: 1 },
      },
    });

    console.log(`Payment processed successfully for order ${order.id}`);
    console.log(`Seller ${order.project.seller.name} credited ₹${sellerEarning}`);
  });

  // Send email notifications (non-blocking)
  // Note: Email service should be imported if available
  // EmailService.sendOrderConfirmation(...).catch(console.error);
  // EmailService.sendSaleNotification(...).catch(console.error);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(payment: any) {
  const paymentOrderId = payment.order_id;
  const errorCode = payment.error_code;
  const errorDescription = payment.error_description;

  console.log(`Processing payment.failed for order ${paymentOrderId}: ${errorCode}`);

  // Find order by Razorpay order ID
  const order = await prisma.order.findFirst({
    where: { paymentOrderId },
  });

  if (!order) {
    console.error(`Order not found for paymentOrderId: ${paymentOrderId}`);
    return;
  }

  // Check if already marked as failed
  if (order.status === 'PAYMENT_FAILED') {
    console.log(`Order ${order.id} already marked as failed, skipping`);
    return;
  }

  // Update order status to failed
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'PAYMENT_FAILED',
      updatedAt: new Date(),
      refundReason: `Payment failed: ${errorCode} - ${errorDescription}`,
    },
  });

  console.log(`Order ${order.id} marked as PAYMENT_FAILED`);

  // Send email notification to buyer (non-blocking)
  // EmailService.sendPaymentFailedNotification(...).catch(console.error);
}
