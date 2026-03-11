import { NextRequest } from 'next/server';
import { getDbAsync } from '@/lib/db';
import { theses, thesisDataPoints, thesisUpdates } from '../../../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api-response';
import { withApiKey } from '@/lib/api-auth';

type Context = { params: Promise<{ slug: string }> };

/**
 * GET /api/v1/theses/[slug]
 * Fetch a single thesis with data points and updates. Public.
 */
export async function GET(req: NextRequest, { params }: Context) {
  try {
    const { slug } = await params;
    const db = await getDbAsync();

    const thesis = await db
      .select()
      .from(theses)
      .where(eq(theses.slug, slug))
      .get();

    if (!thesis) {
      return apiError('Thesis not found', 404);
    }

    const dataPoints = await db
      .select()
      .from(thesisDataPoints)
      .where(eq(thesisDataPoints.thesis_id, thesis.id));

    const updates = await db
      .select()
      .from(thesisUpdates)
      .where(eq(thesisUpdates.thesis_id, thesis.id));

    return apiSuccess({ thesis, dataPoints, updates });
  } catch (error) {
    console.error('GET /api/v1/theses/[slug] error:', error);
    return apiError('Failed to fetch thesis', 500);
  }
}

/**
 * PUT /api/v1/theses/[slug]
 * Update thesis fields. Requires API key auth.
 */
export const PUT = withApiKey(async (req: NextRequest, { params }: Context) => {
  try {
    const { slug } = await params;
    const body = await req.json();
    const db = await getDbAsync();

    const thesis = await db
      .select({ id: theses.id })
      .from(theses)
      .where(eq(theses.slug, slug))
      .get();

    if (!thesis) {
      return apiError('Thesis not found', 404);
    }

    // Allow partial updates — only defined fields
    const allowedFields: (keyof typeof theses.$inferInsert)[] = [
      'title', 'hypothesis', 'timeframe', 'rationale', 'category',
      'subcategory', 'tags', 'status', 'outcome_notes', 'outcome_correct',
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return apiError('No valid fields to update', 400);
    }

    await db
      .update(theses)
      .set({ ...updates, updated_at: new Date().toISOString() })
      .where(eq(theses.slug, slug));

    return apiSuccess({ slug, updated: true });
  } catch (error) {
    console.error('PUT /api/v1/theses/[slug] error:', error);
    return apiError('Failed to update thesis', 500);
  }
});

/**
 * DELETE /api/v1/theses/[slug]
 * Delete thesis and cascade to related records. Requires API key auth.
 */
export const DELETE = withApiKey(async (req: NextRequest, { params }: Context) => {
  try {
    const { slug } = await params;
    const db = await getDbAsync();

    const thesis = await db
      .select({ id: theses.id })
      .from(theses)
      .where(eq(theses.slug, slug))
      .get();

    if (!thesis) {
      return apiError('Thesis not found', 404);
    }

    // Delete cascade: data points, updates (history cascades from data points)
    await db.delete(thesisDataPoints).where(eq(thesisDataPoints.thesis_id, thesis.id));
    await db.delete(thesisUpdates).where(eq(thesisUpdates.thesis_id, thesis.id));
    await db.delete(theses).where(eq(theses.id, thesis.id));

    return apiSuccess({ slug, deleted: true });
  } catch (error) {
    console.error('DELETE /api/v1/theses/[slug] error:', error);
    return apiError('Failed to delete thesis', 500);
  }
});
