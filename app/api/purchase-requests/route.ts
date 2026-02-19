import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { z } from 'zod';
import { EmailService } from '@/services/email.service';

const createPurchaseRequestSchema = z.object({
  projectId: z.string(),
  message: z.string().max(500).optional(),
});

// GET - List purchase requests (Admin only)
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(['ADMIN']);
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status') || 'PENDING';

    const requests = await prisma.purchaseRequest.findMany({
      where: status !== 'ALL' ? { status } : undefined,
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            price: true,
            thumbnailUrl: true,
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

    return successResponse({ requests });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Create purchase request (Buyer only)
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['BUYER', 'SELLER', 'ADMIN']);
    const body = await req.json();

    // Validate input
    const validation = createPurchaseRequestSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('VALIDATION_ERROR', 'Invalid input', validation.error.errors);
    }

    const { projectId, message } = validation.data;

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        seller: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!project) {
      return errorResponse('PROJECT_NOT_FOUND', 'Project not found', undefined, 404);
    }

    if (project.status !== 'APPROVED') {
      return errorResponse('PROJECT_NOT_AVAILABLE', 'This project is not available for purchase');
    }

    // Check if user already purchased this project
    const existingOrder = await prisma.order.findFirst({
      where: {
        buyerId: user.userId,
        projectId,
        status: 'COMPLETED',
      },
    });

    if (existingOrder) {
      return errorResponse('ALREADY_PURCHASED', 'You have already purchased this project');
    }

    // Check if there's already a pending request
    const existingRequest = await prisma.purchaseRequest.findFirst({
      where: {
        buyerId: user.userId,
        projectId,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      return errorResponse('REQUEST_EXISTS', 'You already have a pending purchase request for this project');
    }

    // Get buyer details
    const buyer = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        name: true,
        email: true,
        phone: true,
      },
    });

    // Create purchase request
    const purchaseRequest = await prisma.purchaseRequest.create({
      data: {
        buyerId: user.userId,
        projectId,
        message: message || null,
        status: 'PENDING',
      },
      include: {
        project: {
          select: {
            title: true,
            price: true,
          },
        },
      },
    });

    // Send email to admin
    try {
      await EmailService.queueEmail({
        to: process.env.ADMIN_EMAIL || 'admin@azorastack.com',
        subject: `New Purchase Request: ${project.title}`,
        templateName: 'PURCHASE_REQUEST_ADMIN',
        templateData: {
          projectTitle: project.title,
          projectPrice: Number(project.price).toLocaleString('en-IN'),
          buyerName: buyer?.name || 'Unknown',
          buyerEmail: buyer?.email || 'Unknown',
          buyerPhone: buyer?.phone || 'Not provided',
          message: message || 'No message provided',
          requestDate: new Date().toLocaleString('en-IN'),
        },
      });
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError);
      // Don't fail the request if email fails
    }

    return successResponse(
      { 
        request: purchaseRequest,
        paymentInstructions: {
          message: 'Your purchase request has been submitted. Our admin will contact you shortly with payment details.',
          contactEmail: process.env.ADMIN_EMAIL || 'admin@azorastack.com',
        }
      },
      'Purchase request submitted successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
