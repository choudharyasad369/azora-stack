import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get('token');

    console.log(`🔍 Email verification attempt with token: ${token?.substring(0, 10)}...`);

    if (!token) {
      console.error('❌ Verification failed: No token provided');
      return NextResponse.json({
        success: false,
        message: 'Verification token is required'
      }, { status: 400 });
    }

    // Find user with this token
    const user = await prisma.user.findUnique({
      where: { emailVerifyToken: token },
    });

    if (!user) {
      console.error(`❌ Verification failed: Invalid or expired token`);
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired verification token. Please request a new verification email.'
      }, { status: 400 });
    }

    // Check if already verified
    if (user.emailVerified) {
      console.log(`ℹ️ User ${user.email} is already verified`);
      return NextResponse.json({
        success: true,
        message: 'Email is already verified. You can now login.',
        alreadyVerified: true
      });
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        status: 'ACTIVE',
      },
    });

    console.log(`✅ Email verified successfully for: ${user.email}`);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now login.',
      email: user.email
    });
  } catch (error) {
    console.error('❌ Email verification error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Email verification failed'
    }, { status: 500 });
  }
}