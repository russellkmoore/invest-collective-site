import { headers, cookies } from 'next/headers';

/**
 * Get authentication information from cookie or Cloudflare Access headers
 * Returns null if not authenticated
 *
 * Auth state is persisted in a cookie after first admin page visit,
 * so it remains visible across all pages even though Cloudflare Access
 * only sends headers on protected routes (/admin*).
 */
export async function getAuthInfo(): Promise<{
  isAuthenticated: boolean;
  email?: string;
  userId?: string;
  groups?: string[];
} | null> {
  // Check for auth cookie first (set by middleware on admin routes)
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('cf-auth-state');

  if (authCookie) {
    try {
      const authState = JSON.parse(authCookie.value);
      if (authState.isAuthenticated) {
        return authState;
      }
    } catch (error) {
      console.error('Failed to parse auth cookie:', error);
      // Continue to check headers
    }
  }

  // In development mode (fallback if cookie not set)
  if (process.env.NODE_ENV === 'development') {
    return {
      isAuthenticated: true,
      email: 'dev@localhost',
      userId: 'dev-user',
      groups: ['admin'],
    };
  }

  // Check Cloudflare Access headers (only present on /admin routes)
  const headersList = await headers();
  const jwt = headersList.get('cf-access-jwt-assertion');
  const email = headersList.get('cf-access-authenticated-user-email');

  if (!jwt || !email) {
    return null;
  }

  try {
    // Decode JWT payload (without verification - Cloudflare has already verified it)
    // JWT format: header.payload.signature
    const parts = jwt.split('.');
    if (parts.length !== 3) {
      // Malformed JWT but we have email from header
      return {
        isAuthenticated: true,
        email: email,
      };
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));

    return {
      isAuthenticated: true,
      email: email, // Use email from header (more reliable)
      userId: payload.sub,
      groups: payload.groups || [],
    };
  } catch (error) {
    console.error('Failed to decode Cloudflare Access JWT:', error);
    // Still authenticated, use email from header
    return {
      isAuthenticated: true,
      email: email,
    };
  }
}
