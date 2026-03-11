/**
 * API key authentication higher-order function.
 * Validates Bearer token against the D1 api_keys table.
 *
 * Usage:
 *   export const POST = withApiKey(async (req, context) => { ... });
 */

import { NextRequest } from 'next/server';
import { getDbAsync } from '@/lib/db';
import { apiKeys } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { apiError } from '@/lib/api-response';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Handler<TContext = any> = (req: NextRequest, context: TContext) => Promise<Response>;

/**
 * Wrap a route handler with API key authentication.
 * Reads Bearer token from Authorization header, validates against D1.
 * Returns 401 if missing, malformed, invalid, or revoked.
 */
export function withApiKey<TContext>(handler: Handler<TContext>): Handler<TContext> {
  return async (req: NextRequest, context: TContext) => {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return apiError(
        'Missing or malformed Authorization header. Use: Bearer <api-key>',
        401
      );
    }

    const token = authHeader.slice(7);
    if (!token) {
      return apiError('API key must not be empty', 401);
    }

    const db = await getDbAsync();
    const key = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.key, token))
      .get();

    if (!key || key.revoked_at !== null) {
      return apiError('Invalid or revoked API key', 401);
    }

    return handler(req, context);
  };
}
