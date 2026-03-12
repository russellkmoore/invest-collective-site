'use server';

import { revalidatePath } from 'next/cache';
import { and, desc, eq, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import {
  theses,
  thesisDataPoints,
  thesisDataHistory,
  thesisUpdates,
} from '../../../../drizzle/schema';
import {
  generateSlug,
  calculateConfidenceScore,
  determineDataPointStatus,
  calculateOutcomeScore,
  type Thesis,
  type ThesisDataPoint,
} from '@/lib/thesis-scoring';

interface CreateThesisInput {
  title: string;
  event_description: string;
  hypothesis: string;
  timeframe: string;
  rationale: string;
  category: string;
  subcategory?: string;
  tags: string[];
  event_date: string;
  prediction_start_date: string;
  prediction_end_date: string;
  generation_method?: string;
  ai_model?: string;
  ai_prompt_version?: string;
  source_headlines?: string;
  data_points: Array<{
    name: string;
    metric_type: string;
    data_source: string;
    data_source_identifier?: string;
    target_value: number;
    target_direction: string;
    target_threshold_low?: number;
    target_threshold_high?: number;
  }>;
  created_by: string;
}

/**
 * Create a new thesis with associated data points.
 * Data points are inserted atomically via a single multi-row insert to prevent partial creation.
 * Returns the generated slug on success for client-side redirect.
 */
export async function createThesis(input: CreateThesisInput): Promise<{
  success: boolean;
  error?: string;
  slug?: string;
}> {
  try {
    const db = getDb();

    // Validate data points count
    if (input.data_points.length < 2 || input.data_points.length > 8) {
      return { success: false, error: 'Thesis must have between 2 and 8 data points' };
    }

    const slug = generateSlug(input.title);

    // Check if slug already exists
    const existing = await db
      .select({ id: theses.id })
      .from(theses)
      .where(eq(theses.slug, slug))
      .get();

    if (existing) {
      return { success: false, error: 'A thesis with this title already exists' };
    }

    // Insert thesis and get the new ID
    const thesisResult = await db
      .insert(theses)
      .values({
        slug,
        title: input.title,
        event_description: input.event_description,
        hypothesis: input.hypothesis,
        timeframe: input.timeframe,
        rationale: input.rationale,
        category: input.category,
        subcategory: input.subcategory ?? null,
        tags: JSON.stringify(input.tags),
        status: 'active',
        confidence_score: 0,
        created_by: input.created_by,
        event_date: input.event_date,
        prediction_start_date: input.prediction_start_date,
        prediction_end_date: input.prediction_end_date,
        generation_method: input.generation_method ?? 'manual',
        ai_model: input.ai_model ?? null,
        ai_prompt_version: input.ai_prompt_version ?? null,
        source_headlines: input.source_headlines ?? null,
      })
      .returning({ id: theses.id });

    const thesisId = thesisResult[0].id;

    // Insert all data points atomically via a single multi-row insert
    await db.insert(thesisDataPoints).values(
      input.data_points.map((dp) => ({
        thesis_id: thesisId,
        name: dp.name,
        metric_type: dp.metric_type,
        data_source: dp.data_source,
        data_source_identifier: dp.data_source_identifier ?? null,
        target_value: dp.target_value,
        target_direction: dp.target_direction,
        target_threshold_low: dp.target_threshold_low ?? null,
        target_threshold_high: dp.target_threshold_high ?? null,
        weight: 1.0,
        current_status: 'pending',
      }))
    );

    // Create initial update entry
    await db.insert(thesisUpdates).values({
      thesis_id: thesisId,
      update_type: 'status_change',
      content: 'Thesis created and activated',
      created_by: input.created_by,
    });

    revalidatePath('/admin/thesis');
    revalidatePath('/thesis-tracker');

    return { success: true, slug };
  } catch (error) {
    console.error('Failed to create thesis:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create thesis',
    };
  }
}

/**
 * Get all theses for the admin view.
 * Accepts optional filters for status and category; uses chainable Drizzle .where() clauses.
 */
export async function getAllTheses(filters?: {
  status?: string;
  category?: string;
}): Promise<Thesis[]> {
  try {
    const db = getDb();

    let query = db.select().from(theses).$dynamic();

    if (filters?.status && filters?.category) {
      query = query.where(and(eq(theses.status, filters.status), eq(theses.category, filters.category)));
    } else if (filters?.status) {
      query = query.where(eq(theses.status, filters.status));
    } else if (filters?.category) {
      query = query.where(eq(theses.category, filters.category));
    }

    const results = await query.orderBy(desc(theses.created_at));
    return results as unknown as Thesis[];
  } catch (error) {
    console.error('Failed to fetch theses:', error);
    return [];
  }
}

/**
 * Get a thesis by its URL slug along with all associated data points.
 * Returns null for the thesis if not found.
 */
export async function getThesisBySlug(slug: string): Promise<{
  thesis: Thesis | null;
  dataPoints: ThesisDataPoint[];
}> {
  try {
    const db = getDb();

    const thesis = await db
      .select()
      .from(theses)
      .where(eq(theses.slug, slug))
      .get();

    if (!thesis) {
      return { thesis: null, dataPoints: [] };
    }

    const dataPoints = await db
      .select()
      .from(thesisDataPoints)
      .where(eq(thesisDataPoints.thesis_id, thesis.id))
      .orderBy(thesisDataPoints.created_at);

    return {
      thesis: thesis as unknown as Thesis,
      dataPoints: dataPoints as unknown as ThesisDataPoint[],
    };
  } catch (error) {
    console.error('Failed to fetch thesis:', error);
    return { thesis: null, dataPoints: [] };
  }
}

/**
 * Update a data point's current value, record history, and recalculate the parent thesis confidence score.
 * Also creates a thesis_update entry to track the change.
 */
export async function updateDataPointValue(
  dataPointId: number,
  currentValue: number,
  updatedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getDb();

    // Get the data point
    const dataPoint = await db
      .select()
      .from(thesisDataPoints)
      .where(eq(thesisDataPoints.id, dataPointId))
      .get();

    if (!dataPoint) {
      return { success: false, error: 'Data point not found' };
    }

    const newStatus = determineDataPointStatus(dataPoint as unknown as ThesisDataPoint, currentValue);

    // Update data point current value and status
    await db
      .update(thesisDataPoints)
      .set({
        current_value: currentValue,
        current_status: newStatus,
        last_updated: sql`datetime('now')`,
      })
      .where(eq(thesisDataPoints.id, dataPointId));

    // Insert history entry
    await db.insert(thesisDataHistory).values({
      data_point_id: dataPointId,
      value: currentValue,
      source: 'manual',
    });

    // Recalculate confidence score from all data points of this thesis
    const allDataPoints = await db
      .select()
      .from(thesisDataPoints)
      .where(eq(thesisDataPoints.thesis_id, dataPoint.thesis_id));

    const confidence = calculateConfidenceScore(allDataPoints as unknown as ThesisDataPoint[]);

    // Update thesis confidence score
    await db
      .update(theses)
      .set({
        confidence_score: confidence,
        updated_at: sql`datetime('now')`,
      })
      .where(eq(theses.id, dataPoint.thesis_id));

    // Create update entry for the audit trail
    await db.insert(thesisUpdates).values({
      thesis_id: dataPoint.thesis_id,
      update_type: 'data_update',
      content: `Updated ${dataPoint.name}: ${currentValue}`,
      created_by: updatedBy,
      old_value: dataPoint.current_value?.toString() ?? 'null',
      new_value: currentValue.toString(),
    });

    revalidatePath('/admin/thesis');
    revalidatePath('/thesis-tracker');
    revalidatePath('/thesis-tracker/performance');

    return { success: true };
  } catch (error) {
    console.error('Failed to update data point:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update data point',
    };
  }
}

/**
 * Add a commentary or note to a thesis update log.
 * Visible in the admin thesis detail view as a timeline entry.
 */
export async function addThesisComment(
  thesisId: number,
  content: string,
  createdBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getDb();

    await db.insert(thesisUpdates).values({
      thesis_id: thesisId,
      update_type: 'comment',
      content,
      created_by: createdBy,
    });

    revalidatePath('/admin/thesis');
    revalidatePath('/thesis-tracker');

    return { success: true };
  } catch (error) {
    console.error('Failed to add comment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add comment',
    };
  }
}

/**
 * Close a thesis, compute its final outcome score, and record closing commentary.
 * Sets status to 'closed' and captures closed_at timestamp.
 */
export async function closeThesis(
  thesisId: number,
  closingCommentary: string,
  closedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getDb();

    // Get all data points to calculate final outcome
    const dataPoints = await db
      .select()
      .from(thesisDataPoints)
      .where(eq(thesisDataPoints.thesis_id, thesisId));

    const outcomeScore = calculateOutcomeScore(dataPoints as unknown as ThesisDataPoint[]);
    const outcomeCorrect = outcomeScore >= 70;

    // Mark thesis as closed with outcome score and correctness determination
    await db
      .update(theses)
      .set({
        status: 'closed',
        outcome_score: outcomeScore,
        outcome_correct: outcomeCorrect,
        closed_at: sql`datetime('now')`,
        updated_at: sql`datetime('now')`,
      })
      .where(eq(theses.id, thesisId));

    // Add closing commentary to update log (commentary is optional)
    const commentContent = closingCommentary.trim()
      ? `Thesis closed: ${closingCommentary}`
      : 'Thesis closed';
    await db.insert(thesisUpdates).values({
      thesis_id: thesisId,
      update_type: 'status_change',
      content: commentContent,
      created_by: closedBy,
    });

    revalidatePath('/admin/thesis');
    revalidatePath('/thesis-tracker');
    revalidatePath('/thesis-tracker/performance');

    return { success: true };
  } catch (error) {
    console.error('Failed to close thesis:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to close thesis',
    };
  }
}

/**
 * Get the historical value entries for a specific data point.
 * Returns up to 50 most recent entries, ordered newest first.
 */
export async function getDataPointHistory(dataPointId: number): Promise<{
  id: number;
  value: number;
  timestamp: string;
  source: string | null;
}[]> {
  const db = getDb();
  return db
    .select()
    .from(thesisDataHistory)
    .where(eq(thesisDataHistory.data_point_id, dataPointId))
    .orderBy(desc(thesisDataHistory.timestamp))
    .limit(50);
}

/**
 * Permanently delete a thesis and all related data (data points, history, updates).
 * Deletion is cascaded at the DB level — admin only.
 */
export async function deleteThesis(thesisId: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const db = getDb();

    // CASCADE deletes related data points, history, updates, and snapshots
    await db.delete(theses).where(eq(theses.id, thesisId));

    revalidatePath('/admin/thesis');
    revalidatePath('/thesis-tracker');

    return { success: true };
  } catch (error) {
    console.error('Failed to delete thesis:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete thesis',
    };
  }
}
