import { z } from 'zod';

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['BUYER', 'SELLER'], {
    errorMap: () => ({ message: 'Please select either Buyer or Seller role' })
  }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

// Project Schemas
export const createProjectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  shortDescription: z.string().min(20, 'Short description must be at least 20 characters').max(200),
  description: z.string().min(100, 'Description must be at least 100 characters'),
  price: z.number().min(1, 'Price must be at least ₹1').max(100000, 'Price cannot exceed ₹100,000'),
  techStack: z.array(z.string()).min(1, 'Select at least one technology'),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  demoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  documentationUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectFilterSchema = z.object({
  search: z.string().optional(),
  techStack: z.array(z.string()).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  page: z.number().default(1),
  limit: z.number().default(12),
});

// Withdrawal Schema
export const createWithdrawalSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
});

export const reviewWithdrawalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reviewNotes: z.string().optional(),
  transactionId: z.string().optional(),
});

// Profile Schemas
export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
});

export const updateBankDetailsSchema = z.object({
  bankName: z.string().min(2, 'Bank name is required'),
  accountNumber: z.string().min(5, 'Invalid account number'),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),
  accountHolderName: z.string().min(2, 'Account holder name is required'),
  upiId: z.string().optional(),
});

// Admin Schemas
export const updatePlatformSettingSchema = z.object({
  key: z.string(),
  value: z.string(),
});

export const suspendUserSchema = z.object({
  userId: z.string(),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

// Payment Schema
export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  orderId: z.string(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectFilterInput = z.infer<typeof projectFilterSchema>;
export type CreateWithdrawalInput = z.infer<typeof createWithdrawalSchema>;
export type ReviewWithdrawalInput = z.infer<typeof reviewWithdrawalSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateBankDetailsInput = z.infer<typeof updateBankDetailsSchema>;
export type UpdatePlatformSettingInput = z.infer<typeof updatePlatformSettingSchema>;
export type SuspendUserInput = z.infer<typeof suspendUserSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
