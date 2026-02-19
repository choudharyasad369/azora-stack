import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(['BUYER', 'SELLER', 'ADMIN']);
    const buyerId = user.userId;

    // Fetch orders with project details
    const orders = await prisma.order.findMany({
      where: { buyerId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            techStack: true,
            seller: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate stats
    const stats = {
      totalOrders: orders.length,
      completedOrders: orders.filter(o => o.status === 'COMPLETED').length,
      totalSpent: orders
        .filter(o => o.status === 'COMPLETED')
        .reduce((sum, o) => sum + Number(o.projectPrice), 0),
      availableDownloads: orders.filter(o => o.status === 'COMPLETED').length,
    };

    // Format orders
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      projectId: order.project.id,
      projectTitle: order.project.title,
      projectSlug: order.project.slug,
      projectThumbnail: order.project.thumbnailUrl,
      projectTechStack: order.project.techStack,
      sellerName: order.project.seller.name,
      price: order.projectPrice,
      downloadUrl: order.downloadUrl,
      downloadExpiresAt: order.downloadExpiresAt,
      downloadCount: order.downloadCount,
      lastDownloadAt: order.lastDownloadAt,
      paidAt: order.paidAt,
      createdAt: order.createdAt,
    }));

    return successResponse({
      stats,
      orders: formattedOrders,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
