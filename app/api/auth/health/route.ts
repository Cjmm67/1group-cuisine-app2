import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const hasEmail = !!process.env.MASTER_ADMIN_EMAIL;
  const hasPassword = !!process.env.MASTER_ADMIN_PASSWORD;
  const hasJwtSecret = !!process.env.JWT_SECRET;
  const hasToken = !!request.cookies.get('auth-token')?.value;
  const jwtSource = hasJwtSecret ? 'env' : 'default';

  return NextResponse.json({
    status: hasEmail && hasPassword ? 'configured' : 'NOT CONFIGURED',
    env: {
      MASTER_ADMIN_EMAIL: hasEmail ? `set (${process.env.MASTER_ADMIN_EMAIL})` : '❌ NOT SET',
      MASTER_ADMIN_PASSWORD: hasPassword ? 'set (hidden)' : '❌ NOT SET',
      JWT_SECRET: hasJwtSecret ? 'set (custom)' : '⚠️ using default fallback',
      ADMIN_USERS: process.env.ADMIN_USERS ? 'set' : 'not set (optional)',
    },
    cookie: hasToken ? 'auth token present' : 'no auth token',
    jwtSource,
    hint: !hasEmail || !hasPassword
      ? 'Set MASTER_ADMIN_EMAIL and MASTER_ADMIN_PASSWORD in Vercel → Project Settings → Environment Variables, then redeploy.'
      : 'Environment configured. If login still fails, try clearing browser cookies for this domain.',
  });
}
