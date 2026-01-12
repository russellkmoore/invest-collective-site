# Thesis Tracker Workflow

## Overview
The Thesis Tracker allows admins to create, track, and manage investment theses with data-driven validation. This document outlines the complete workflow for AI-assisted thesis generation, manual thesis creation, automated data updates, and thesis closeout.

---

## 1. Thesis Generation Workflow

### Current Schema Fields
```typescript
interface Thesis {
  // Core Identity
  id: number;
  slug: string;
  title: string;

  // Thesis Content
  event_description: string;    // The triggering event
  hypothesis: string;            // What we predict will happen
  timeframe: string;             // Human-readable timeframe
  rationale: string;             // Why we believe this

  // Classification
  category: 'stocks' | 'fed_policy' | 'sector' | 'macro';
  subcategory?: string;          // e.g., "Technology", "Interest Rates"
  tags: string;                  // JSON array of tags

  // Tracking
  status: 'active' | 'closed' | 'invalidated';
  confidence_score: number;      // 0-100, updated as data points change
  outcome_score?: number;        // 0-100, final score when closed

  // Metadata
  created_by: string;            // Username of creator
  event_date: string;            // When the event occurred
  prediction_start_date: string; // When tracking begins
  prediction_end_date: string;   // When thesis expires
  created_at: string;
  updated_at: string;
  closed_at?: string;
}
```

### Proposed Schema Additions

To support AI-generated theses and better tracking:

```sql
ALTER TABLE theses ADD COLUMN generation_method TEXT DEFAULT 'manual' CHECK(generation_method IN ('manual', 'ai_assisted', 'ai_generated'));
ALTER TABLE theses ADD COLUMN ai_model TEXT; -- e.g., 'claude-sonnet-4', 'gpt-4', 'claude-opus-4'
ALTER TABLE theses ADD COLUMN ai_prompt_version TEXT; -- Track which prompt version was used
ALTER TABLE theses ADD COLUMN source_headlines TEXT; -- JSON array of headlines that inspired this
```

### 1.1 AI-Assisted Thesis Generation

**Frequency**: Weekly (recommended) or ad-hoc

**Process**:

1. **Gather Recent Headlines** (Manual or Automated)
   - Admin collects 5-10 recent market-moving headlines from:
     - Financial news (WSJ, Bloomberg, FT)
     - Fed announcements
     - Major corporate events
     - Economic data releases

2. **Use AI Generation Prompt** (See Section 5 for prompt template)
   - Feed headlines to Claude/ChatGPT/other LLM
   - Request 3-5 potential theses with:
     - Title
     - Event description
     - Hypothesis
     - Rationale
     - Suggested data points
     - Timeframe
     - Category/tags

3. **Review AI Suggestions**
   - Admin reviews each generated thesis
   - Selects 1-3 to actually create
   - May modify rationale or data points

4. **Create Thesis in System**
   - Use `/admin/thesis/create` page
   - Set `generation_method: 'ai_assisted'`
   - Set `ai_model` to the LLM used
   - Set `created_by` to admin username
   - Store source headlines in `source_headlines` field

### 1.2 Manual Thesis Generation

**When to Use**: Admin has specific investment idea

**Process**:
1. Navigate to `/admin/thesis/create`
2. Fill out form manually:
   - Title (clear, descriptive)
   - Event description (what happened)
   - Hypothesis (what you predict)
   - Timeframe (30-365 days)
   - Rationale (why you believe this)
   - Category & tags
   - 2-8 data points to track
3. Set `generation_method: 'manual'`
4. Submit to create

---

## 2. Data Point Update Workflow

### Current Data Point Schema
```typescript
interface ThesisDataPoint {
  id: number;
  thesis_id: number;
  name: string;                      // e.g., "NASDAQ-100 Index"
  metric_type: 'price' | 'rate' | 'percentage' | 'boolean' | 'custom';
  data_source: 'manual' | 'yahoo_finance' | 'fred' | 'alpha_vantage';
  data_source_identifier?: string;   // e.g., "^NDX", "AAPL", "DGS10"
  target_value: number;              // What we're trying to reach
  target_direction: 'above' | 'below' | 'between' | 'equals';
  target_threshold_low?: number;     // For 'between' direction
  target_threshold_high?: number;    // For 'between' direction
  weight: number;                    // 1.0 = standard weight
  current_value?: number;            // Latest reading
  current_status: 'pending' | 'on_track' | 'off_track' | 'met' | 'failed';
  last_updated?: string;
  created_at: string;
}
```

### 2.1 Manual Data Point Updates

**Frequency**: As needed (daily/weekly depending on thesis)

**Process**:
1. Navigate to `/admin/thesis/[slug]`
2. For each data point:
   - Click "Update" button
   - Enter new `current_value`
   - System automatically:
     - Calculates new `current_status` based on target
     - Updates `last_updated` timestamp
     - Records entry in `thesis_data_history`
     - Recalculates thesis `confidence_score`
3. Add optional commentary via "Add Update" section

### 2.2 Automated Data Point Updates (TODO - Not Yet Implemented)

**Recommended Implementation**:

#### Option A: Cloudflare Workers Cron + D1
```javascript
// scheduled-thesis-updates.js (Cloudflare Worker)
export default {
  async scheduled(event, env, ctx) {
    // Runs daily at 4 PM EST
    const activeTheses = await env.DB.prepare(
      'SELECT id FROM theses WHERE status = "active"'
    ).all();

    for (const thesis of activeTheses.results) {
      const dataPoints = await env.DB.prepare(
        'SELECT * FROM thesis_data_points WHERE thesis_id = ?'
      ).bind(thesis.id).all();

      for (const dp of dataPoints.results) {
        if (dp.data_source === 'yahoo_finance') {
          const value = await fetchYahooFinance(dp.data_source_identifier);
          await updateDataPoint(dp.id, value, 'automated');
        } else if (dp.data_source === 'fred') {
          const value = await fetchFRED(dp.data_source_identifier);
          await updateDataPoint(dp.id, value, 'automated');
        }
      }
    }
  }
};
```

**Required Setup**:
1. Add `wrangler.toml` schedule:
```toml
[triggers]
crons = ["0 21 * * *"]  # 4 PM EST = 21:00 UTC
```

2. Implement data source APIs:
   - Yahoo Finance: Use public API or scraping
   - FRED: Use official FRED API (free, requires API key)
   - Alpha Vantage: Use free tier (500 requests/day)

3. Add error handling & notifications:
   - Log failed updates
   - Email admin on repeated failures
   - Fallback to manual mode if API unavailable

#### Option B: GitHub Actions + API Endpoint
```yaml
# .github/workflows/update-thesis-data.yml
name: Update Thesis Data Points
on:
  schedule:
    - cron: '0 21 * * *'  # 4 PM EST
  workflow_dispatch:  # Allow manual trigger

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Call Update Endpoint
        run: |
          curl -X POST https://your-site.com/api/thesis/update-all \
            -H "Authorization: Bearer ${{ secrets.THESIS_UPDATE_TOKEN }}"
```

**Recommendation**: Use Cloudflare Workers Cron (Option A) since site is already on Cloudflare Workers + D1.

---

## 3. Thesis Closeout Workflow

### 3.1 Automatic Closeout (Recommended)

**Implementation**: Cloudflare Worker Cron

```javascript
// scheduled-thesis-closeout.js
export default {
  async scheduled(event, env, ctx) {
    const today = new Date().toISOString().split('T')[0];

    // Find theses past their end date
    const expiredTheses = await env.DB.prepare(
      'SELECT * FROM theses WHERE status = "active" AND prediction_end_date <= ?'
    ).bind(today).all();

    for (const thesis of expiredTheses.results) {
      // Calculate final outcome score
      const dataPoints = await env.DB.prepare(
        'SELECT * FROM thesis_data_points WHERE thesis_id = ?'
      ).bind(thesis.id).all();

      const outcomeScore = calculateOutcomeScore(dataPoints.results);

      // Close thesis
      await env.DB.prepare(
        `UPDATE theses
         SET status = 'closed',
             outcome_score = ?,
             closed_at = datetime('now'),
             updated_at = datetime('now')
         WHERE id = ?`
      ).bind(outcomeScore, thesis.id).run();

      // Add closing commentary
      await env.DB.prepare(
        `INSERT INTO thesis_updates (thesis_id, update_type, content, created_by, created_at)
         VALUES (?, 'status_change', ?, 'system', datetime('now'))`
      ).bind(
        thesis.id,
        `Thesis automatically closed. Final outcome: ${outcomeScore}%`
      ).run();

      // Optional: Send notification to admin
      await sendNotification(env, thesis, outcomeScore);
    }
  }
};
```

**Schedule**: Daily at midnight EST

### 3.2 Manual Closeout

**When to Use**: Thesis should close early (invalidated, conditions changed)

**Process**:
1. Navigate to `/admin/thesis/[slug]`
2. Click "Close Thesis" button
3. Add closing commentary explaining why
4. System:
   - Calculates final `outcome_score`
   - Sets `status = 'closed'`
   - Sets `closed_at = now()`
   - Records closing update

---

## 4. Dashboard Auto-Population

### Performance Dashboard Data Flow

**Location**: `/thesis-tracker/performance`

**Data Sources**:
```typescript
// All calculated from DB queries, no manual entry needed
const allTheses = await getAllTheses(); // Fetches all from DB

// Overall Stats
const totalTheses = allTheses.length;
const activeTheses = allTheses.filter(t => t.status === 'active');
const closedTheses = allTheses.filter(t => t.status === 'closed');

// Success Metrics (automatic)
const successful = closedTheses.filter(t => t.outcome_score >= 70);
const partial = closedTheses.filter(t => t.outcome_score >= 40 && t.outcome_score < 70);
const failed = closedTheses.filter(t => t.outcome_score < 40);

// Category Performance (automatic)
const categoryStats = categories.map(category => {
  const categoryTheses = allTheses.filter(t => t.category === category);
  const closed = categoryTheses.filter(t => t.status === 'closed');
  const successRate = closed.filter(t => t.outcome_score >= 70).length / closed.length;
  return { category, successRate, total: categoryTheses.length };
});
```

**Automatic Updates**:
- Dashboard is server-rendered with `force-dynamic`
- Every page load fetches latest data from D1
- No caching means always shows current state
- Stats calculate automatically from thesis outcomes

**No Manual Work Required** - Dashboard auto-populates as theses close.

---

## 5. AI Thesis Generation Prompt Template

### Prompt for Claude/ChatGPT

```
You are an expert investment analyst. I will provide recent market headlines, and you should generate 3-5 testable investment theses.

For each thesis, provide:

1. **Title**: Clear, specific (e.g., "Fed Rate Cut Drives Tech Rally 15%")
2. **Event Description**: What happened (2-3 sentences)
3. **Hypothesis**: Specific prediction with timeline and magnitude
4. **Rationale**: Why this should happen (3-4 sentences, cite historical patterns)
5. **Timeframe**: Specific days (30-365)
6. **Category**: One of: stocks, fed_policy, sector, macro
7. **Subcategory**: Specific area (e.g., "Technology", "Interest Rates")
8. **Tags**: 3-5 relevant tags
9. **Data Points**: 2-8 measurable metrics to track (with targets)

**Data Point Format**:
- Name: Short description
- Type: price, rate, percentage, boolean, custom
- Data Source: yahoo_finance, fred, manual
- Identifier: Ticker/symbol (if applicable)
- Target Value: Numeric target
- Direction: above, below, between, equals

**Recent Headlines**:
[PASTE HEADLINES HERE]

**Example Output**:

### Thesis 1: Fed Rate Cut Drives Tech Rally 15%

**Event Description**:
On December 18, 2024, the Federal Reserve cut interest rates by 0.25%, signaling a more dovish stance amid cooling inflation. This is the third rate cut in recent months.

**Hypothesis**:
Technology stocks (NASDAQ-100) will rally 15% or more within 90 days as lower rates increase valuations for growth companies and reduce borrowing costs.

**Rationale**:
Lower interest rates benefit growth stocks disproportionately because future cash flows are worth more when discounted at lower rates. Tech companies also carry significant debt for R&D and expansion, so lower rates reduce interest expenses. Historical analysis shows tech sector outperformance of 12-18% in the 3 months following Fed rate cuts during non-recessionary periods (2019, 2020). Additionally, lower rates often coincide with higher P/E multiples for growth stocks.

**Timeframe**: 90 days

**Category**: fed_policy

**Subcategory**: Interest Rates

**Tags**: federal-reserve, interest-rates, technology, nasdaq, monetary-policy

**Data Points**:
1. NASDAQ-100 Index
   - Type: price
   - Source: yahoo_finance
   - Identifier: ^NDX
   - Target: Current + 15% (e.g., if currently 18,000 → 20,700)
   - Direction: above

2. 10-Year Treasury Yield
   - Type: rate
   - Source: fred
   - Identifier: DGS10
   - Target: Below 4.0%
   - Direction: below

3. Tech Sector P/E Ratio
   - Type: custom
   - Source: manual
   - Target: Above 30
   - Direction: above

4. S&P 500 Technology Sector Index
   - Type: price
   - Source: yahoo_finance
   - Identifier: ^SP500-45 (or appropriate)
   - Target: Current + 12%
   - Direction: above

---

Please generate 3-5 similar theses based on the headlines provided.
```

### Usage Notes

1. **Prompt Version Tracking**: Save prompt versions with dates
   - Store in `ai_prompt_version` field (e.g., "v1.0-2025-01")
   - Allows comparing thesis quality across prompt iterations

2. **Model Selection**:
   - **Claude Sonnet**: Best balance of quality/cost for weekly generation
   - **Claude Opus**: Higher quality for important/complex theses
   - **GPT-4**: Alternative perspective, good for contrarian views

3. **Post-Processing**:
   - Always review AI suggestions
   - Adjust rationale for accuracy
   - Verify data points are trackable
   - Ensure timeframes are realistic

---

## 6. Recommended Cadence

### Weekly Thesis Generation
- **When**: Every Monday morning
- **Process**:
  1. Collect 5-10 headlines from previous week
  2. Run AI generation prompt
  3. Review and select 1-2 best theses
  4. Create in system

### Daily Data Updates (Once Automated)
- **When**: 4 PM EST daily
- **Process**: Automatic via Cloudflare Worker
- **Fallback**: Manual update if automation fails

### Daily Thesis Closeout
- **When**: Midnight EST daily
- **Process**: Automatic closure of expired theses
- **Notification**: Email admin with results

### Weekly Performance Review
- **When**: Friday afternoon
- **Process**: Review dashboard at `/thesis-tracker/performance`
- **Action**: Adjust strategies based on success patterns

---

## 7. Future Enhancements

### Phase 1: Automation (Recommended Next)
- [ ] Implement Cloudflare Worker cron for data updates
- [ ] Implement automatic thesis closeout
- [ ] Add email notifications for closeouts
- [ ] Create API endpoints for automated updates

### Phase 2: AI Enhancements
- [ ] Add `generation_method`, `ai_model`, `ai_prompt_version` fields
- [ ] Store source headlines with theses
- [ ] Create prompt library with version tracking
- [ ] A/B test different prompts to improve quality

### Phase 3: Data Source Integration
- [ ] Yahoo Finance API integration
- [ ] FRED API integration (federal economic data)
- [ ] Alpha Vantage integration
- [ ] Webhooks for real-time updates

### Phase 4: Advanced Analytics
- [ ] Track AI vs human thesis success rates
- [ ] Compare performance by `ai_model`
- [ ] Prompt effectiveness scoring
- [ ] Automatic prompt optimization

### Phase 5: Collaboration Features
- [ ] Multi-admin thesis creation
- [ ] Commenting on theses
- [ ] Voting on thesis quality
- [ ] Member-submitted thesis suggestions

---

## 8. Migration Path

To add AI generation tracking to existing setup:

```sql
-- Add new columns to theses table
ALTER TABLE theses ADD COLUMN generation_method TEXT DEFAULT 'manual' CHECK(generation_method IN ('manual', 'ai_assisted', 'ai_generated'));
ALTER TABLE theses ADD COLUMN ai_model TEXT;
ALTER TABLE theses ADD COLUMN ai_prompt_version TEXT;
ALTER TABLE theses ADD COLUMN source_headlines TEXT; -- JSON array

-- Update existing theses
UPDATE theses SET generation_method = 'manual' WHERE generation_method IS NULL;

-- Create index for filtering by generation method
CREATE INDEX IF NOT EXISTS idx_theses_generation_method ON theses(generation_method);
```

Then update the create thesis form to include these new fields as optional dropdowns.

---

## Questions & Decisions Needed

1. **Automation Priority**: Should we implement automated data updates first, or keep manual for now?
2. **AI Model Choice**: Which LLM should be the default for thesis generation?
3. **Update Frequency**: Daily data updates, or less frequent (2-3x/week)?
4. **Notification Preferences**: Email, Slack, or dashboard-only for closeouts?
5. **API Budget**: What's the budget for Yahoo Finance/FRED API calls?

---

## Conclusion

The Thesis Tracker workflow supports both manual and AI-assisted thesis generation, with clear paths toward automation. The key insight is that **most dashboard data is already automatic** - it calculates from closed thesis outcomes. The main manual work is:

1. Creating theses (AI-assisted or manual)
2. Updating data points (can be automated)
3. Reviewing performance (automatic dashboard)

With automation (Phase 1), the workflow becomes nearly hands-off, requiring only weekly thesis review and creation.
