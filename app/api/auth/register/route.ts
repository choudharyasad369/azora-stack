import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { ZodError } from 'zod';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { registerSchema } from '@/lib/validations';
import { generateRandomToken } from '@/lib/utils';
import { EmailService } from '@/services/email.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input with detailed error handling
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      // Return detailed field-level errors
      return NextResponse.json({
        success: false,
        errors: validation.error.errors.map(e => ({
          field: e.path[0],
          message: e.message
        }))
      }, { status: 400 });
    }

    const { email, password, name, role } = validation.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'An account with this email already exists'
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const emailVerifyToken = generateRandomToken(32);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role,
        emailVerifyToken,
        status: 'PENDING_VERIFICATION',
      },
    });

    // Send verification email
    console.log(`📧 Attempting to send verification email to: ${user.email}`);
    const emailResult = await EmailService.sendWelcomeEmail(
      user.email,
      user.name,
      emailVerifyToken
    );

    if (!emailResult.success) {
      console.warn(`⚠️ Email sending failed but registration succeeded`);
      console.warn(`   Error: ${emailResult.error}`);
    } else {
      console.log(`✅ Registration complete with email sent`);
      console.log(`   Email ID: ${emailResult.emailId}`);
    }

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      message: 'Please check your email to verify your account',
      emailSent: emailResult.success,
      emailId: emailResult.emailId,
    }, 'Registration successful');

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({
        success: false,
        errors: error.errors.map(e => ({
          field: e.path[0],
          message: e.message
        }))
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Registration failed'
    }, { status: 500 });
  }
}
