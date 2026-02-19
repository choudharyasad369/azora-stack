import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await requireRole(['ADMIN']);

    // Get counts
    const [
      totalUsers,
      totalProjects,
      totalOrders,
      pendingProjects,
      pendingWithdrawals,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count({ where: { status: 'APPROVED' } }),
      prisma.order.count({ where: { status: 'PAYMENT_COMPLETED' } }),
      prisma.project.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.withdrawal.count({ where: { status: 'PENDING' } }),
    ]);

    // Calculate platform revenue (sum of all commissions)
    const revenueData = await prisma.order.aggregate({
      where: { status: 'PAYMENT_COMPLETED' },
      _sum: { platformCommission: true },
    });

    const platformRevenue = revenueData._sum.platformCommission || 0;

    // Get top sellers
    const topSellers = await prisma.user.findMany({
      where: { role: 'SELLER' },
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: { projects: true },
        },
      },
      orderBy: {
        projects: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    // Revenue chart data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueByDay = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        status: 'PAYMENT_COMPLETED',
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _sum: {
        platformCommission: true,
      },
    });

    return successResponse({
      stats: {
        totalUsers,
        totalProjects,
        totalOrders,
        platformRevenue: Number(platformRevenue),
        pendingProjects,
        pendingWithdrawals,
      },
      topSellers,
      revenueChart: revenueByDay.map(item => ({
        date: item.createdAt.toISOString().split('T')[0],
        revenue: Number(item._sum.platformCommission || 0),
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}