import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const hasEmail = !!process.env.MASTER_ADMIN_EMAIL;
  const hasPassword = !!process.env.MASTER_ADMIN_PASSWORD;
  const hasJwtSecret = !!process.env.JWT_SECRET;
  const hasToken = !!request.cookies.get('auth-token')?.value;
  const jwtSource = hasJwtSecret ? 'env' : 'default';

  // Parse ADMIN_USERS and show diagnostic info
  let adminUsersDiag: any = 'not set';
  const adminUsersRaw = process.env.ADMIN_USERS;
  if (adminUsersRaw) {
    try {
      const parsed = JSON.parse(adminUsersRaw);
      if (Array.isArray(parsed)) {
        adminUsersDiag = {
          status: 'valid JSON array',
          count: parsed.length,
          users: parsed.map((u: any) => ({
            email: u.email || '❌ MISSING',
            name: u.name || '(no name)',
            hasPassword: !!u.password,
            passwordLength: u.password ? u.password.length : 0,
          })),
        };
      } else {
        adminUsersDiag = { status: '❌ NOT an array — must be wrapped in [ ]', raw_type: typeof parsed };
      }
    } catch (e: any) {
      adminUsersDiag = {
        status: '❌ INVALID JSON — parse error',
        error: e.message,
        raw_preview: adminUsersRaw.substring(0, 100) + (adminUsersRaw.length > 100 ? '...' : ''),
      };
    }
  }

  return NextResponse.json({
    status: hasEmail && hasPassword ? 'configured' : 'NOT CONFIGURED',
    env: {
      MASTER_ADMIN_EMAIL: hasEmail ? `set (${process.env.MASTER_ADMIN_EMAIL})` : '❌ NOT SET',
      MASTER_ADMIN_PASSWORD: hasPassword ? 'set (hidden)' : '❌ NOT SET',
      JWT_SECRET: hasJwtSecret ? 'set (custom)' : '⚠️ using default fallback',
      ADMIN_USERS: adminUsersDiag,
      CHEF_PASSWORD: process.env.CHEF_PASSWORD ? 'set (hidden)' : 'not set (chef login disabled)',
      CHEF_EMAIL_DOMAINS: process.env.CHEF_EMAIL_DOMAINS || '1-group.sg (default)',
    },
    cookie: hasToken ? 'auth token present' : 'no auth token',
    jwtSource,
    hint: !hasEmail || !hasPassword
      ? 'Set MASTER_ADMIN_EMAIL and MASTER_ADMIN_PASSWORD in Vercel → Project Settings → Environment Variables, then redeploy.'
      : 'Environment configured. If login still fails, try clearing browser cookies for this domain.',
  });
}
