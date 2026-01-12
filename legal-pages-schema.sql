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

If you have questions about this disclaimer, please contact us at [contact email].', 'system');
