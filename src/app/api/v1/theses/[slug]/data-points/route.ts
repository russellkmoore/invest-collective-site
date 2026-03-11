import { NextRequest } from 'next/server';
import { getDbAsync } from '@/lib/db';
import { theses, thesisDataPoints, thesisDataHistory, thesisUpdates } from '../../../../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api-response';
import { withApiKey } from '@/lib/api-auth';
import { updateDataPointSchema } from '@/lib/validation-schemas';
import {
  determineDataPointStatus,
  calculateConfidenceScore,
  type ThesisDataPoint,
} from '@/lib/thesis-scoring';

type Context = { params: Promise<{ slug: string }> };

/**
 * PUT /api/v1/theses/[slug]/data-points
 * Update a data point's current value, recalculate confidence score.
 * Inserts a history record. Requires API key auth.
 */
export const PUT = withApiKey(async (req: NextRequest, { params }: Context) => {
  try {
    const { slug } = await params;
    const body = await req.json();

    const parsed = updateDataPointSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Validation failed', 400, parsed.error.flatten());
    }

    const { data_point_id, value, source } = parsed.data;
    const db = await getDbAsync();

    // Verify thesis exists
    const thesis = await db
      .select({ id: theses.id })
      .from(theses)
      .where(eq(theses.slug, slug))
      .get();

    if (!thesis) {
      return apiError('Thesis not found', 404);
    }

    // Fetch data point
    const dataPoint = await db
      .select()
      .from(thesisDataPoints)
      .where(eq(thesisDataPoints.id, data_point_id))
      .get();

    if (!dataPoint || dataPoint.thesis_id !== thesis.id) {
      return apiError('Data point not found on this thesis', 404);
    }

    // Determine new status
    const newStatus = determineDataPointStatus(dataPoint as ThesisDataPoint, value);

    // Update data point
    await db
      .update(thesisDataPoints)
      .set({
        current_value: value,
        current_status: newStatus,
        last_updated: new Date().toISOString(),
      })
      .where(eq(thesisDataPoints.id, data_point_id));

    // Insert history record
    await db.insert(thesisDataHistory).values({
      data_point_id,
      value,
      source: source ?? 'api',
    });

    // Recalculate confidence score — fetch all updated data points
    const allDataPoints = await db
      .select()
      .from(thesisDataPoints)
      .where(eq(thesisDataPoints.thesis_id, thesis.id));

    const confidence = calculateConfidenceScore(allDataPoints as ThesisDataPoint[]);

    await db
      .update(theses)
      .set({ confidence_score: confidence, updated_at: new Date().toISOString() })
      .where(eq(theses.id, thesis.id));

    // Log update entry
    await db.insert(thesisUpdates).values({
      thesis_id: thesis.id,
      update_type: 'data_update',
      content: `Updated ${dataPoint.name}: ${value}`,
      created_by: 'api',
      old_value: dataPoint.current_value?.toString() ?? null,
      new_value: value.toString(),
    });

    return apiSuccess({ data_point_id, value, status: newStatus, confidence_score: confidence });
  } catch (error) {
    console.error('PUT /api/v1/theses/[slug]/data-points error:', error);
    return apiError('Failed to update data point', 500);
  }
});
