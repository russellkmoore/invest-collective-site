-- Example Thesis Data for Staging/Testing
-- This creates 5 realistic example theses in various states with complete history

-- =============================================================================
-- THESIS 1: Active thesis with high confidence (on track)
-- =============================================================================

INSERT INTO theses (
  slug, title, event_description, hypothesis, timeframe, rationale,
  category, subcategory, tags, status, confidence_score,
  created_by, event_date, prediction_start_date, prediction_end_date,
  created_at, updated_at
) VALUES (
  'example-fed-rate-cut-tech-rally',
  'Example: Fed Rate Cut Drives Tech Stock Rally',
  'On September 18, 2024, the Federal Reserve announced a 0.50% interest rate cut, the first significant cut in over two years, citing controlled inflation and a desire to support the labor market.',
  'Technology stocks will rally 12%+ within 90 days as lower rates increase valuations for growth companies and reduce borrowing costs, particularly benefiting high-growth tech names.',
  '90 days from September 18, 2024',
  'Lower interest rates typically benefit growth stocks more than value stocks because future earnings are worth more in present-value terms when discounted at lower rates. Tech companies also tend to carry more debt for R&D and expansion, so lower rates reduce interest expenses. Historical Fed rate cuts have correlated with tech sector outperformance in the following quarters, particularly when cuts come amid stable economic conditions rather than crisis.',
  'fed_policy',
  'Interest Rates',
  '["federal-reserve", "interest-rates", "technology", "growth-stocks", "monetary-policy"]',
  'active',
  75,
  'admin',
  '2024-09-18',
  '2024-09-19',
  '2024-12-17',
  datetime('now', '-45 days'),
  datetime('now', '-2 days')
);

-- Get the thesis ID for data points
-- For SQLite, we'll use last_insert_rowid() in a transaction

-- Data points for Thesis 1
INSERT INTO thesis_data_points (
  thesis_id, name, metric_type, data_source, data_source_identifier,
  target_value, target_direction, target_threshold_low, target_threshold_high,
  weight, current_value, current_status, last_updated, created_at
) VALUES
(1, 'NASDAQ-100 Index', 'price', 'yahoo_finance', '^NDX', 19800, 'above', NULL, NULL, 1.0, 19500, 'on_track', datetime('now', '-1 day'), datetime('now', '-45 days')),
(1, 'NVDA Stock Price', 'price', 'yahoo_finance', 'NVDA', 145, 'above', NULL, NULL, 1.0, 148, 'met', datetime('now', '-1 day'), datetime('now', '-45 days')),
(1, '10-Year Treasury Yield', 'rate', 'fred', 'DGS10', 4.0, 'below', NULL, NULL, 1.0, 3.85, 'met', datetime('now', '-1 day'), datetime('now', '-45 days')),
(1, 'Tech Sector P/E Ratio', 'custom', 'manual', NULL, 30, 'above', NULL, NULL, 1.0, 29.5, 'on_track', datetime('now', '-2 days'), datetime('now', '-45 days'));

-- Data history for Thesis 1 (simulate updates over time)
INSERT INTO thesis_data_history (data_point_id, value, timestamp, source) VALUES
(1, 18900, datetime('now', '-45 days'), 'manual'),
(1, 19100, datetime('now', '-30 days'), 'manual'),
(1, 19350, datetime('now', '-15 days'), 'manual'),
(1, 19500, datetime('now', '-1 day'), 'manual'),
(2, 135, datetime('now', '-45 days'), 'manual'),
(2, 142, datetime('now', '-30 days'), 'manual'),
(2, 146, datetime('now', '-15 days'), 'manual'),
(2, 148, datetime('now', '-1 day'), 'manual'),
(3, 4.25, datetime('now', '-45 days'), 'manual'),
(3, 4.10, datetime('now', '-30 days'), 'manual'),
(3, 3.95, datetime('now', '-15 days'), 'manual'),
(3, 3.85, datetime('now', '-1 day'), 'manual'),
(4, 28.5, datetime('now', '-45 days'), 'manual'),
(4, 29.0, datetime('now', '-30 days'), 'manual'),
(4, 29.5, datetime('now', '-2 days'), 'manual');

-- Updates for Thesis 1
INSERT INTO thesis_updates (thesis_id, update_type, content, created_by, created_at) VALUES
(1, 'status_change', 'Thesis created and activated', 'admin', datetime('now', '-45 days')),
(1, 'data_update', 'Updated NASDAQ-100 Index: 19100', 'admin', datetime('now', '-30 days')),
(1, 'comment', 'Tech stocks showing strong momentum post-rate cut. NVDA earnings beat expectations, driving the sector higher.', 'admin', datetime('now', '-20 days')),
(1, 'data_update', 'Updated all data points - thesis tracking well toward targets', 'admin', datetime('now', '-1 day'));

-- =============================================================================
-- THESIS 2: Closed thesis - SUCCESSFUL (78% outcome)
-- =============================================================================

INSERT INTO theses (
  slug, title, event_description, hypothesis, timeframe, rationale,
  category, subcategory, tags, status, confidence_score, outcome_score,
  created_by, event_date, prediction_start_date, prediction_end_date,
  created_at, updated_at, closed_at
) VALUES (
  'example-apple-vision-pro-launch',
  'Example: Apple Vision Pro Launch Boosts Stock 15%',
  'Apple announced the Vision Pro launch date of February 2, 2024, with pre-orders beginning January 19. The mixed reality headset represents Apple''s entry into spatial computing.',
  'Apple stock will gain 15%+ within 120 days of Vision Pro launch as investors price in a new product category with long-term growth potential.',
  '120 days from February 2, 2024',
  'New product category launches historically drive Apple stock appreciation as investors model out multi-year revenue potential. Vision Pro represents Apple''s first major new category since Apple Watch (2015). Even modest initial sales would validate the spatial computing market. Strong developer interest (600+ apps at launch) suggests ecosystem momentum.',
  'stocks',
  'Technology',
  '["apple", "aapl", "vision-pro", "spatial-computing", "product-launch"]',
  'closed',
  100,
  75,
  'admin',
  '2024-02-02',
  '2024-02-02',
  '2024-06-01',
  datetime('now', '-180 days'),
  datetime('now', '-60 days'),
  datetime('now', '-60 days')
);

INSERT INTO thesis_data_points (
  thesis_id, name, metric_type, data_source, data_source_identifier,
  target_value, target_direction, target_threshold_low, target_threshold_high,
  weight, current_value, current_status, last_updated, created_at
) VALUES
(2, 'AAPL Stock Price', 'price', 'yahoo_finance', 'AAPL', 207, 'above', NULL, NULL, 1.0, 213, 'met', datetime('now', '-60 days'), datetime('now', '-180 days')),
(2, 'AAPL Market Cap', 'custom', 'manual', NULL, 3200000000000, 'above', NULL, NULL, 1.0, 3280000000000, 'met', datetime('now', '-60 days'), datetime('now', '-180 days')),
(2, 'Revenue Growth QoQ', 'percentage', 'manual', NULL, 3, 'above', NULL, NULL, 1.0, 4.2, 'met', datetime('now', '-60 days'), datetime('now', '-180 days')),
(2, 'Analyst Upgrade Count', 'custom', 'manual', NULL, 5, 'above', NULL, NULL, 1.0, 3, 'failed', datetime('now', '-60 days'), datetime('now', '-180 days'));

INSERT INTO thesis_data_history (data_point_id, value, timestamp, source) VALUES
(5, 185, datetime('now', '-180 days'), 'manual'),
(5, 192, datetime('now', '-150 days'), 'manual'),
(5, 198, datetime('now', '-120 days'), 'manual'),
(5, 205, datetime('now', '-90 days'), 'manual'),
(5, 213, datetime('now', '-60 days'), 'manual');

INSERT INTO thesis_updates (thesis_id, update_type, content, created_by, created_at) VALUES
(2, 'status_change', 'Thesis created and activated', 'admin', datetime('now', '-180 days')),
(2, 'comment', 'Vision Pro pre-orders sold out within hours. Strong initial demand signal.', 'admin', datetime('now', '-170 days')),
(2, 'comment', 'AAPL stock up 8% since launch. Positive reviews driving sentiment.', 'admin', datetime('now', '-120 days')),
(2, 'data_update', 'Final data point updates before thesis closure', 'admin', datetime('now', '-60 days')),
(2, 'status_change', 'Thesis closed: AAPL exceeded 15% gain target, reaching 18% over the period. Vision Pro launch successfully drove investor enthusiasm despite modest initial sales volumes. Stock benefited from broader tech rally and AI narrative. 3 of 4 data points met targets.', 'admin', datetime('now', '-60 days'));

-- =============================================================================
-- THESIS 3: Closed thesis - FAILED (25% outcome)
-- =============================================================================

INSERT INTO theses (
  slug, title, event_description, hypothesis, timeframe, rationale,
  category, subcategory, tags, status, confidence_score, outcome_score,
  created_by, event_date, prediction_start_date, prediction_end_date,
  created_at, updated_at, closed_at
) VALUES (
  'example-oil-prices-summer-surge',
  'Example: Summer Driving Season Pushes Oil Above $95',
  'As of May 1, 2024, oil prices were trading at $83/barrel with summer driving season approaching and OPEC+ maintaining production cuts.',
  'Oil prices will surge above $95/barrel during summer 2024 as driving demand peaks and supply remains constrained, benefiting energy sector stocks.',
  'June through August 2024',
  'Summer driving season historically increases gasoline demand by 5-10%. OPEC+ production cuts of 2M barrels/day remain in place. Geopolitical tensions in Middle East could disrupt supply. U.S. Strategic Petroleum Reserve rebuilding creates additional demand. Energy stocks typically correlate strongly with oil price movements.',
  'macro',
  'Energy',
  '["oil", "energy", "commodities", "opec", "summer-demand"]',
  'closed',
  0,
  25,
  'admin',
  '2024-05-01',
  '2024-06-01',
  '2024-08-31',
  datetime('now', '-150 days'),
  datetime('now', '-90 days'),
  datetime('now', '-90 days')
);

INSERT INTO thesis_data_points (
  thesis_id, name, metric_type, data_source, data_source_identifier,
  target_value, target_direction, target_threshold_low, target_threshold_high,
  weight, current_value, current_status, last_updated, created_at
) VALUES
(3, 'WTI Crude Oil Price', 'price', 'manual', NULL, 95, 'above', NULL, NULL, 1.0, 78, 'failed', datetime('now', '-90 days'), datetime('now', '-150 days')),
(3, 'Energy Sector ETF (XLE)', 'price', 'yahoo_finance', 'XLE', 95, 'above', NULL, NULL, 1.0, 88, 'failed', datetime('now', '-90 days'), datetime('now', '-150 days')),
(3, 'Gasoline Demand Growth', 'percentage', 'manual', NULL, 5, 'above', NULL, NULL, 1.0, 2.1, 'failed', datetime('now', '-90 days'), datetime('now', '-150 days')),
(3, 'OPEC Production Cuts Maintained', 'boolean', 'manual', NULL, 1, 'equals', NULL, NULL, 1.0, 1, 'met', datetime('now', '-90 days'), datetime('now', '-150 days'));

INSERT INTO thesis_data_history (data_point_id, value, timestamp, source) VALUES
(9, 83, datetime('now', '-150 days'), 'manual'),
(9, 81, datetime('now', '-120 days'), 'manual'),
(9, 79, datetime('now', '-100 days'), 'manual'),
(9, 78, datetime('now', '-90 days'), 'manual');

INSERT INTO thesis_updates (thesis_id, update_type, content, created_by, created_at) VALUES
(3, 'status_change', 'Thesis created and activated', 'admin', datetime('now', '-150 days')),
(3, 'comment', 'Oil prices declining despite approaching summer. Weaker than expected economic data in China weighing on demand outlook.', 'admin', datetime('now', '-120 days')),
(3, 'comment', 'Summer demand disappointing - remote work reducing commuting, EV adoption impacting gasoline consumption more than anticipated.', 'admin', datetime('now', '-100 days')),
(3, 'status_change', 'Thesis closed: Oil failed to reach $95 target, peaking at $82 in July before declining. Summer driving demand was weaker than historical patterns due to structural changes (remote work, EV adoption). OPEC cuts weren''t enough to offset demand concerns. Energy stocks underperformed. Only 1 of 4 data points met.', 'admin', datetime('now', '-90 days'));

-- =============================================================================
-- THESIS 4: Active thesis with mixed signals (50% confidence)
-- =============================================================================

INSERT INTO theses (
  slug, title, event_description, hypothesis, timeframe, rationale,
  category, subcategory, tags, status, confidence_score,
  created_by, event_date, prediction_start_date, prediction_end_date,
  created_at, updated_at
) VALUES (
  'example-healthcare-sector-q4-rally',
  'Example: Healthcare Sector Outperforms in Q4 2024',
  'Following the November 2024 election results and increased focus on Medicare negotiations, healthcare stocks have sold off 8% from October highs as investors price in regulatory uncertainty.',
  'Healthcare sector will outperform S&P 500 by 5%+ in Q4 2024 as oversold conditions and defensive positioning attract investors during typical year-end volatility.',
  'Q4 2024 (October - December)',
  'Healthcare historically shows defensive characteristics during market uncertainty. Sector is trading at 15.2x forward earnings vs 20.8x for S&P 500, representing widest discount in 3 years. Major pharma companies have strong pipelines with multiple drug approvals expected. Aging demographics provide structural tailwind. Q4 seasonality favors defensive sectors.',
  'sector',
  'Healthcare',
  '["healthcare", "xlv", "defensive", "pharma", "biotech"]',
  'active',
  50,
  'admin',
  '2024-10-15',
  '2024-10-15',
  '2024-12-31',
  datetime('now', '-30 days'),
  datetime('now', '-1 day')
);

INSERT INTO thesis_data_points (
  thesis_id, name, metric_type, data_source, data_source_identifier,
  target_value, target_direction, target_threshold_low, target_threshold_high,
  weight, current_value, current_status, last_updated, created_at
) VALUES
(4, 'Healthcare ETF (XLV) Relative Performance', 'percentage', 'manual', NULL, 5, 'above', NULL, NULL, 1.0, 2.3, 'on_track', datetime('now', '-1 day'), datetime('now', '-30 days')),
(4, 'XLV vs SPY Ratio', 'custom', 'manual', NULL, 1.05, 'above', NULL, NULL, 1.0, 1.02, 'on_track', datetime('now', '-1 day'), datetime('now', '-30 days')),
(4, 'Healthcare Sector P/E Compression', 'custom', 'manual', NULL, 16, 'above', NULL, NULL, 1.0, 15.8, 'off_track', datetime('now', '-2 days'), datetime('now', '-30 days')),
(4, 'Major Pharma Revenue Beats', 'custom', 'manual', NULL, 3, 'above', NULL, NULL, 1.0, 1, 'off_track', datetime('now', '-3 days'), datetime('now', '-30 days'));

INSERT INTO thesis_data_history (data_point_id, value, timestamp, source) VALUES
(13, 0, datetime('now', '-30 days'), 'manual'),
(13, 1.8, datetime('now', '-15 days'), 'manual'),
(13, 2.3, datetime('now', '-1 day'), 'manual'),
(14, 0.98, datetime('now', '-30 days'), 'manual'),
(14, 1.01, datetime('now', '-15 days'), 'manual'),
(14, 1.02, datetime('now', '-1 day'), 'manual');

INSERT INTO thesis_updates (thesis_id, update_type, content, created_by, created_at) VALUES
(4, 'status_change', 'Thesis created and activated', 'admin', datetime('now', '-30 days')),
(4, 'comment', 'Healthcare showing early signs of relative strength. XLV up 3.2% vs SPY up 1.4% over past 2 weeks.', 'admin', datetime('now', '-15 days')),
(4, 'comment', 'Mixed Q3 earnings from major pharma. Johnson & Johnson beat, but Pfizer missed expectations. Sector performance still positive but momentum slowing.', 'admin', datetime('now', '-5 days'));

-- =============================================================================
-- THESIS 5: Active thesis - early stage, recently created
-- =============================================================================

INSERT INTO theses (
  slug, title, event_description, hypothesis, timeframe, rationale,
  category, subcategory, tags, status, confidence_score,
  created_by, event_date, prediction_start_date, prediction_end_date,
  created_at, updated_at
) VALUES (
  'example-ai-infrastructure-spending-boom',
  'Example: AI Infrastructure Spending Drives Semiconductor Rally',
  'Major cloud providers announced $200B+ in combined AI infrastructure spending for 2025 during Q3 2024 earnings calls, signaling massive demand for AI chips and data center equipment.',
  'Semiconductor stocks focused on AI/data center will rally 20%+ over next 6 months as infrastructure buildout accelerates and supply chain constraints ease.',
  '6 months from November 2024',
  'Cloud providers (AWS, Azure, Google Cloud) are in arms race for AI infrastructure. Nvidia H100/H200 GPUs remain supply constrained but production ramping. AMD MI300 gaining traction as alternative. Memory manufacturers (Micron, SK Hynix) benefit from HBM demand. Historical capex cycles in semiconductors show 18-24 month runs. Taiwan Semi guidance indicates strong AI chip demand through 2025.',
  'stocks',
  'Semiconductors',
  '["semiconductors", "ai", "nvidia", "amd", "data-center", "cloud"]',
  'active',
  0,
  'admin',
  '2024-11-05',
  '2024-11-08',
  '2025-05-08',
  datetime('now', '-5 days'),
  datetime('now', '-5 days')
);

INSERT INTO thesis_data_points (
  thesis_id, name, metric_type, data_source, data_source_identifier,
  target_value, target_direction, target_threshold_low, target_threshold_high,
  weight, current_value, current_status, last_updated, created_at
) VALUES
(5, 'NVDA Stock Price', 'price', 'yahoo_finance', 'NVDA', 168, 'above', NULL, NULL, 1.0, NULL, 'pending', NULL, datetime('now', '-5 days')),
(5, 'Semiconductor ETF (SOXX)', 'price', 'yahoo_finance', 'SOXX', 60, 'above', NULL, NULL, 1.0, NULL, 'pending', NULL, datetime('now', '-5 days')),
(5, 'Cloud Provider Capex Growth', 'percentage', 'manual', NULL, 40, 'above', NULL, NULL, 1.0, NULL, 'pending', NULL, datetime('now', '-5 days')),
(5, 'HBM Memory Prices', 'percentage', 'manual', NULL, 20, 'above', NULL, NULL, 1.0, NULL, 'pending', NULL, datetime('now', '-5 days'));

INSERT INTO thesis_updates (thesis_id, update_type, content, created_by, created_at) VALUES
(5, 'status_change', 'Thesis created and activated', 'admin', datetime('now', '-5 days')),
(5, 'comment', 'Thesis just activated - monitoring initial price action. Will begin tracking data points next week once Q3 earnings cycle completes.', 'admin', datetime('now', '-4 days'));

-- Summary comment
SELECT '============================================' as '';
SELECT 'Example Thesis Data Insertion Complete' as '';
SELECT '============================================' as '';
SELECT '' as '';
SELECT 'Created 5 example theses:' as '';
SELECT '1. Active (75% confidence) - Fed rate cut tech rally' as '';
SELECT '2. Closed Successful (75% outcome) - Apple Vision Pro' as '';
SELECT '3. Closed Failed (25% outcome) - Oil price surge' as '';
SELECT '4. Active Mixed (50% confidence) - Healthcare sector' as '';
SELECT '5. Active New (0% confidence) - AI infrastructure' as '';
SELECT '' as '';
SELECT 'All theses marked as "Example:" for easy identification' as '';
