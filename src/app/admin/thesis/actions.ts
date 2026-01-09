'use server';

import { revalidatePath } from 'next/cache';
import { getCloudflareContext } from '@opennextjs/cloudflare';
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
  tags: string[]; // Will be stored as JSON
  event_date: string;
  prediction_start_date: string;
  prediction_end_date: string;
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
 * Create a new thesis with data points
 */
export async function createThesis(input: CreateThesisInput): Promise<{
  success: boolean;
  error?: string;
  slug?: string;
}> {
  try {
    const { env } = getCloudflareContext();
    const { DB } = env;

    // Generate slug
    const slug = generateSlug(input.title);

    // Check if slug already exists
    const existing = await DB.prepare('SELECT id FROM theses WHERE slug = ?')
      .bind(slug)
      .first<{ id: number }>();

    if (existing) {
      return { success: false, error: 'A thesis with this title already exists' };
    }

    // Validate data points count
    if (input.data_points.length < 2 || input.data_points.length > 8) {
      return { success: false, error: 'Thesis must have between 2 and 8 data points' };
    }

    // Insert thesis
    const thesisResult = await DB.prepare(
      `INSERT INTO theses (
        slug, title, event_description, hypothesis, timeframe, rationale,
        category, subcategory, tags, status, confidence_score,
        created_by, event_date, prediction_start_date, prediction_end_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 0, ?, ?, ?, ?)`
    )
      .bind(
        slug,
        input.title,
        input.event_description,
        input.hypothesis,
        input.timeframe,
        input.rationale,
        input.category,
        input.subcategory || null,
        JSON.stringify(input.tags),
        input.created_by,
        input.event_date,
        input.prediction_start_date,
        input.prediction_end_date
      )
      .run();

    const thesisId = thesisResult.meta.last_row_id;

    // Insert data points
    for (const dp of input.data_points) {
      await DB.prepare(
        `INSERT INTO thesis_data_points (
          thesis_id, name, metric_type, data_source, data_source_identifier,
          target_value, target_direction, target_threshold_low, target_threshold_high,
          weight, current_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1.0, 'pending')`
      )
        .bind(
          thesisId,
          dp.name,
          dp.metric_type,
          dp.data_source,
          dp.data_source_identifier || null,
          dp.target_value,
          dp.target_direction,
          dp.target_threshold_low || null,
          dp.target_threshold_high || null
        )
        .run();
    }

    // Create initial update entry
    await DB.prepare(
      `INSERT INTO thesis_updates (thesis_id, update_type, content, created_by)
       VALUES (?, 'status_change', 'Thesis created and activated', ?)`
    )
      .bind(thesisId, input.created_by)
      .run();

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
 * Get all theses (admin view)
 */
export async function getAllTheses(filters?: {
  status?: string;
  category?: string;
}): Promise<Thesis[]> {
  try {
    const { env } = getCloudflareContext();
    const { DB } = env;

    let query = 'SELECT * FROM theses';
    const conditions: string[] = [];
    const bindings: string[] = [];

    if (filters?.status) {
      conditions.push('status = ?');
      bindings.push(filters.status);
    }

    if (filters?.category) {
      conditions.push('category = ?');
      bindings.push(filters.category);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const stmt = DB.prepare(query);
    if (bindings.length > 0) {
      bindings.forEach((binding) => stmt.bind(binding));
    }

    const result = await stmt.all<Thesis>();
    return result.results || [];
  } catch (error) {
    console.error('Failed to fetch theses:', error);
    return [];
  }
}

/**
 * Get thesis by slug with data points
 */
export async function getThesisBySlug(slug: string): Promise<{
  thesis: Thesis | null;
  dataPoints: ThesisDataPoint[];
}> {
  try {
    const { env } = getCloudflareContext();
    const { DB } = env;

    const thesis = await DB.prepare('SELECT * FROM theses WHERE slug = ?')
      .bind(slug)
      .first<Thesis>();

    if (!thesis) {
      return { thesis: null, dataPoints: [] };
    }

    const dataPoints = await DB.prepare(
      'SELECT * FROM thesis_data_points WHERE thesis_id = ? ORDER BY created_at ASC'
    )
      .bind(thesis.id)
      .all<ThesisDataPoint>();

    return {
      thesis,
      dataPoints: dataPoints.results || [],
    };
  } catch (error) {
    console.error('Failed to fetch thesis:', error);
    return { thesis: null, dataPoints: [] };
  }
}

/**
 * Update data point value and recalculate confidence
 */
export async function updateDataPointValue(
  dataPointId: number,
  currentValue: number,
  updatedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { env } = getCloudflareContext();
    const { DB } = env;

    // Get data point
    const dataPoint = await DB.prepare('SELECT * FROM thesis_data_points WHERE id = ?')
      .bind(dataPointId)
      .first<ThesisDataPoint>();

    if (!dataPoint) {
      return { success: false, error: 'Data point not found' };
    }

    // Determine new status
    const newStatus = determineDataPointStatus(dataPoint, currentValue);

    // Update data point
    await DB.prepare(
      `UPDATE thesis_data_points
       SET current_value = ?, current_status = ?, last_updated = datetime('now')
       WHERE id = ?`
    )
      .bind(currentValue, newStatus, dataPointId)
      .run();

    // Insert into history
    await DB.prepare(
      `INSERT INTO thesis_data_history (data_point_id, value, timestamp, source)
       VALUES (?, ?, datetime('now'), 'manual')`
    )
      .bind(dataPointId, currentValue)
      .run();

    // Get all data points for this thesis to recalculate confidence
    const allDataPoints = await DB.prepare(
      `SELECT * FROM thesis_data_points WHERE thesis_id = ?`
    )
      .bind(dataPoint.thesis_id)
      .all<ThesisDataPoint>();

    const confidence = calculateConfidenceScore(allDataPoints.results || []);

    // Update thesis confidence score
    await DB.prepare(
      `UPDATE theses SET confidence_score = ?, updated_at = datetime('now') WHERE id = ?`
    )
      .bind(confidence, dataPoint.thesis_id)
      .run();

    // Create update entry
    await DB.prepare(
      `INSERT INTO thesis_updates (thesis_id, update_type, content, created_by, old_value, new_value)
       VALUES (?, 'data_update', ?, ?, ?, ?)`
    )
      .bind(
        dataPoint.thesis_id,
        `Updated ${dataPoint.name}: ${currentValue}`,
        updatedBy,
        dataPoint.current_value?.toString() || 'null',
        currentValue.toString()
      )
      .run();

    revalidatePath('/admin/thesis');
    revalidatePath('/thesis-tracker');

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
 * Add commentary/note to thesis
 */
export async function addThesisComment(
  thesisId: number,
  content: string,
  createdBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { env } = getCloudflareContext();
    const { DB } = env;

    await DB.prepare(
      `INSERT INTO thesis_updates (thesis_id, update_type, content, created_by)
       VALUES (?, 'comment', ?, ?)`
    )
      .bind(thesisId, content, createdBy)
      .run();

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
 * Close thesis and calculate final outcome score
 */
export async function closeThesis(
  thesisId: number,
  closingCommentary: string,
  closedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { env } = getCloudflareContext();
    const { DB } = env;

    // Get all data points
    const dataPoints = await DB.prepare(
      'SELECT * FROM thesis_data_points WHERE thesis_id = ?'
    )
      .bind(thesisId)
      .all<ThesisDataPoint>();

    // Calculate final outcome score
    const outcomeScore = calculateOutcomeScore(dataPoints.results || []);

    // Update thesis
    await DB.prepare(
      `UPDATE theses
       SET status = 'closed', outcome_score = ?, closed_at = datetime('now'), updated_at = datetime('now')
       WHERE id = ?`
    )
      .bind(outcomeScore, thesisId)
      .run();

    // Add closing commentary
    await DB.prepare(
      `INSERT INTO thesis_updates (thesis_id, update_type, content, created_by)
       VALUES (?, 'status_change', ?, ?)`
    )
      .bind(thesisId, `Thesis closed: ${closingCommentary}`, closedBy)
      .run();

    revalidatePath('/admin/thesis');
    revalidatePath('/thesis-tracker');

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
 * Delete thesis (admin only)
 */
export async function deleteThesis(thesisId: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { env } = getCloudflareContext();
    const { DB } = env;

    // CASCADE will delete related data points, history, updates, and snapshots
    await DB.prepare('DELETE FROM theses WHERE id = ?').bind(thesisId).run();

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
