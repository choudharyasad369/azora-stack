import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, notFoundResponse, handleApiError } from '@/lib/api-response';
import { updateProjectSchema } from '@/lib/validations';
import { Decimal } from '@prisma/client/runtime/library';

// GET - Get single project
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
          },
        },
      },
    });

    if (!project) {
      return notFoundResponse('Project not found');
    }

    // Increment view count
    await prisma.project.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    });

    return successResponse({ project });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT - Update project (Seller only, own projects)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    // Find project
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return notFoundResponse('Project not found');
    }

    // Check ownership (unless admin)
    if (project.sellerId !== user.userId && user.role !== 'ADMIN') {
      return errorResponse('FORBIDDEN', 'You do not have permission to update this project', undefined, 403);
    }

    // Validate input
    const validation = updateProjectSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('VALIDATION_ERROR', 'Invalid input', validation.error.errors);
    }

    const data = validation.data;

    // Update project
    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.shortDescription) updateData.shortDescription = data.shortDescription;
    if (data.description) updateData.description = data.description;
    if (data.price) updateData.price = new Decimal(data.price);
    if (data.techStack) updateData.techStack = data.techStack;
    if (data.difficulty) updateData.difficulty = data.difficulty;
    if (data.demoUrl !== undefined) updateData.demoUrl = data.demoUrl || null;
    if (data.documentationUrl !== undefined) updateData.documentationUrl = data.documentationUrl || null;

    // Reset status to pending review if content changed
    if (Object.keys(updateData).length > 0) {
      updateData.status = 'PENDING_REVIEW';
    }

    const updated = await prisma.project.update({
      where: { id: params.id },
      data: updateData,
    });

    return successResponse({ project: updated }, 'Project updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - Delete project (Seller only, own projects)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    // Find project
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return notFoundResponse('Project not found');
    }

    // Check ownership (unless admin)
    if (project.sellerId !== user.userId && user.role !== 'ADMIN') {
      return errorResponse('FORBIDDEN', 'You do not have permission to delete this project', undefined, 403);
    }

    // Check if project has orders
    const ordersCount = await prisma.order.count({
      where: { projectId: params.id },
    });

    if (ordersCount > 0) {
      return errorResponse('CANNOT_DELETE', 'Cannot delete project with existing orders. Archive it instead.');
    }

    // Delete project
    await prisma.project.delete({
      where: { id: params.id },
    });

    return successResponse({}, 'Project deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}