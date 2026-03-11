/**
 * Per-request Drizzle client factory.
 *
 * Uses React cache() so the client is created once per request and
 * memoized for subsequent calls within the same request. Never create
 * a global db instance — Cloudflare Workers reuse instances across requests,
 * which causes context leakage between users.
 */

import { cache } from 'react';
import { drizzle } from 'drizzle-orm/d1';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import * as schema from '../../drizzle/schema';

/**
 * Synchronous DB client for Server Components and Server Actions.
 * Uses the synchronous getCloudflareContext() variant.
 */
export const getDb = cache(() => {
  const { env } = getCloudflareContext();
  return drizzle(env.DB, { schema });
});

/**
 * Async DB client for Route Handlers and middleware where async context
 * access is required.
 */
export const getDbAsync = cache(async () => {
  const { env } = await getCloudflareContext({ async: true });
  return drizzle(env.DB, { schema });
});
