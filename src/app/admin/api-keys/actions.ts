'use server';

import { getDb } from '@/lib/db';
import { apiKeys } from '../../../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { createApiKeySchema } from '@/lib/validation-schemas';

export interface ApiKeyRow {
  id: number;
  label: string;
  created_at: string;
  revoked_at: string | null;
}

/**
 * List all API keys (without key column) ordered by newest first.
 */
export async function listApiKeys(): Promise<ApiKeyRow[]> {
  try {
    const db = getDb();
    const keys = await db
      .select({
        id: apiKeys.id,
        label: apiKeys.label,
        created_at: apiKeys.created_at,
        revoked_at: apiKeys.revoked_at,
      })
      .from(apiKeys)
      .orderBy(desc(apiKeys.created_at));

    return keys;
  } catch (error) {
    console.error('listApiKeys error:', error);
    return [];
  }
}

/**
 * Create a new API key with the given label.
 * Returns the plaintext key once — caller must display it immediately.
 */
export async function createApiKey(
  formData: FormData
): Promise<{ success: boolean; key?: string; id?: number; label?: string; error?: string }> {
  try {
    const raw = { label: formData.get('label') as string };
    const parsed = createApiKeySchema.safeParse(raw);

    if (!parsed.success) {
      const firstError = parsed.error.flatten().fieldErrors?.label?.[0] ?? 'Validation failed';
      return { success: false, error: firstError };
    }

    const { label } = parsed.data;
    const key = crypto.randomUUID();

    const db = getDb();
    const result = await db
      .insert(apiKeys)
      .values({ key, label })
      .returning({ id: apiKeys.id, label: apiKeys.label });

    return { success: true, key, id: result[0].id, label: result[0].label };
  } catch (error) {
    console.error('createApiKey error:', error);
    return { success: false, error: 'Failed to create API key' };
  }
}

/**
 * Revoke an API key by setting its revoked_at timestamp.
 */
export async function revokeApiKey(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const id = parseInt(formData.get('id') as string, 10);
    if (isNaN(id)) {
      return { success: false, error: 'Invalid key ID' };
    }

    const db = getDb();
    await db
      .update(apiKeys)
      .set({ revoked_at: new Date().toISOString() })
      .where(eq(apiKeys.id, id));

    return { success: true };
  } catch (error) {
    console.error('revokeApiKey error:', error);
    return { success: false, error: 'Failed to revoke API key' };
  }
}
