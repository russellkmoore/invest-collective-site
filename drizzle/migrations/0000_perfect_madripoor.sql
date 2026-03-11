-- Migration 0000: Create api_keys table
-- All other tables (articles, analytics_events, members, legal_pages, theses,
-- thesis_data_points, thesis_data_history, thesis_updates) already exist in D1.
-- This migration only creates the new api_keys table.
--
-- Apply to remote D1: wrangler d1 migrations apply DB --remote
-- Apply to local D1:  wrangler d1 migrations apply DB --local

CREATE TABLE IF NOT EXISTS `api_keys` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`label` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`revoked_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `api_keys_key_unique` ON `api_keys` (`key`);
