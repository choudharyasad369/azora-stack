import { NextRequest } from 'next/server';
import { removeAuthCookie } from '@/lib/auth';
import { successResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  await removeAuthCookie();
  return successResponse({}, 'Logged out successfully');
}
