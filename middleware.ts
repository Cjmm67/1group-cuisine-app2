import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-1cuisinesg-secret-change-in-production'
);

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/api/auth/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.xml') ||
    pathname.endsWith('.txt')
  ) {
    return NextResponse.next();
  }

  // Check auth token
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Admin-only routes
    if (pathname.startsWith('/admin')) {
      const role = payload.role as string;
      if (role !== 'master_admin' && role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
      // User management is master_admin only
      if (pathname.startsWith('/admin/users') && role !== 'master_admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }

    // Add user info to request headers for server components
    const response = NextResponse.next();
    response.headers.set('x-user-email', payload.email as string);
    response.headers.set('x-user-role', payload.role as string);
    response.headers.set('x-user-name', payload.name as string);
    return response;
  } catch {
    // Invalid token — redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth-token');
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
