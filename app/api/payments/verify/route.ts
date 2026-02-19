import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError, unauthorizedResponse } from '@/lib/api-response';
import { PaymentService } from '@/services/payment.service';
import { verifyPaymentSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    
    // Validate input
    const validation = verifyPaymentSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('VALIDATION_ERROR', 'Invalid input', validation.error.errors);
    }

    const { orderId, razorpay_payment_id, razorpay_signature } = validation.data;

    // Process payment
    await PaymentService.processSuccessfulPayment(
      orderId,
      razorpay_payment_id,
      razorpay_signature
    );

    return successResponse({
      orderId,
      paymentId: razorpay_payment_id,
    }, 'Payment verified successfully');

  } catch (error) {
    return handleApiError(error);
  }
}
