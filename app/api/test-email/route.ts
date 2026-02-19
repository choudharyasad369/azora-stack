import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'Email address is required'
      }, { status: 400 });
    }

    console.log('🧪 Test Email Request');
    console.log('   To:', email);
    console.log('   From:', FROM_EMAIL);
    console.log('   API Key:', process.env.RESEND_API_KEY?.substring(0, 7) + '...');

    // Validate configuration
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        success: false,
        message: 'RESEND_API_KEY is not configured',
        config: {
          hasApiKey: false,
          fromEmail: FROM_EMAIL
        }
      }, { status: 500 });
    }

    // Send test email
    const { data, error } = await resend.emails.send({
      from: `Azora Stack Test <${FROM_EMAIL}>`,
      to: email,
      subject: 'Test Email from Azora Stack',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #7c3aed;">Test Email</h1>
          <p>This is a test email from Azora Stack.</p>
          <p>If you received this, email delivery is working correctly!</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Sent at: ${new Date().toISOString()}<br>
            From: ${FROM_EMAIL}<br>
            To: ${email}
          </p>
        </body>
        </html>
      `,
    });

    // Log full response
    console.log('📬 Resend API Response:', JSON.stringify({ data, error }, null, 2));

    if (error) {
      console.error('❌ Resend API Error:', JSON.stringify(error, null, 2));
      return NextResponse.json({
        success: false,
        message: 'Failed to send test email',
        error: error,
        config: {
          hasApiKey: !!process.env.RESEND_API_KEY,
          fromEmail: FROM_EMAIL
        }
      }, { status: 500 });
    }

    if (!data?.id) {
      console.error('❌ No email ID returned');
      return NextResponse.json({
        success: false,
        message: 'No email ID returned from Resend',
        data: data,
        config: {
          hasApiKey: !!process.env.RESEND_API_KEY,
          fromEmail: FROM_EMAIL
        }
      }, { status: 500 });
    }

    console.log('✅ Test email sent successfully!');
    console.log('   Email ID:', data.id);
    console.log('   Dashboard:', `https://resend.com/emails/${data.id}`);

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      emailId: data.id,
      dashboardUrl: `https://resend.com/emails/${data.id}`,
      config: {
        hasApiKey: !!process.env.RESEND_API_KEY,
        fromEmail: FROM_EMAIL,
        to: email
      }
    });

  } catch (error) {
    console.error('❌ Exception in test email:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      error: error instanceof Error ? error.stack : String(error)
    }, { status: 500 });
  }
}
