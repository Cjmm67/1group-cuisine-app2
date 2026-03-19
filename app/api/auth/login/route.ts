import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, createToken } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if env vars are set
    if (!process.env.MASTER_ADMIN_EMAIL || !process.env.MASTER_ADMIN_PASSWORD) {
      console.error('AUTH ERROR: MASTER_ADMIN_EMAIL or MASTER_ADMIN_PASSWORD not set in environment');
      return NextResponse.json(
        { error: 'Server configuration error. Contact administrator.' },
        { status: 500 }
      );
    }

    const user = await validateCredentials(email, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = await createToken(user);

    const response = NextResponse.json({
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
