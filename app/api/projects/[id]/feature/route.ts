import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, handleApiError, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-response';

/**
 * POST /api/projects/[id]/feature
 * Feature a project for 30 days
 * Only project owner can feature their project
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    if (!user) {
      return unauthorizedResponse();
    }

    const projectId = params.id;

    // Find project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        title: true,
        sellerId: true,
        status: true,
        isFeatured: true,
        featuredUntil: true,
      },
    });

    if (!project) {
      return notFoundResponse('Project not found');
    }

    // Verify ownership
    if (project.sellerId !== user.userId) {
      return forbiddenResponse('You can only feature your own projects');
    }

    // Verify project is approved
    if (project.status !== 'APPROVED') {
      return errorResponse(
        'PROJECT_NOT_APPROVED',
        'Only approved projects can be featured',
        { status: project.status }
      );
    }

    // Check if already featured and not expired
    if (project.isFeatured && project.featuredUntil) {
      const now = new Date();
      if (project.featuredUntil > now) {
        return errorResponse(
          'ALREADY_FEATURED',
          'Project is already featured',
          {
            featuredUntil: project.featuredUntil,
            daysRemaining: Math.ceil(
              (project.featuredUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            ),
          }
        );
      }
    }

    // Calculate featured until date (30 days from now)
    const now = new Date();
    const featuredUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Update project to featured
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        isFeatured: true,
        featuredUntil,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        isFeatured: true,
        featuredUntil: true,
      },
    });

    return successResponse(
      {
        project: updatedProject,
        message: 'Project featured successfully for 30 days',
      },
      'Project featured successfully'
    );

  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/projects/[id]/feature
 * Remove featured status from a project
 * Only project owner can unfeature their project
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    if (!user) {
      return unauthorizedResponse();
    }

    const projectId = params.id;

    // Find project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        title: true,
        sellerId: true,
        isFeatured: true,
      },
    });

    if (!project) {
      return notFoundResponse('Project not found');
    }

    // Verify ownership
    if (project.sellerId !== user.userId) {
      return forbiddenResponse('You can only unfeature your own projects');
    }

    if (!project.isFeatured) {
      return errorResponse(
        'NOT_FEATURED',
        'Project is not currently featured'
      );
    }

    // Remove featured status
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        isFeatured: false,
        featuredUntil: null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        isFeatured: true,
      },
    });

    return successResponse(
      {
        project: updatedProject,
      },
      'Featured status removed successfully'
    );

  } catch (error) {
    return handleApiError(error);
  }
}
