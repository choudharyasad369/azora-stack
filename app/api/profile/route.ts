import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  // Bank details for sellers
  bankName: z.string().max(100).optional(),
  accountNumber: z.string().max(50).optional(),
  ifscCode: z.string().max(20).optional(),
  accountHolderName: z.string().max(100).optional(),
  upiId: z.string().max(100).optional(),
});

// GET - Get user profile
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const profile = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
        bio: true,
        phone: true,
        walletBalance: true,
        bankName: true,
        accountNumber: true,
        ifscCode: true,
        accountHolderName: true,
        upiId: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!profile) {
      return errorResponse('USER_NOT_FOUND', 'User not found', undefined, 404);
    }

    return successResponse({ user: profile });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT - Update user profile
export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    // Validate input
    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('VALIDATION_ERROR', 'Invalid input', validation.error.errors);
    }

    const data = validation.data;

    // Build update object
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.avatar) updateData.avatar = data.avatar;

    // Bank details (only for sellers)
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true },
    });

    if (currentUser?.role === 'SELLER') {
      if (data.bankName !== undefined) updateData.bankName = data.bankName;
      if (data.accountNumber !== undefined) updateData.accountNumber = data.accountNumber;
      if (data.ifscCode !== undefined) updateData.ifscCode = data.ifscCode;
      if (data.accountHolderName !== undefined) updateData.accountHolderName = data.accountHolderName;
      if (data.upiId !== undefined) updateData.upiId = data.upiId;
    }

    // Update profile
    const updatedProfile = await prisma.user.update({
      where: { id: user.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        bio: true,
        phone: true,
        bankName: true,
        accountNumber: true,
        ifscCode: true,
        accountHolderName: true,
        upiId: true,
      },
    });

    return successResponse({ user: updatedProfile }, 'Profile updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
