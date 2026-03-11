import { NextRequest } from 'next/server';
import { getDbAsync } from '@/lib/db';
import { articles } from '../../../../../../drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api-response';
import { withApiKey } from '@/lib/api-auth';
import { updateArticleSchema } from '@/lib/validation-schemas';

type Context = { params: Promise<{ slug: string }> };

/**
 * GET /api/v1/research/[slug]
 * Fetch a single published article. Public.
 * Filters by status='published' — drafts are not accessible without auth.
 */
export async function GET(req: NextRequest, { params }: Context) {
  try {
    const { slug } = await params;
    const db = await getDbAsync();

    const article = await db
      .select()
      .from(articles)
      .where(and(eq(articles.slug, slug), eq(articles.status, 'published')))
      .get();

    if (!article) {
      return apiError('Article not found', 404);
    }

    return apiSuccess(article);
  } catch (error) {
    console.error('GET /api/v1/research/[slug] error:', error);
    return apiError('Failed to fetch article', 500);
  }
}

/**
 * PUT /api/v1/research/[slug]
 * Update article fields. Requires API key auth.
 */
export const PUT = withApiKey(async (req: NextRequest, { params }: Context) => {
  try {
    const { slug } = await params;
    const body = await req.json();

    const parsed = updateArticleSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Validation failed', 400, parsed.error.flatten());
    }

    const db = await getDbAsync();

    const article = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.slug, slug))
      .get();

    if (!article) {
      return apiError('Article not found', 404);
    }

    const updates: Record<string, unknown> = {};
    const input = parsed.data;

    if (input.title !== undefined) updates.title = input.title;
    if (input.date !== undefined) updates.date = input.date;
    if (input.topics !== undefined) updates.topics = JSON.stringify(input.topics);
    if (input.summary !== undefined) updates.summary = input.summary;
    if (input.html_content !== undefined) updates.html_content = input.html_content;
    if (input.status !== undefined) updates.status = input.status;

    if (Object.keys(updates).length === 0) {
      return apiError('No valid fields to update', 400);
    }

    await db
      .update(articles)
      .set({ ...updates, updated_at: new Date().toISOString() })
      .where(eq(articles.slug, slug));

    return apiSuccess({ slug, updated: true });
  } catch (error) {
    console.error('PUT /api/v1/research/[slug] error:', error);
    return apiError('Failed to update article', 500);
  }
});

/**
 * DELETE /api/v1/research/[slug]
 * Delete an article. Requires API key auth.
 */
export const DELETE = withApiKey(async (req: NextRequest, { params }: Context) => {
  try {
    const { slug } = await params;
    const db = await getDbAsync();

    const article = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.slug, slug))
      .get();

    if (!article) {
      return apiError('Article not found', 404);
    }

    await db.delete(articles).where(eq(articles.slug, slug));

    return apiSuccess({ slug, deleted: true });
  } catch (error) {
    console.error('DELETE /api/v1/research/[slug] error:', error);
    return apiError('Failed to delete article', 500);
  }
});
