import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { getUsers } from '@/lib/auth';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-1cuisinesg-secret-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists (but always return success to not reveal accounts)
    const users = getUsers();
    const user = users.find((u) => u.email === email.toLowerCase());

    if (user) {
      // Generate a magic login token (15 min expiry)
      const resetToken = await new SignJWT({
        email: user.email,
        name: user.name || 'User',
        role: user.role,
        type: 'magic_link',
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('15m')
        .sign(JWT_SECRET);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://1-groupculinary.com';
      const resetLink = `${baseUrl}/api/auth/magic-login?token=${resetToken}`;

      // Send email via Resend (if configured)
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        try {
          const { Resend } = await import('resend');
          const resend = new Resend(resendKey);

          await resend.emails.send({
            from: process.env.EMAIL_FROM || 'noreply@1-groupculinary.com',
            to: email.toLowerCase(),
            subject: '1-CUISINESG — Password Reset',
            html: `
              <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
                <div style="text-align: center; margin-bottom: 32px;">
                  <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #d4a843, #b8942e); border-radius: 12px; line-height: 48px; color: white; font-weight: bold; font-size: 18px;">1G</div>
                </div>
                <h2 style="text-align: center; color: #111; margin-bottom: 16px;">Password Reset</h2>
                <p style="color: #555; line-height: 1.6; margin-bottom: 24px;">
                  You requested a password reset for your 1-CUISINESG account. Click the button below to sign in. This link expires in 15 minutes.
                </p>
                <div style="text-align: center; margin-bottom: 32px;">
                  <a href="${resetLink}" style="display: inline-block; padding: 12px 32px; background: #d4a843; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                    Sign In Now
                  </a>
                </div>
                <p style="color: #999; font-size: 12px; text-align: center;">
                  If you didn't request this, ignore this email. To change your password, contact the Master Admin.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                <p style="color: #bbb; font-size: 11px; text-align: center;">
                  1-CUISINESG by 1-Group Singapore
                </p>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error('Failed to send reset email:', emailErr);
        }
      } else {
        console.log(`[Password Reset] Magic link for ${email}: ${resetLink}`);
      }
    }

    // Always return success (don't reveal if email exists)
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
