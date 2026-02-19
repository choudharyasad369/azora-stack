import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(['SELLER', 'ADMIN']);
    const sellerId = user.userId;

    // Fetch all data in parallel for better performance
    const [
      projects,
      totalSales,
      walletBalance,
      recentSales,
      totalRevenue,
    ] = await Promise.all([
      // Get all projects with their stats
      prisma.project.findMany({
        where: { sellerId },
        select: {
          id: true,
          title: true,
          status: true,
          price: true,
          salesCount: true,
          viewCount: true,
          createdAt: true,
          publishedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Get total sales count
      prisma.order.count({
        where: {
          project: { sellerId },
          status: 'COMPLETED',
        },
      }),

      // Get current wallet balance
      prisma.user.findUnique({
        where: { id: sellerId },
        select: { walletBalance: true },
      }),

      // Get recent sales (last 10)
      prisma.order.findMany({
        where: {
          project: { sellerId },
          status: 'COMPLETED',
        },
        include: {
          project: {
            select: {
              title: true,
            },
          },
          buyer: {
            select: {
              email: true,
              name: true,
            },
          },
        },
        orderBy: { paidAt: 'desc' },
        take: 10,
      }),

      // Calculate total revenue
      prisma.walletTransaction.aggregate({
        where: {
          userId: sellerId,
          type: 'CREDIT',
          source: 'SALE',
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    // Calculate stats
    const stats = {
      totalProjects: projects.length,
      approvedProjects: projects.filter(p => p.status === 'APPROVED').length,
      pendingProjects: projects.filter(p => p.status === 'PENDING_REVIEW').length,
      rejectedProjects: projects.filter(p => p.status === 'REJECTED').length,
      draftProjects: projects.filter(p => p.status === 'DRAFT').length,
      totalSales,
      totalRevenue: totalRevenue._sum.amount || 0,
      walletBalance: walletBalance?.walletBalance || 0,
    };

    // Format recent sales
    const formattedRecentSales = recentSales.map(sale => ({
      id: sale.id,
      projectTitle: sale.project.title,
      buyer: sale.buyer.email,
      buyerName: sale.buyer.name,
      amount: sale.sellerEarning,
      date: sale.paidAt,
      orderNumber: sale.orderNumber,
    }));

    // Format projects for display
    const formattedProjects = projects.map(project => ({
      id: project.id,
      title: project.title,
      status: project.status,
      price: project.price,
      sales: project.salesCount,
      views: project.viewCount,
      revenue: Number(project.price) * project.salesCount * 0.5, // 50% commission
      publishedAt: project.publishedAt,
      createdAt: project.createdAt,
    }));

    return successResponse({
      stats,
      projects: formattedProjects,
      recentSales: formattedRecentSales,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
