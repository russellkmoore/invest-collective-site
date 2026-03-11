import { NextRequest } from 'next/server';
import { getDbAsync } from '@/lib/db';
import { theses, thesisDataPoints, thesisUpdates } from '../../../../../drizzle/schema';
import { and, desc, eq } from 'drizzle-orm';
import { apiSuccess, apiError, apiCreated } from '@/lib/api-response';
import { withApiKey } from '@/lib/api-auth';
import { createThesisSchema } from '@/lib/validation-schemas';
import { generateSlug } from '@/lib/thesis-scoring';

/**
 * GET /api/v1/theses
 * List all theses. Public — no auth required.
 * Optional query params: ?status=active&category=stocks
 */
export async function GET(req: NextRequest) {
  try {
    const db = await getDbAsync();
    const { searchParams } = req.nextUrl;
    const statusFilter = searchParams.get('status');
    const categoryFilter = searchParams.get('category');

    let query = db.select().from(theses).$dynamic();

    if (statusFilter && categoryFilter) {
      query = query.where(and(eq(theses.status, statusFilter), eq(theses.category, categoryFilter)));
    } else if (statusFilter) {
      query = query.where(eq(theses.status, statusFilter));
    } else if (categoryFilter) {
      query = query.where(eq(theses.category, categoryFilter));
    }

    const results = await query.orderBy(desc(theses.created_at));
    return apiSuccess(results);
  } catch (error) {
    console.error('GET /api/v1/theses error:', error);
    return apiError('Failed to fetch theses', 500);
  }
}

/**
 * POST /api/v1/theses
 * Create a new thesis with data points. Requires API key auth.
 */
export const POST = withApiKey(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parsed = createThesisSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Validation failed', 400, parsed.error.flatten());
    }

    const input = parsed.data;
    const db = await getDbAsync();

    const slug = generateSlug(input.title);

    // Check for slug collision
    const existing = await db
      .select({ id: theses.id })
      .from(theses)
      .where(eq(theses.slug, slug))
      .get();

    if (existing) {
      return apiError('A thesis with this title already exists', 409);
    }

    // Insert thesis
    const thesisResult = await db
      .insert(theses)
      .values({
        slug,
        title: input.title,
        event_description: '',
        hypothesis: input.hypothesis,
        timeframe: input.timeframe,
        rationale: '',
        category: input.category,
        tags: JSON.stringify(input.tags),
        status: 'active',
        confidence_score: 0,
        created_by: 'api',
        event_date: new Date().toISOString().split('T')[0],
        prediction_start_date: new Date().toISOString().split('T')[0],
        prediction_end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        generation_method:
          input.source === 'ai' ? 'ai' : input.source === 'hybrid' ? 'hybrid' : 'manual',
      })
      .returning({ id: theses.id, slug: theses.slug });

    const thesisId = thesisResult[0].id;

    // Batch insert data points
    if (input.data_points.length > 0) {
      await db.insert(thesisDataPoints).values(
        input.data_points.map((dp) => ({
          thesis_id: thesisId,
          name: dp.name,
          metric_type: dp.metric_type,
          data_source: dp.data_source,
          data_source_identifier: dp.data_source_identifier ?? null,
          target_value: dp.target_value,
          target_direction: dp.target_direction,
          target_threshold_low: dp.threshold_low ?? null,
          target_threshold_high: dp.threshold_high ?? null,
          unit: dp.unit ?? null,
          weight: dp.weight ?? 1,
          current_status: 'pending',
        }))
      );
    }

    // Insert initial update
    await db.insert(thesisUpdates).values({
      thesis_id: thesisId,
      update_type: 'status_change',
      content: 'Thesis created via API and activated',
      created_by: 'api',
    });

    return apiCreated({ id: thesisId, slug });
  } catch (error) {
    console.error('POST /api/v1/theses error:', error);
    return apiError('Failed to create thesis', 500);
  }
});
