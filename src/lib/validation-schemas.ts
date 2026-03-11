/**
 * Zod validation schemas for all data mutation inputs.
 * OpenAPI metadata registered via @asteasolutions/zod-to-openapi for
 * future API documentation generation.
 */

import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

// ─── Thesis ───────────────────────────────────────────────────────────────────

const dataPointSchema = z.object({
  name: z.string().min(1, 'Data point name is required'),
  metric_type: z.string().min(1, 'Metric type is required'),
  data_source: z.string().min(1, 'Data source is required'),
  data_source_identifier: z.string().optional(),
  target_value: z.number(),
  target_direction: z.enum(['above', 'below', 'between', 'equals']),
  threshold_low: z.number().optional(),
  threshold_high: z.number().optional(),
  unit: z.string().optional(),
  weight: z.number().min(0).max(10).optional().default(1),
});

export const createThesisSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(200, 'Title must be under 200 characters'),
    hypothesis: z.string().min(1, 'Hypothesis is required'),
    category: z.string().min(1, 'Category is required'),
    timeframe: z.string().min(1, 'Timeframe is required'),
    source: z.enum(['human', 'ai', 'hybrid']),
    tags: z.array(z.string()).optional().default([]),
    key_arguments: z.string().optional(),
    contrarian_view: z.string().optional(),
    data_points: z
      .array(dataPointSchema)
      .min(2, 'At least 2 data points are required')
      .max(8, 'No more than 8 data points allowed'),
  })
  .openapi('CreateThesisRequest');

export const updateDataPointSchema = z
  .object({
    data_point_id: z.number().int().positive(),
    value: z.number(),
    source: z.string().optional(),
  })
  .openapi('UpdateDataPointRequest');

// ─── Research Articles ────────────────────────────────────────────────────────

export const createArticleSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    date: z.string().min(1, 'Date is required'),
    topics: z.array(z.string().min(1)).min(1, 'At least one topic is required'),
    summary: z.string().min(1, 'Summary is required'),
    status: z.enum(['draft', 'published']).default('draft'),
  })
  .openapi('CreateArticleRequest');

export const updateArticleSchema = z
  .object({
    title: z.string().min(1).optional(),
    date: z.string().optional(),
    topics: z.array(z.string().min(1)).optional(),
    summary: z.string().optional(),
    html_content: z.string().optional(),
    status: z.enum(['draft', 'published']).optional(),
  })
  .openapi('UpdateArticleRequest');

// ─── Member Signup ────────────────────────────────────────────────────────────

export const signupSchema = z
  .object({
    name: z.string().min(1, 'Full name is required'),
    email: z.string().email('A valid email address is required'),
    phone: z.string().min(1, 'Phone number is required'),
    years_investing: z.enum(['less-than-1', '1-3', '3-5', '5-10', '10-plus']),
    trading_style: z.enum([
      'day-trading',
      'swing-trading',
      'long-term',
      'long-term-investing',
      'value-investing',
      'growth-investing',
      'options-trading',
      'mixed',
      'other',
    ]),
    areas_of_expertise: z.string().min(1, 'Areas of expertise is required'),
    macro_knowledge: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    portfolio_size: z.enum([
      'under-10k',
      '10k-50k',
      '50k-100k',
      '100k-250k',
      '100k-500k',
      '250k-500k',
      '500k-plus',
    ]),
    investment_journey: z
      .string()
      .min(10, 'Please describe your investment journey (min 10 characters)'),
    expectations: z
      .string()
      .min(10, 'Please describe your expectations (min 10 characters)'),
    referral_source: z.string().optional(),
    /** Cloudflare Turnstile challenge token for bot protection */
    turnstile_token: z.string().min(1, 'Security verification is required'),
  })
  .openapi('SignupRequest');

// ─── Member Management (Admin) ────────────────────────────────────────────────

export const updateMemberSchema = z
  .object({
    status: z.enum(['pending', 'approved', 'active']),
    admin_notes: z.string().optional(),
    reviewed_by: z.string().min(1, 'Reviewer name is required'),
  })
  .openapi('UpdateMemberRequest');

// ─── API Keys ─────────────────────────────────────────────────────────────────

export const createApiKeySchema = z
  .object({
    label: z
      .string()
      .min(1, 'Label is required')
      .max(100, 'Label must be under 100 characters'),
  })
  .openapi('CreateApiKeyRequest');
