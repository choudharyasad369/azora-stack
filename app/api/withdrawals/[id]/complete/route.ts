import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { WalletService } from '@/services/wallet.service';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(['ADMIN']);
    const body = await req.json();

    const { transactionId, paymentProof } = body;

    if (!transactionId) {
      return errorResponse('VALIDATION_ERROR', 'Transaction ID is required');
    }

    await WalletService.completeWithdrawal(
      params.id,
      user.userId,
      transactionId,
      paymentProof
    );

    return successResponse({}, 'Withdrawal marked as completed');
  } catch (error) {
    return handleApiError(error);
  }
}