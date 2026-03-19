import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  const keyPrefix = hasKey
    ? process.env.ANTHROPIC_API_KEY!.substring(0, 12) + '...'
    : 'NOT SET';

  return NextResponse.json({
    status: hasKey ? 'configured' : 'NOT CONFIGURED',
    ANTHROPIC_API_KEY: keyPrefix,
    hint: !hasKey
      ? 'Add ANTHROPIC_API_KEY in Vercel → Project Settings → Environment Variables. Make sure it is enabled for "Production" environment. Then REDEPLOY (not just restart).'
      : 'Key is set. Chat should be working.',
    env_check: {
      NODE_ENV: process.env.NODE_ENV,
      has_jwt: !!process.env.JWT_SECRET,
      has_master_email: !!process.env.MASTER_ADMIN_EMAIL,
    },
  });
}
