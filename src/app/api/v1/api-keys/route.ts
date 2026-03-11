import { NextRequest } from 'next/server';
import { getDbAsync } from '@/lib/db';
import { apiKeys } from '../../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { apiSuccess, apiError, apiCreated } from '@/lib/api-response';
import { withApiKey } from '@/lib/api-auth';
import { createApiKeySchema } from '@/lib/validation-schemas';

/**
 * GET /api/v1/api-keys
 * List all API keys (label, created_at, revoked status — NOT the key value).
 * Requires API key auth.
 */
export const GET = withApiKey(async () => {
  try {
    const db = await getDbAsync();
    const keys = await db
      .select({
        id: apiKeys.id,
        label: apiKeys.label,
        created_at: apiKeys.created_at,
        revoked_at: apiKeys.revoked_at,
      })
      .from(apiKeys)
      .orderBy(apiKeys.created_at);

    const result = keys.map((k) => ({
      ...k,
      active: k.revoked_at === null,
    }));

    return apiSuccess(result);
  } catch (error) {
    console.error('GET /api/v1/api-keys error:', error);
    return apiError('Failed to fetch API keys', 500);
  }
});

/**
 * POST /api/v1/api-keys
 * Create a new API key. Key value returned ONCE — store it immediately.
 * Requires API key auth.
 */
export const POST = withApiKey(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parsed = createApiKeySchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Validation failed', 400, parsed.error.flatten());
    }

    const { label } = parsed.data;
    const key = crypto.randomUUID();

    const db = await getDbAsync();
    const result = await db
      .insert(apiKeys)
      .values({ key, label })
      .returning({ id: apiKeys.id, label: apiKeys.label, created_at: apiKeys.created_at });

    return apiCreated({
      id: result[0].id,
      label: result[0].label,
      created_at: result[0].created_at,
      key, // Only time the plaintext key is returned
    });
  } catch (error) {
    console.error('POST /api/v1/api-keys error:', error);
    return apiError('Failed to create API key', 500);
  }
});

/**
 * DELETE /api/v1/api-keys
 * Revoke an API key by ID (sets revoked_at timestamp).
 * Body: { id: number }
 * Requires API key auth.
 */
export const DELETE = withApiKey(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const id = body?.id;

    if (!id || typeof id !== 'number') {
      return apiError('id (number) is required in request body', 400);
    }

    const db = await getDbAsync();

    const existing = await db
      .select({ id: apiKeys.id, revoked_at: apiKeys.revoked_at })
      .from(apiKeys)
      .where(eq(apiKeys.id, id))
      .get();

    if (!existing) {
      return apiError('API key not found', 404);
    }

    if (existing.revoked_at !== null) {
      return apiError('API key is already revoked', 409);
    }

    await db
      .update(apiKeys)
      .set({ revoked_at: new Date().toISOString() })
      .where(eq(apiKeys.id, id));

    return apiSuccess({ id, revoked: true });
  } catch (error) {
    console.error('DELETE /api/v1/api-keys error:', error);
    return apiError('Failed to revoke API key', 500);
  }
});
