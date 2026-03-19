import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    const res = NextResponse.json({ user: null }, { status: 401 });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res;
  }

  const user = await verifyToken(token);

  if (!user) {
    const res = NextResponse.json({ user: null }, { status: 401 });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res;
  }

  const res = NextResponse.json({ user });
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return res;
}
