import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';

// GET - List all projects for admin review
export async function GET(req: NextRequest) {
  try {
    await requireRole(['ADMIN']);
    
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status') || 'PENDING_REVIEW';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: {
          status: status as any,
        },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.project.count({
        where: {
          status: status as any,
        },
      }),
    ]);

    return successResponse(
      { projects },
      undefined,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
