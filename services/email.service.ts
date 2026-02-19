import { Resend } from 'resend';

// Validate Resend configuration at startup
if (!process.env.RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY is not configured in environment variables');
  throw new Error('RESEND_API_KEY is required for email functionality');
}

if (!process.env.RESEND_FROM_EMAIL) {
  console.warn('⚠️ RESEND_FROM_EMAIL not set, using default: onboarding@resend.dev');
}

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Log email configuration at startup
console.log('📧 Email Configuration:', {
  FROM_EMAIL,
  APP_URL,
  RESEND_CONFIGURED: !!process.env.RESEND_API_KEY,
  RESEND_KEY_PREFIX: process.env.RESEND_API_KEY?.substring(0, 7) + '...',
});

export class EmailService {
  /**
   * Send welcome email with verification link
   */
  static async sendWelcomeEmail(
    to: string,
    name: string,
    verificationToken: string
  ): Promise<{ success: boolean; error?: string; emailId?: string }> {
    try {
      // Validate Resend API key
      if (!process.env.RESEND_API_KEY) {
        const error = 'Resend API key not configured';
        console.error(`❌ Email send failed: ${error}`);
        return { success: false, error };
      }

      console.log(`📧 Attempting to send verification email...`);
      console.log(`   To: ${to}`);
      console.log(`   From: ${FROM_EMAIL}`);
      console.log(`   Name: ${name}`);
      
      const verificationUrl = `${APP_URL}/verify-email?token=${verificationToken}`;
      console.log(`   Verification URL: ${verificationUrl}`);

      const { data, error } = await resend.emails.send({
        from: `Azora Stack <${FROM_EMAIL}>`,
        to,
        subject: 'Welcome to Azora Stack - Verify Your Email',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0;">Welcome to Azora Stack! 🎉</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #7c3aed; margin-top: 0;">Hi ${name},</h2>
              
              <p style="font-size: 16px;">Thank you for joining Azora Stack, India's premier marketplace for ready-made software projects!</p>
              
              <p style="font-size: 16px;">To get started, please verify your email address by clicking the button below:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                  Verify Email Address
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
              <p style="font-size: 14px; color: #7c3aed; word-break: break-all;">${verificationUrl}</p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 14px; color: #666;">This link will expire in 24 hours. If you didn't create an account, please ignore this email.</p>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Best regards,<br>
                <strong>The Azora Stack Team</strong>
              </p>
            </div>
          </body>
          </html>
        `,
      });

      // Log full Resend response
      console.log('📬 Resend API Response:', JSON.stringify({ data, error }, null, 2));

      if (error) {
        console.error('❌ Resend API returned error:', JSON.stringify(error, null, 2));
        
        // Check for domain verification error
        if (error.message?.includes('verify a domain')) {
          console.error('');
          console.error('🚨 RESEND DOMAIN VERIFICATION REQUIRED 🚨');
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.error('You can only send emails to your own email address in testing mode.');
          console.error('');
          console.error('To send emails to any recipient:');
          console.error('1. Go to: https://resend.com/domains');
          console.error('2. Add and verify your domain');
          console.error('3. Update RESEND_FROM_EMAIL to use your verified domain');
          console.error('   Example: noreply@yourdomain.com');
          console.error('');
          console.error('OR for testing:');
          console.error(`- Only send emails to: ${error.message.match(/\(([^)]+)\)/)?.[1] || 'your registered email'}`);
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.error('');
        }
        
        return { 
          success: false, 
          error: `Resend API error: ${error.message || JSON.stringify(error)}` 
        };
      }

      if (!data?.id) {
        console.error('❌ Email failed: No email ID returned from Resend');
        console.error('   Data received:', JSON.stringify(data, null, 2));
        return { 
          success: false, 
          error: 'No email ID returned from Resend API' 
        };
      }

      console.log(`✅ Verification email sent successfully!`);
      console.log(`   Email ID: ${data.id}`);
      console.log(`   To: ${to}`);
      console.log(`   Check Resend dashboard: https://resend.com/emails/${data.id}`);
      
      return { success: true, emailId: data.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Exception while sending verification email:`, errorMessage);
      console.error('   Full error:', error);
      
      // Don't throw error - we don't want to block registration if email fails
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send order confirmation to buyer
   */
  static async sendOrderConfirmation(
    to: string,
    buyerName: string,
    orderDetails: {
      orderNumber: string;
      projectTitle: string;
      price: number;
      downloadUrl: string;
    }
  ): Promise<void> {
    try {
      await resend.emails.send({
        from: `Azora Stack <${FROM_EMAIL}>`,
        to,
        subject: `Order Confirmed - ${orderDetails.projectTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0;">Order Confirmed! ✓</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #10b981; margin-top: 0;">Hi ${buyerName},</h2>
              
              <p style="font-size: 16px;">Thank you for your purchase! Your order has been confirmed.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #7c3aed;">Order Details</h3>
                <p style="margin: 10px 0;"><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
                <p style="margin: 10px 0;"><strong>Project:</strong> ${orderDetails.projectTitle}</p>
                <p style="margin: 10px 0;"><strong>Amount Paid:</strong> ₹${orderDetails.price.toLocaleString('en-IN')}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${orderDetails.downloadUrl}" style="background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                  Download Project
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666;">Your download link will be valid for 24 hours. You can also access your downloads from your dashboard anytime.</p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 14px; color: #666;">Need help? Contact us at support@azorastack.com</p>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Best regards,<br>
                <strong>The Azora Stack Team</strong>
              </p>
            </div>
          </body>
          </html>
        `,
      });

      console.log(`✅ Order confirmation sent to ${to}`);
    } catch (error) {
      console.error('Error sending order confirmation:', error);
      // Don't throw - order should succeed even if email fails
    }
  }

  /**
   * Send sale notification to seller
   */
  static async sendSaleNotification(
    to: string,
    sellerName: string,
    saleDetails: {
      projectTitle: string;
      buyerEmail: string;
      saleAmount: number;
      commission: number;
      earnings: number;
    }
  ): Promise<void> {
    try {
      await resend.emails.send({
        from: `Azora Stack <${FROM_EMAIL}>`,
        to,
        subject: `You Made a Sale! - ${saleDetails.projectTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0;">🎉 You Made a Sale!</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #7c3aed; margin-top: 0;">Hi ${sellerName},</h2>
              
              <p style="font-size: 16px;">Congratulations! Your project has been purchased.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #7c3aed;">Sale Details</h3>
                <p style="margin: 10px 0;"><strong>Project:</strong> ${saleDetails.projectTitle}</p>
                <p style="margin: 10px 0;"><strong>Sale Amount:</strong> ₹${saleDetails.saleAmount.toLocaleString('en-IN')}</p>
                <p style="margin: 10px 0;"><strong>Platform Commission:</strong> ₹${saleDetails.commission.toLocaleString('en-IN')}</p>
                <p style="margin: 10px 0; font-size: 18px; color: #10b981;"><strong>Your Earnings:</strong> ₹${saleDetails.earnings.toLocaleString('en-IN')}</p>
              </div>
              
              <p style="font-size: 16px;">The amount has been credited to your wallet. You can request a withdrawal anytime!</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${APP_URL}/dashboard/seller/wallet" style="background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                  View Wallet
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Keep creating amazing projects!<br>
                <strong>The Azora Stack Team</strong>
              </p>
            </div>
          </body>
          </html>
        `,
      });

      console.log(`✅ Sale notification sent to ${to}`);
    } catch (error) {
      console.error('Error sending sale notification:', error);
      // Don't throw - sale should succeed even if email fails
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(
    to: string,
    name: string,
    resetToken: string
  ): Promise<void> {
    try {
      const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;

      await resend.emails.send({
        from: `Azora Stack <${FROM_EMAIL}>`,
        to,
        subject: 'Reset Your Password - Azora Stack',
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0;">Reset Your Password</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #7c3aed; margin-top: 0;">Hi ${name},</h2>
              
              <p style="font-size: 16px;">We received a request to reset your password. Click the button below to create a new password:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666;">Or copy and paste this link:</p>
              <p style="font-size: 14px; color: #7c3aed; word-break: break-all;">${resetUrl}</p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 14px; color: #ef4444;"><strong>This link will expire in 1 hour.</strong></p>
              <p style="font-size: 14px; color: #666;">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Best regards,<br>
                <strong>The Azora Stack Team</strong>
              </p>
            </div>
          </body>
          </html>
        `,
      });

      console.log(`✅ Password reset email sent to ${to}`);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Send project approval notification
   */
  static async sendProjectApproved(
    to: string,
    projectTitle: string,
    projectId: string
  ): Promise<void> {
    try {
      const projectUrl = `${APP_URL}/projects/${projectId}`;

      await resend.emails.send({
        from: `Azora Stack <${FROM_EMAIL}>`,
        to,
        subject: `Project Approved! - ${projectTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0;">✓ Project Approved!</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #10b981; margin-top: 0;">Great News!</h2>
              
              <p style="font-size: 16px;">Your project "<strong>${projectTitle}</strong>" has been approved and is now live on the marketplace!</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${projectUrl}" style="background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                  View Your Project
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666;">Your project is now visible to thousands of potential buyers. Good luck with your sales!</p>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Best regards,<br>
                <strong>The Azora Stack Team</strong>
              </p>
            </div>
          </body>
          </html>
        `,
      });

      console.log(`✅ Project approval email sent to ${to}`);
    } catch (error) {
      console.error('Error sending project approval email:', error);
      // Don't throw - approval should succeed even if email fails
    }
  }

  /**
   * Send project rejection notification
   */
  static async sendProjectRejected(
    to: string,
    projectTitle: string,
    reason: string
  ): Promise<void> {
    try {
      await resend.emails.send({
        from: `Azora Stack <${FROM_EMAIL}>`,
        to,
        subject: `Project Review Update - ${projectTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0;">Project Review Update</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #ef4444; margin-top: 0;">Project Needs Revision</h2>
              
              <p style="font-size: 16px;">Thank you for submitting "<strong>${projectTitle}</strong>".</p>
              
              <p style="font-size: 16px;">Unfortunately, your project needs some revisions before it can be approved:</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                <p style="margin: 0; color: #666;"><strong>Reason:</strong></p>
                <p style="margin: 10px 0 0 0;">${reason}</p>
              </div>
              
              <p style="font-size: 16px;">Please make the necessary changes and resubmit your project.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${APP_URL}/dashboard/seller/projects" style="background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                  Edit Project
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666;">If you have any questions, please don't hesitate to contact our support team.</p>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Best regards,<br>
                <strong>The Azora Stack Team</strong>
              </p>
            </div>
          </body>
          </html>
        `,
      });

      console.log(`✅ Project rejection email sent to ${to}`);
    } catch (error) {
      console.error('Error sending project rejection email:', error);
      // Don't throw
    }
  }

  /**
   * Send withdrawal request confirmation
   */
  static async sendWithdrawalRequest(
    to: string,
    sellerName: string,
    withdrawalDetails: {
      withdrawalNumber: string;
      amount: number;
    }
  ): Promise<void> {
    try {
      await resend.emails.send({
        from: `Azora Stack <${FROM_EMAIL}>`,
        to,
        subject: 'Withdrawal Request Received',
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0;">Withdrawal Request Received</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #7c3aed; margin-top: 0;">Hi ${sellerName},</h2>
              
              <p style="font-size: 16px;">We've received your withdrawal request.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 10px 0;"><strong>Withdrawal Number:</strong> ${withdrawalDetails.withdrawalNumber}</p>
                <p style="margin: 10px 0; font-size: 18px; color: #7c3aed;"><strong>Amount:</strong> ₹${withdrawalDetails.amount.toLocaleString('en-IN')}</p>
              </div>
              
              <p style="font-size: 16px;">Your request is being processed. You'll receive another email once it's completed.</p>
              
              <p style="font-size: 14px; color: #666;">Processing usually takes 1-3 business days.</p>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Best regards,<br>
                <strong>The Azora Stack Team</strong>
              </p>
            </div>
          </body>
          </html>
        `,
      });

      console.log(`✅ Withdrawal request email sent to ${to}`);
    } catch (error) {
      console.error('Error sending withdrawal request email:', error);
      // Don't throw
    }
  }

  /**
   * Send withdrawal completion notification
   */
  static async sendWithdrawalCompleted(
    to: string,
    sellerName: string,
    withdrawalDetails: {
      withdrawalNumber: string;
      amount: number;
      transactionId: string;
    }
  ): Promise<void> {
    try {
      await resend.emails.send({
        from: `Azora Stack <${FROM_EMAIL}>`,
        to,
        subject: 'Withdrawal Completed!',
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0;">✓ Withdrawal Completed!</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #10b981; margin-top: 0;">Hi ${sellerName},</h2>
              
              <p style="font-size: 16px;">Great news! Your withdrawal has been completed.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 10px 0;"><strong>Withdrawal Number:</strong> ${withdrawalDetails.withdrawalNumber}</p>
                <p style="margin: 10px 0; font-size: 18px; color: #10b981;"><strong>Amount:</strong> ₹${withdrawalDetails.amount.toLocaleString('en-IN')}</p>
                <p style="margin: 10px 0;"><strong>Transaction ID:</strong> ${withdrawalDetails.transactionId}</p>
              </div>
              
              <p style="font-size: 16px;">The amount should reflect in your bank account within 1-2 business days.</p>
              
              <p style="font-size: 14px; color: #666;">Please save the transaction ID for your records.</p>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Best regards,<br>
                <strong>The Azora Stack Team</strong>
              </p>
            </div>
          </body>
          </html>
        `,
      });

      console.log(`✅ Withdrawal completion email sent to ${to}`);
    } catch (error) {
      console.error('Error sending withdrawal completion email:', error);
      // Don't throw
    }
  }

  /**
   * Send purchase request notification to admin
   */
  static async sendPurchaseRequestAdmin(
    to: string,
    requestDetails: {
      projectTitle: string;
      projectPrice: string;
      buyerName: string;
      buyerEmail: string;
      buyerPhone: string;
      message: string;
      requestDate: string;
    }
  ): Promise<void> {
    try {
      await resend.emails.send({
        from: `Azora Stack <${FROM_EMAIL}>`,
        to,
        subject: `🔔 New Purchase Request: ${requestDetails.projectTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0;">🔔 New Purchase Request</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #f59e0b; margin-top: 0;">Action Required</h2>
              
              <p style="font-size: 16px;">A buyer has requested to purchase a project. Please contact them with payment details.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h3 style="margin-top: 0; color: #7c3aed;">Project Details</h3>
                <p style="margin: 10px 0;"><strong>Project:</strong> ${requestDetails.projectTitle}</p>
                <p style="margin: 10px 0;"><strong>Price:</strong> ₹${requestDetails.projectPrice}</p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <h3 style="margin-top: 0; color: #3b82f6;">Buyer Information</h3>
                <p style="margin: 10px 0;"><strong>Name:</strong> ${requestDetails.buyerName}</p>
                <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${requestDetails.buyerEmail}" style="color: #7c3aed;">${requestDetails.buyerEmail}</a></p>
                <p style="margin: 10px 0;"><strong>Phone:</strong> ${requestDetails.buyerPhone}</p>
              </div>
              
              ${requestDetails.message !== 'No message provided' ? `
              <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Buyer's Message:</strong></p>
                <p style="margin: 10px 0 0 0; font-style: italic;">"${requestDetails.message}"</p>
              </div>
              ` : ''}
              
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e;"><strong>📋 Next Steps:</strong></p>
                <ol style="margin: 10px 0 0 0; padding-left: 20px; color: #92400e;">
                  <li>Contact the buyer via email or phone</li>
                  <li>Share payment details (UPI/Bank Transfer)</li>
                  <li>Wait for payment confirmation</li>
                  <li>Verify payment received</li>
                  <li>Create order in admin panel</li>
                </ol>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${APP_URL}/dashboard/admin/purchase-requests" style="background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                  View Purchase Requests
                </a>
              </div>
              
              <p style="font-size: 12px; color: #999; margin-top: 30px;">
                Request received: ${requestDetails.requestDate}
              </p>
            </div>
          </body>
          </html>
        `,
      });

      console.log(`✅ Purchase request admin notification sent to ${to}`);
    } catch (error) {
      console.error('Error sending purchase request admin notification:', error);
      // Don't throw
    }
  }

  /**
   * Queue email for sending (for use with email queue system)
   */
  static async queueEmail(emailData: {
    to: string;
    subject: string;
    templateName: string;
    templateData: any;
  }): Promise<void> {
    const { to, subject, templateName, templateData } = emailData;

    // Map template names to methods
    switch (templateName) {
      case 'PURCHASE_REQUEST_ADMIN':
        await this.sendPurchaseRequestAdmin(to, templateData);
        break;
      case 'WELCOME':
        await this.sendWelcomeEmail(to, templateData.name, templateData.verificationToken);
        break;
      case 'ORDER_CONFIRMATION':
        await this.sendOrderConfirmation(to, templateData.buyerName, templateData.orderDetails);
        break;
      case 'SALE_NOTIFICATION':
        await this.sendSaleNotification(to, templateData.sellerName, templateData.saleDetails);
        break;
      case 'PASSWORD_RESET':
        await this.sendPasswordReset(to, templateData.name, templateData.resetToken);
        break;
      case 'PROJECT_APPROVED':
        await this.sendProjectApproved(to, templateData.projectTitle, templateData.projectId);
        break;
      case 'PROJECT_REJECTED':
        await this.sendProjectRejected(to, templateData.projectTitle, templateData.reason);
        break;
      case 'WITHDRAWAL_REQUEST':
        await this.sendWithdrawalRequest(to, templateData.sellerName, templateData.withdrawalDetails);
        break;
      case 'WITHDRAWAL_COMPLETED':
        await this.sendWithdrawalCompleted(to, templateData.sellerName, templateData.withdrawalDetails);
        break;
      default:
        console.warn(`Unknown email template: ${templateName}`);
    }
  }
}