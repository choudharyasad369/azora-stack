/**
 * Centralized Razorpay Client Configuration
 * 
 * This module provides a reusable Razorpay instance for the application.
 * In production, install the official Razorpay SDK: npm install razorpay
 */

// Uncomment when Razorpay SDK is installed:
// import Razorpay from 'razorpay';

interface RazorpayConfig {
  keyId: string;
  keySecret: string;
}

/**
 * Get Razorpay configuration from environment variables
 */
export function getRazorpayConfig(): RazorpayConfig {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
  }

  return {
    keyId,
    keySecret,
  };
}

/**
 * Create Razorpay instance
 * 
 * Usage:
 * ```typescript
 * import { razorpay } from '@/lib/razorpay';
 * 
 * const order = await razorpay.orders.create({
 *   amount: 50000, // amount in paise
 *   currency: 'INR',
 *   receipt: 'order_rcptid_11'
 * });
 * ```
 */
export function createRazorpayInstance() {
  const config = getRazorpayConfig();
  
  // When Razorpay SDK is installed, uncomment:
  // return new Razorpay({
  //   key_id: config.keyId,
  //   key_secret: config.keySecret,
  // });

  // Temporary mock for development (replace with actual SDK)
  return {
    keyId: config.keyId,
    keySecret: config.keySecret,
    orders: {
      create: async (options: any) => {
        // Mock implementation - replace with actual SDK call
        console.warn('Using mock Razorpay client. Install razorpay package for production.');
        return {
          id: `order_${Date.now()}`,
          entity: 'order',
          amount: options.amount,
          currency: options.currency,
          receipt: options.receipt,
          status: 'created',
        };
      },
      fetch: async (orderId: string) => {
        console.warn('Using mock Razorpay client. Install razorpay package for production.');
        return {
          id: orderId,
          entity: 'order',
          status: 'created',
        };
      },
    },
    payments: {
      fetch: async (paymentId: string) => {
        console.warn('Using mock Razorpay client. Install razorpay package for production.');
        return {
          id: paymentId,
          entity: 'payment',
          status: 'captured',
        };
      },
    },
  };
}

/**
 * Singleton Razorpay instance
 */
export const razorpay = createRazorpayInstance();

/**
 * Razorpay webhook secret for signature verification
 */
export function getRazorpayWebhookSecret(): string {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
  if (!secret) {
    throw new Error('RAZORPAY_WEBHOOK_SECRET not configured in .env');
  }
  
  return secret;
}
