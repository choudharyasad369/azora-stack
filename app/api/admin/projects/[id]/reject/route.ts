import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { successResponse, notFoundResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { EmailService } from '@/services/email.service';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(['ADMIN']);
    const body = await req.json();

    const { reason } = body;

    if (!reason) {
      return errorResponse('VALIDATION_ERROR', 'Rejection reason is required');
    }

    // Find project
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        seller: true,
      },
    });

    if (!project) {
      return notFoundResponse('Project not found');
    }

    // Update project status
    const updated = await prisma.project.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'PROJECT_REJECTED',
        entityType: 'PROJECT',
        entityId: params.id,
        changes: {
          projectTitle: project.title,
          seller: project.seller.email,
          reason: reason,
        },
      },
    });

    // Send email to seller
    EmailService.sendProjectRejected(
      project.seller.email,
      project.title,
      reason
    ).catch(console.error);

    return successResponse({ project: updated }, 'Project rejected');
  } catch (error) {
    return handleApiError(error);
  }
}

// Also support PUT for backward compatibility
export { POST as PUT };