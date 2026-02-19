import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { WalletService } from '@/services/wallet.service';

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(['SELLER', 'ADMIN']);

    const balance = await WalletService.getBalance(user.userId);

    return successResponse({
      balance,
      currency: 'INR',
    });
  } catch (error) {
    return handleApiError(error);
  }
}