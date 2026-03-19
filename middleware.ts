import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-1cuisinesg-secret-change-in-production'
);

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/api/auth', '/forgot-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files, Next.js internals, and public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/chefs/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|xml|txt|webp|gif|css|js|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  // Check auth token
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Admin-only routes — block chef role
    if (pathname.startsWith('/admin')) {
      const role = payload.role as string;
      if (role !== 'master_admin' && role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
      if (pathname.startsWith('/admin/users') && role !== 'master_admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }

    return NextResponse.next();
  } catch {
    // Invalid/expired token — clear and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth-token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
