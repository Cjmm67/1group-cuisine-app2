import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { jwtVerify } from 'jose';
import { createToken } from '@/lib/auth';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-1cuisinesg-secret-change-in-production'
);

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Verify this is a magic link token
    if (payload.type !== 'magic_link') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Create a normal session token
    const sessionToken = await createToken({
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as 'master_admin' | 'admin',
    });

    // Redirect to home with auth cookie set
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.set('auth-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch {
    // Token expired or invalid
    return NextResponse.redirect(
      new URL('/login?error=Reset+link+has+expired.+Please+try+again.', request.url)
    );
  }
}
