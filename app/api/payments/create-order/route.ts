import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { successResponse, handleApiError, unauthorizedResponse } from '@/lib/api-response';
import { PaymentService } from '@/services/payment.service';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return unauthorizedResponse();
    }

    const { projectId } = await req.json();

    if (!projectId) {
      return successResponse({ error: 'Project ID is required' }, '', undefined);
    }

    const orderData = await PaymentService.createRazorpayOrder(projectId, user.userId);

    return successResponse({
      ...orderData,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    }, 'Order created successfully');

  } catch (error) {
    return handleApiError(error);
  }
}
