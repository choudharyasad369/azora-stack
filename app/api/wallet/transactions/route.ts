import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { WalletService } from '@/services/wallet.service';

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(['SELLER', 'ADMIN']);
    const searchParams = req.nextUrl.searchParams;
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const result = await WalletService.getTransactions(user.userId, page, limit);

    return successResponse(
      result.transactions,
      undefined,
      result.pagination
    );
  } catch (error) {
    return handleApiError(error);
  }
}