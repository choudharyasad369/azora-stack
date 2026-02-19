import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, notFoundResponse, handleApiError } from '@/lib/api-response';
import { StorageService } from '@/services/storage.service';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    // Find order
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        project: true,
      },
    });

    if (!order) {
      return notFoundResponse('Order not found');
    }

    // Check ownership
    if (order.buyerId !== user.userId && user.role !== 'ADMIN') {
      return errorResponse('FORBIDDEN', 'You do not have permission to download this order', undefined, 403);
    }

    // Check order status
    if (order.status !== 'PAYMENT_COMPLETED' && order.status !== 'COMPLETED') {
      return errorResponse('INVALID_STATUS', 'Order payment not completed');
    }

    // Check if download URL is still valid
    const now = new Date();
    if (order.downloadExpiresAt && order.downloadExpiresAt > now && order.downloadUrl) {
      // Update download count
      await prisma.order.update({
        where: { id: params.id },
        data: {
          downloadCount: { increment: 1 },
          lastDownloadAt: now,
        },
      });

      console.log(`✅ Returning existing download URL for order ${order.orderNumber}`);
      
      return successResponse({
        downloadUrl: order.downloadUrl,
        expiresAt: order.downloadExpiresAt,
        fileName: order.project.title,
      });
    }

    // Generate new signed URL
    console.log(`🔄 Generating new download URL for: ${order.project.fileUrl}`);
    
    const downloadUrl = await StorageService.generateSignedDownloadUrl(
      order.project.fileUrl,
      24 * 60 * 60 // 24 hours
    );

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Update order
    await prisma.order.update({
      where: { id: params.id },
      data: {
        downloadUrl,
        downloadExpiresAt: expiresAt,
        downloadCount: { increment: 1 },
        lastDownloadAt: now,
        status: 'COMPLETED',
      },
    });

    // Update project download count
    await prisma.project.update({
      where: { id: order.projectId },
      data: {
        downloadCount: { increment: 1 },
      },
    });

    console.log(`✅ New download URL generated for order ${order.orderNumber}`);

    return successResponse({
      downloadUrl,
      expiresAt,
      fileName: order.project.title,
    }, 'Download link generated');

  } catch (error) {
    console.error('❌ Download error:', error);
    return handleApiError(error);
  }
}