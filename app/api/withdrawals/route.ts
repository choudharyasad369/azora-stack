import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { WalletService } from '@/services/wallet.service';
import { createWithdrawalSchema } from '@/lib/validations';

// GET - List user's withdrawals
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(['SELLER', 'ADMIN']);
    const searchParams = req.nextUrl.searchParams;
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const result = await WalletService.getWithdrawals(user.userId, page, limit);

    return successResponse(
      result.withdrawals,
      undefined,
      result.pagination
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Create withdrawal request
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['SELLER']);
    const body = await req.json();
    
    // Validate input
    const validation = createWithdrawalSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('VALIDATION_ERROR', 'Invalid input', validation.error.errors);
    }

    const { amount } = validation.data;

    const withdrawalNumber = await WalletService.createWithdrawal(user.userId, amount);

    return successResponse(
      { withdrawalNumber },
      'Withdrawal request created successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}