import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    const correctPassword = process.env.APP_PASSWORD;

    if (!correctPassword) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!password || password !== correctPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Set authentication cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({ success: true, message: 'Login successful' });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}

