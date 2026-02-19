import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { successResponse, notFoundResponse, handleApiError, errorResponse } from '@/lib/api-response';
import { WalletService } from '@/services/wallet.service';
import { reviewWithdrawalSchema } from '@/lib/validations';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(['ADMIN']);
    const body = await req.json();
    
    // Validate input
    const validation = reviewWithdrawalSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('VALIDATION_ERROR', 'Invalid input', validation.error.errors);
    }

    const { status, reviewNotes } = validation.data;

    await WalletService.reviewWithdrawal(
      params.id,
      user.userId,
      status,
      reviewNotes
    );

    return successResponse({}, `Withdrawal ${status.toLowerCase()}`);
  } catch (error) {
    return handleApiError(error);
  }
}