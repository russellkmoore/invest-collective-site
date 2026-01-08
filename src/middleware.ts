import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // /admin routes are protected by Cloudflare Zero Trust at the edge
  // If a request reaches this middleware, Zero Trust has already authenticated the user
  // This middleware sets an auth cookie to persist auth state across all pages
  if (path.startsWith('/admin')) {
    const response = NextResponse.next();

    // In development, set a dev cookie
    if (process.env.NODE_ENV === 'development') {
      console.log('Admin access granted (development mode)');
      response.cookies.set('cf-auth-state', JSON.stringify({
        isAuthenticated: true,
        email: 'dev@localhost',
        userId: 'dev-user',
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days (1 month, matching Cloudflare Access session)
        path: '/',
      });
      return response;
    }

    // In production, extract auth from Cloudflare Access headers and set cookie
    const jwt = request.headers.get('cf-access-jwt-assertion');
    const email = request.headers.get('cf-access-authenticated-user-email');

    if (jwt && email) {
      console.log('Admin access:', {
        path,
        timestamp: new Date().toISOString(),
        email,
      });

      // Set auth cookie to persist across all pages
      response.cookies.set('cf-auth-state', JSON.stringify({
        isAuthenticated: true,
        email,
        timestamp: Date.now(),
      }), {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days (1 month, matching Cloudflare Access session duration)
        path: '/',
      });
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
