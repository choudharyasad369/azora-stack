import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { successResponse, notFoundResponse, handleApiError } from '@/lib/api-response';
import { EmailService } from '@/services/email.service';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(['ADMIN']);

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
        status: 'APPROVED',
        publishedAt: new Date(),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'PROJECT_APPROVED',
        entityType: 'PROJECT',
        entityId: params.id,
        changes: {
          projectTitle: project.title,
          seller: project.seller.email,
        },
      },
    });

    // Send email to seller
    EmailService.sendProjectApproved(
      project.seller.email,
      project.title,
      project.id
    ).catch(console.error);

    return successResponse({ project: updated }, 'Project approved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// Also support PUT for backward compatibility
export { POST as PUT };