import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { generateOrderNumber } from '@/lib/utils';
import { Decimal } from '@prisma/client/runtime/library';
import { EmailService } from '@/services/email.service';
import { StorageService } from '@/services/storage.service';

export async function POST(req: NextRequest) {
  try {
    // Only admin can create manual orders
    const user = await requireRole(['ADMIN']);
    const body = await req.json();

    const { buyerId, projectId } = body;

    if (!buyerId || !projectId) {
      return errorResponse('VALIDATION_ERROR', 'Buyer ID and Project ID are required');
    }

    // Get buyer and project
    const [buyer, project] = await Promise.all([
      prisma.user.findUnique({ where: { id: buyerId } }),
      prisma.project.findUnique({
        where: { id: projectId },
        include: { seller: true },
      }),
    ]);

    if (!buyer) {
      return errorResponse('NOT_FOUND', 'Buyer not found');
    }

    if (!project) {
      return errorResponse('NOT_FOUND', 'Project not found');
    }

    // Calculate amounts
    const projectPrice = Number(project.price);
    const commissionRate = Number(project.commissionRate);
    const platformCommission = (projectPrice * commissionRate) / 100;
    const sellerEarning = projectPrice - platformCommission;

    // Create order
    const orderNumber = await generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        buyerId,
        projectId,
        projectPrice: new Decimal(projectPrice),
        platformCommission: new Decimal(platformCommission),
        sellerEarning: new Decimal(sellerEarning),
        commissionRate: project.commissionRate,
        status: 'PAYMENT_COMPLETED',
        paymentGateway: 'MANUAL',
        paidAt: new Date(),
      },
    });

    // Credit seller wallet
    await prisma.$transaction(async (tx) => {
      // Get current balance
      const seller = await tx.user.findUnique({
        where: { id: project.sellerId },
      });

      const currentBalance = Number(seller!.walletBalance);
      const newBalance = currentBalance + sellerEarning;

      // Update seller balance
      await tx.user.update({
        where: { id: project.sellerId },
        data: {
          walletBalance: new Decimal(newBalance),
        },
      });

      // Create wallet transaction
      await tx.walletTransaction.create({
        data: {
          userId: project.sellerId,
          type: 'CREDIT',
          source: 'SALE',
          amount: new Decimal(sellerEarning),
          balanceBefore: new Decimal(currentBalance),
          balanceAfter: new Decimal(newBalance),
          orderId: order.id,
          description: `Sale of "${project.title}"`,
        },
      });
    });

    // Update project stats
    await prisma.project.update({
      where: { id: projectId },
      data: {
        salesCount: { increment: 1 },
      },
    });

    // Generate download URL
    const downloadUrl = await StorageService.generateSignedDownloadUrl(
      project.fileUrl,
      24 * 60 * 60 // 24 hours
    );

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Update order with download URL
    await prisma.order.update({
      where: { id: order.id },
      data: {
        downloadUrl,
        downloadExpiresAt: expiresAt,
        status: 'COMPLETED',
      },
    });

    // Send emails
    try {
      await Promise.all([
        EmailService.sendOrderConfirmation(
          buyer.email,
          buyer.name,
          {
            orderNumber: order.orderNumber,
            projectTitle: project.title,
            price: projectPrice,
            downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/buyer`,
          }
        ),
        EmailService.sendSaleNotification(
          project.seller.email,
          project.seller.name,
          {
            projectTitle: project.title,
            buyerEmail: buyer.email,
            saleAmount: projectPrice,
            commission: platformCommission,
            earnings: sellerEarning,
          }
        ),
      ]);
    } catch (emailError) {
      console.error('Email error:', emailError);
      // Don't fail the order if email fails
    }

    return successResponse({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        downloadUrl,
      },
    }, 'Order created successfully');

  } catch (error) {
    return handleApiError(error);
  }
}