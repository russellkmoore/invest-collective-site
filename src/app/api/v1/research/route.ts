import { NextRequest } from 'next/server';
import { getDbAsync } from '@/lib/db';
import { articles } from '../../../../../drizzle/schema';
import { desc, eq } from 'drizzle-orm';
import { apiSuccess, apiError, apiCreated } from '@/lib/api-response';
import { withApiKey } from '@/lib/api-auth';
import { createArticleSchema } from '@/lib/validation-schemas';
import { generateSlug } from '@/lib/thesis-scoring';

/**
 * GET /api/v1/research
 * List published articles. Public — no auth required.
 * Optional query param: ?topic=macro
 */
export async function GET(req: NextRequest) {
  try {
    const db = await getDbAsync();
    const { searchParams } = req.nextUrl;
    const topicFilter = searchParams.get('topic');

    // Base query: only published articles for public access
    let query = db
      .select()
      .from(articles)
      .where(eq(articles.status, 'published'))
      .$dynamic();

    // If topic filter provided, apply post-query filter (topics is JSON)
    const results = await query.orderBy(desc(articles.date));

    if (topicFilter) {
      const filtered = results.filter((a) => {
        try {
          const topics = JSON.parse(a.topics) as string[];
          return topics.some((t) => t.toLowerCase() === topicFilter.toLowerCase());
        } catch {
          return false;
        }
      });
      return apiSuccess(filtered);
    }

    return apiSuccess(results);
  } catch (error) {
    console.error('GET /api/v1/research error:', error);
    return apiError('Failed to fetch research articles', 500);
  }
}

/**
 * POST /api/v1/research
 * Create a new research article. Requires API key auth.
 */
export const POST = withApiKey(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parsed = createArticleSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Validation failed', 400, parsed.error.flatten());
    }

    const input = parsed.data;
    const db = await getDbAsync();

    const slug = generateSlug(input.title);

    // Check for slug collision
    const existing = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.slug, slug))
      .get();

    if (existing) {
      return apiError('An article with this title already exists', 409);
    }

    const result = await db
      .insert(articles)
      .values({
        slug,
        title: input.title,
        date: input.date,
        topics: JSON.stringify(input.topics),
        summary: input.summary,
        html_content: '',
        pdf_url: '',
        pdf_filename: '',
        status: input.status,
      })
      .returning({ id: articles.id, slug: articles.slug });

    return apiCreated({ id: result[0].id, slug: result[0].slug });
  } catch (error) {
    console.error('POST /api/v1/research error:', error);
    return apiError('Failed to create article', 500);
  }
});
