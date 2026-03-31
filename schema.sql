-- Research articles database schema
CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  topics TEXT NOT NULL, -- JSON array of topic strings
  summary TEXT NOT NULL,
  html_content TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  pdf_filename TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft' or 'published'
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index for faster lookups by slug
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);

-- Index for sorting by date
CREATE INDEX IF NOT EXISTS idx_articles_date ON articles(date DESC);

-- Index for searching by topics (will need to use LIKE for JSON search)
CREATE INDEX IF NOT EXISTS idx_articles_topics ON articles(topics);

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);

-- Analytics events table for tracking article views and PDF downloads
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL, -- 'page_view', 'article_view', 'pdf_download', 'topic_filter'
  page_path TEXT,
  article_slug TEXT,
  topic TEXT,
  user_agent TEXT,
  country TEXT,
  referrer TEXT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index for faster queries by event type
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);

-- Index for faster queries by article slug
CREATE INDEX IF NOT EXISTS idx_analytics_article_slug ON analytics_events(article_slug);

-- Index for faster queries by page path
CREATE INDEX IF NOT EXISTS idx_analytics_page_path ON analytics_events(page_path);

-- Index for faster queries by timestamp
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_events(timestamp DESC);

-- Index for faster queries by topic
CREATE INDEX IF NOT EXISTS idx_analytics_topic ON analytics_events(topic);

-- Index for faster queries by country
CREATE INDEX IF NOT EXISTS idx_analytics_country ON analytics_events(country);

-- Members table for signup applications and member management
CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  -- Personal Information
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  -- Investment Background
  years_investing TEXT NOT NULL,           -- 'less-than-1', '1-3', '3-5', '5-10', '10-plus'
  trading_style TEXT NOT NULL,             -- 'day-trading', 'swing-trading', 'long-term-investing', 'options-trading', 'other'
  areas_of_expertise TEXT NOT NULL,        -- Long text field describing expertise
  macro_knowledge TEXT NOT NULL,           -- 'beginner', 'intermediate', 'advanced', 'expert'
  portfolio_size TEXT NOT NULL,            -- 'under-10k', '10k-50k', '50k-100k', '100k-500k', '500k-plus'
  -- Application Content
  investment_journey TEXT NOT NULL,        -- Long text: user's investing experience
  expectations TEXT NOT NULL,              -- Long text: what they hope to gain/contribute
  referral_source TEXT,                    -- Optional: how they heard about us
  -- Admin Fields
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'approved', 'active'
  admin_notes TEXT,                        -- Admin comments and notes
  reviewed_by TEXT,                        -- Admin who reviewed the application
  reviewed_at TEXT,                        -- When the application was reviewed
  approved_at TEXT,                        -- When the application was approved
  activated_at TEXT,                       -- When the member was activated
  -- Metadata
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index for faster lookups by email
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);

-- Index for sorting by creation date
CREATE INDEX IF NOT EXISTS idx_members_created_at ON members(created_at DESC);

-- Legal pages table for privacy policy, disclaimer, etc.
CREATE TABLE IF NOT EXISTS legal_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,              -- 'privacy-policy', 'disclaimer', etc.
  title TEXT NOT NULL,                    -- Display title
  content TEXT NOT NULL,                  -- Markdown or HTML content
  last_updated_by TEXT NOT NULL,          -- Admin who last updated
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index for faster lookups by slug
CREATE INDEX IF NOT EXISTS idx_legal_pages_slug ON legal_pages(slug);

-- Insert default legal pages
INSERT OR IGNORE INTO legal_pages (slug, title, content, last_updated_by) VALUES
('privacy-policy', 'Privacy Policy', '# Privacy Policy

**Last Updated:** [Date]

## Information We Collect

We collect information you provide directly to us, including:
- Name and email address when you sign up for membership
- Investment background and experience information
- Any other information you choose to provide

## How We Use Your Information

We use the information we collect to:
- Process your membership application
- Provide you with research and analysis
- Communicate with you about our services
- Improve our website and services

## Information Sharing

We do not sell, trade, or otherwise transfer your personally identifiable information to third parties. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.

## Data Security

We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.

## Your Rights

You have the right to:
- Access your personal information
- Correct inaccurate information
- Request deletion of your information
- Object to processing of your information

## Contact Us

If you have questions about this Privacy Policy, please contact us at [contact email].', 'system'),

('disclaimer', 'Investment Disclaimer', '# Investment Disclaimer

**Last Updated:** [Date]

## Not Financial Advice

The information provided on this website is for educational and informational purposes only. It does not constitute financial advice, investment advice, trading advice, or any other sort of advice.

## No Guarantees

Past performance is not indicative of future results. All investments carry risk, including the potential loss of principal. The Invest Collective makes no guarantees regarding the accuracy of information or the success of any investment strategy discussed.

## Do Your Own Research

All members and visitors are strongly encouraged to conduct their own research and due diligence before making any investment decisions. You should consult with a qualified financial advisor before making any investment decisions.

## No Professional Relationship

Nothing on this website creates a professional relationship between you and The Invest Collective or its members. We are not registered investment advisors.

## Accuracy of Information

While we strive to provide accurate and up-to-date information, we make no representations or warranties of any kind about the completeness, accuracy, reliability, suitability, or availability of the information, products, services, or related graphics contained on the website.

## Third-Party Links

This website may contain links to third-party websites. We have no control over the content of those sites and accept no responsibility for them or for any loss or damage that may arise from your use of them.

## Limitation of Liability

In no event will The Invest Collective or its members be liable for any loss or damage including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this website or the information provided herein.

## Your Responsibility

By using this website, you acknowledge and agree that:
- You are solely responsible for your investment decisions
- You understand the risks involved in investing
- You will not hold The Invest Collective liable for any losses
- You have read and understood this disclaimer

## Contact Us

If you have questions about this disclaimer, please contact us at [contact email].', 'system'),

('faq', 'Frequently Asked Questions', '# Frequently Asked Questions

## What is The Invest Collective?

The Invest Collective is a private investment research group where members collaborate on market analysis, share investment theses, and track predictive accuracy over time. We combine human insight with AI-generated analysis to build a transparent track record.

## How does the thesis tracker work?

Members and AI submit investment theses — predictions about specific market events with measurable data points. Each thesis is tracked against real market data and scored for accuracy when it reaches its prediction window. This creates a transparent, verifiable track record.

## Is this financial advice?

No. Nothing on this site constitutes financial advice. We are an educational and research-focused community. All members are responsible for their own investment decisions. Please see our [Investment Disclaimer](/disclaimer) for full details.

## How are theses scored?

Each thesis includes 2-8 measurable data points (e.g., "S&P 500 above 5,000 by Q2 2025"). When the prediction window closes, each data point is evaluated against actual market data. The overall score is the percentage of data points that hit their targets.

## What is the difference between Human and AI theses?

Every thesis is labeled with its origin — Human or AI. This lets us compare predictive accuracy between human analysts and AI models over time, creating an honest benchmark for both.

## How do I become a member?

Membership is currently by invitation only. If you are interested in joining, reach out through our contact page and tell us about your investment background and what you hope to contribute.

## What data sources do you use?

We pull real-time and historical data from sources including Yahoo Finance (stock prices, indices, commodities) and FRED (Federal Reserve economic data like interest rates, inflation, and employment figures).

## How often are theses updated?

Data points are updated regularly as new market data becomes available. Theses remain active until their prediction end date, at which point they are resolved and scored.

## Can I see the track record without being a member?

Yes. Our thesis tracker and performance dashboard are publicly visible. We believe in full transparency — anyone can see our calls and how they performed.

## Who runs The Invest Collective?

We are a small group of investment enthusiasts and technologists who believe in accountable, data-driven investing. We are not registered investment advisors.', 'system');
