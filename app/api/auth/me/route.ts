import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedResponse, handleApiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const tokenPayload = await getCurrentUser();
    
    if (!tokenPayload) {
      return unauthorizedResponse();
    }

    // Get fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: tokenPayload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        status: true,
      },
    });

    if (!user) {
      return unauthorizedResponse();
    }

    // Check if user is suspended
    if (user.status === 'SUSPENDED') {
      return unauthorizedResponse('Account suspended');
    }

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}