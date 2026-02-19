import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { forgotPasswordSchema } from '@/lib/validations';
import { randomBytes } from 'crypto';
import { EmailService } from '@/services/email.service';

function generateRandomToken(length: number): string {
  return randomBytes(length).toString('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('VALIDATION_ERROR', 'Invalid input', validation.error.errors);
    }

    const { email } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return successResponse({}, 'If an account exists, you will receive a password reset email');
    }

    // Generate reset token
    const resetToken = generateRandomToken(32);
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send reset email
    await EmailService.sendPasswordReset(user.email, user.name, resetToken);

    return successResponse({}, 'If an account exists, you will receive a password reset email');
  } catch (error) {
    return handleApiError(error);
  }
}