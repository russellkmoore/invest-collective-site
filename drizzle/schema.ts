/**
 * Drizzle ORM schema — mirrors the live D1 database tables exactly.
 * Column names match schema.sql and example-thesis-data.sql 1:1.
 * This is the single source of truth for TypeScript types after Drizzle migration.
 */

import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ─── articles ────────────────────────────────────────────────────────────────

export const articles = sqliteTable('articles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  date: text('date').notNull(),
  /** JSON array of topic strings */
  topics: text('topics').notNull(),
  summary: text('summary').notNull(),
  html_content: text('html_content').notNull(),
  pdf_url: text('pdf_url').notNull(),
  pdf_filename: text('pdf_filename').notNull(),
  /** 'draft' | 'published' */
  status: text('status').notNull().default('draft'),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// ─── analytics_events ────────────────────────────────────────────────────────

export const analyticsEvents = sqliteTable('analytics_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  /** 'page_view' | 'article_view' | 'pdf_download' | 'topic_filter' */
  event_type: text('event_type').notNull(),
  page_path: text('page_path'),
  article_slug: text('article_slug'),
  topic: text('topic'),
  user_agent: text('user_agent'),
  country: text('country'),
  referrer: text('referrer'),
  timestamp: text('timestamp').notNull().default(sql`(datetime('now'))`),
  // Parsed UA columns added per architecture decision (parse at write time)
  browser: text('browser'),
  device: text('device'),
  os: text('os'),
});

// ─── members ─────────────────────────────────────────────────────────────────

export const members = sqliteTable('members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  // Personal Information
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull(),
  // Investment Background
  /** 'less-than-1' | '1-3' | '3-5' | '5-10' | '10-plus' */
  years_investing: text('years_investing').notNull(),
  /** 'day-trading' | 'swing-trading' | 'long-term-investing' | 'options-trading' | 'other' */
  trading_style: text('trading_style').notNull(),
  areas_of_expertise: text('areas_of_expertise').notNull(),
  /** 'beginner' | 'intermediate' | 'advanced' | 'expert' */
  macro_knowledge: text('macro_knowledge').notNull(),
  /** 'under-10k' | '10k-50k' | '50k-100k' | '100k-500k' | '500k-plus' */
  portfolio_size: text('portfolio_size').notNull(),
  // Application Content
  investment_journey: text('investment_journey').notNull(),
  expectations: text('expectations').notNull(),
  referral_source: text('referral_source'),
  // Admin Fields
  /** 'pending' | 'approved' | 'active' */
  status: text('status').notNull().default('pending'),
  admin_notes: text('admin_notes'),
  reviewed_by: text('reviewed_by'),
  reviewed_at: text('reviewed_at'),
  approved_at: text('approved_at'),
  activated_at: text('activated_at'),
  // Metadata
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// ─── legal_pages ─────────────────────────────────────────────────────────────

export const legalPages = sqliteTable('legal_pages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  last_updated_by: text('last_updated_by').notNull(),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// ─── theses ───────────────────────────────────────────────────────────────────

export const theses = sqliteTable('theses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  /** Long-form description of the triggering event */
  event_description: text('event_description').notNull(),
  hypothesis: text('hypothesis').notNull(),
  timeframe: text('timeframe').notNull(),
  rationale: text('rationale').notNull(),
  /** 'stocks' | 'fed_policy' | 'sector' | 'macro' */
  category: text('category').notNull(),
  subcategory: text('subcategory'),
  /** JSON array of tag strings */
  tags: text('tags').notNull().default('[]'),
  /** 'active' | 'closed' | 'invalidated' */
  status: text('status').notNull().default('active'),
  confidence_score: real('confidence_score').notNull().default(0),
  outcome_score: real('outcome_score'),
  created_by: text('created_by').notNull(),
  event_date: text('event_date').notNull(),
  prediction_start_date: text('prediction_start_date').notNull(),
  prediction_end_date: text('prediction_end_date').notNull(),
  /** 'manual' | 'ai' | 'hybrid' */
  generation_method: text('generation_method').default('manual'),
  ai_model: text('ai_model'),
  ai_prompt_version: text('ai_prompt_version'),
  source_headlines: text('source_headlines'),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now'))`),
  closed_at: text('closed_at'),
  outcome_notes: text('outcome_notes'),
  outcome_correct: integer('outcome_correct', { mode: 'boolean' }),
});

// ─── thesis_data_points ───────────────────────────────────────────────────────

export const thesisDataPoints = sqliteTable('thesis_data_points', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  thesis_id: integer('thesis_id').notNull(),
  name: text('name').notNull(),
  /** 'price' | 'rate' | 'percentage' | 'boolean' | 'custom' */
  metric_type: text('metric_type').notNull(),
  /** 'manual' | 'yahoo_finance' | 'fred' | 'alpha_vantage' */
  data_source: text('data_source').notNull(),
  data_source_identifier: text('data_source_identifier'),
  current_value: real('current_value'),
  target_value: real('target_value').notNull(),
  /** 'above' | 'below' | 'between' | 'equals' */
  target_direction: text('target_direction').notNull(),
  target_threshold_low: real('target_threshold_low'),
  target_threshold_high: real('target_threshold_high'),
  unit: text('unit'),
  weight: real('weight').notNull().default(1),
  /** 'pending' | 'on_track' | 'off_track' | 'met' | 'failed' */
  current_status: text('current_status').notNull().default('pending'),
  last_updated: text('last_updated'),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// ─── thesis_data_history ──────────────────────────────────────────────────────

export const thesisDataHistory = sqliteTable('thesis_data_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  data_point_id: integer('data_point_id').notNull(),
  value: real('value').notNull(),
  timestamp: text('timestamp').notNull().default(sql`(datetime('now'))`),
  source: text('source').notNull(),
});

// ─── thesis_updates ───────────────────────────────────────────────────────────

export const thesisUpdates = sqliteTable('thesis_updates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  thesis_id: integer('thesis_id').notNull(),
  /** 'status_change' | 'data_update' | 'comment' */
  update_type: text('update_type').notNull(),
  content: text('content').notNull(),
  created_by: text('created_by').notNull(),
  old_value: text('old_value'),
  new_value: text('new_value'),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// ─── api_keys ─────────────────────────────────────────────────────────────────
// New table — requires a migration before use in production.

export const apiKeys = sqliteTable('api_keys', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  label: text('label').notNull(),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
  revoked_at: text('revoked_at'),
});
