// Thesis scoring and data point status calculation utilities

// Core Types
export type ThesisStatus = 'active' | 'closed' | 'invalidated';
export type ThesisCategory = 'stocks' | 'fed_policy' | 'sector' | 'macro';
export type MetricType = 'price' | 'rate' | 'percentage' | 'boolean' | 'custom';
export type DataSource = 'manual' | 'yahoo_finance' | 'fred' | 'alpha_vantage';
export type TargetDirection = 'above' | 'below' | 'between' | 'equals';
export type DataPointStatus = 'pending' | 'on_track' | 'off_track' | 'met' | 'failed';

export interface ThesisDataPoint {
  id: number;
  thesis_id: number;
  name: string;
  metric_type: MetricType;
  data_source: DataSource;
  data_source_identifier?: string;
  target_value: number;
  target_direction: TargetDirection;
  target_threshold_low?: number;
  target_threshold_high?: number;
  weight: number;
  current_value?: number;
  current_status: DataPointStatus;
  last_updated?: string;
  created_at: string;
}

export interface Thesis {
  id: number;
  slug: string;
  title: string;
  event_description: string;
  hypothesis: string;
  timeframe: string;
  rationale: string;
  category: ThesisCategory;
  subcategory?: string;
  tags: string; // JSON array
  status: ThesisStatus;
  confidence_score: number;
  outcome_score?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  event_date: string;
  prediction_start_date: string;
  prediction_end_date: string;
  generation_method?: string;
  ai_model?: string;
  ai_prompt_version?: string;
  source_headlines?: string;
}

/**
 * Calculate confidence score based on data points
 * Simple average: (data_points_met / total_data_points) × 100
 */
export function calculateConfidenceScore(dataPoints: ThesisDataPoint[]): number {
  if (dataPoints.length === 0) return 0;

  const successfulPoints = dataPoints.filter(
    (dp) => dp.current_status === 'met' || dp.current_status === 'on_track'
  ).length;

  return Math.round((successfulPoints / dataPoints.length) * 100);
}

/**
 * Determine data point status based on current value vs target
 */
export function determineDataPointStatus(
  dataPoint: ThesisDataPoint,
  currentValue: number
): DataPointStatus {
  const { target_value, target_direction, target_threshold_low, target_threshold_high } = dataPoint;

  switch (target_direction) {
    case 'above':
      if (currentValue >= target_value) return 'met';
      if (currentValue >= target_value * 0.9) return 'on_track'; // Within 10%
      return 'off_track';

    case 'below':
      if (currentValue <= target_value) return 'met';
      if (currentValue <= target_value * 1.1) return 'on_track'; // Within 10%
      return 'off_track';

    case 'between':
      if (!target_threshold_low || !target_threshold_high) return 'pending';
      if (currentValue >= target_threshold_low && currentValue <= target_threshold_high) return 'met';
      // Check if close to range (within 5% of boundaries)
      const range = target_threshold_high - target_threshold_low;
      const margin = range * 0.05;
      if (currentValue >= target_threshold_low - margin && currentValue <= target_threshold_high + margin) {
        return 'on_track';
      }
      return 'off_track';

    case 'equals':
      if (Math.abs(currentValue - target_value) < 0.01) return 'met';
      if (Math.abs(currentValue - target_value) < target_value * 0.05) return 'on_track'; // Within 5%
      return 'off_track';

    default:
      return 'pending';
  }
}

/**
 * Calculate final outcome score when thesis is closed
 * More strict than confidence - only count 'met' status
 */
export function calculateOutcomeScore(dataPoints: ThesisDataPoint[]): number {
  if (dataPoints.length === 0) return 0;

  const metPoints = dataPoints.filter((dp) => dp.current_status === 'met').length;
  return Math.round((metPoints / dataPoints.length) * 100);
}

/**
 * Get human-readable status label
 */
export function getStatusLabel(score: number): string {
  if (score >= 70) return 'Successful';
  if (score >= 50) return 'Partial Success';
  return 'Failed';
}

/**
 * Get status color for UI (Tailwind classes)
 */
export function getStatusColor(score: number): string {
  if (score >= 70) return 'text-green-600 bg-green-100';
  if (score >= 50) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
}

/**
 * Calculate days remaining in prediction window
 */
export function calculateDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Calculate progress percentage through prediction window
 */
export function calculateTimeProgress(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  const totalMs = end.getTime() - start.getTime();
  const elapsedMs = now.getTime() - start.getTime();

  const progress = (elapsedMs / totalMs) * 100;
  return Math.max(0, Math.min(100, Math.round(progress)));
}

/**
 * Generate URL-friendly slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

/**
 * Validate prediction window (30 days to 365 days)
 */
export function validatePredictionWindow(startDate: string, endDate: string): {
  valid: boolean;
  error?: string;
} {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (start < now) {
    return { valid: false, error: 'Start date must be today or later' };
  }

  if (end <= start) {
    return { valid: false, error: 'End date must be after start date' };
  }

  const diffMs = end.getTime() - start.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 30) {
    return { valid: false, error: 'Prediction window must be at least 30 days' };
  }

  if (diffDays > 365) {
    return { valid: false, error: 'Prediction window cannot exceed 365 days' };
  }

  return { valid: true };
}
