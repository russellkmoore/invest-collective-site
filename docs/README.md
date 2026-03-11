# InvestCollective Site

## Getting Started

InvestCollective is an investment analysis collective website. Members share and track investment theses, with
confidence scores computed from measurable data points. The platform demonstrates analytical credibility through
transparent, time-bounded predictions.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Deployment | Cloudflare Workers via OpenNext adapter |
| Database | Cloudflare D1 (SQLite) via Drizzle ORM |
| File storage | Cloudflare R2 (research PDFs) |
| AI content gen | Cloudflare Workers AI |
| Authentication | Cloudflare Zero Trust (admin routes) |
| UI components | shadcn/ui + Tailwind CSS v4 |
| Validation | Zod v4 |

## Prerequisites

- Node.js 20+
- npm 10+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (`npm i -g wrangler`)
- A Cloudflare account with Workers, D1, R2, and Zero Trust enabled

## Local Development Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd invest-collective-site

# 2. Install dependencies
npm install

# 3. Configure Wrangler (copy template and fill in your IDs)
cp wrangler.jsonc.template wrangler.jsonc
# Edit wrangler.jsonc with your actual D1 database ID, R2 bucket name, etc.

# 4. Create and seed the local D1 database
wrangler d1 create invest-collective
wrangler d1 execute invest-collective --local --file=drizzle/schema.sql

# 5. Start the development server
npm run dev
# Or for a full Cloudflare Workers preview (includes D1, R2 bindings):
npm run preview
```

## Environment Variables

These variables are declared in `wrangler.jsonc` (not committed — derived from `wrangler.jsonc.template`).
**Never commit actual values.**

| Variable | Description |
|---|---|
| `DB` | D1 database binding — Cloudflare SQLite database |
| `RESEARCH_PDFS` | R2 bucket binding — stores uploaded research PDFs |
| `AI` | Workers AI binding — generates article HTML from metadata |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret for signup form bot protection |
| `EMAIL_API_KEY` | Resend API key for admin notification emails |
| `EMAIL_FROM` | Sender address for admin notification emails |
| `EMAIL_TO` | Recipient address for new member application alerts |

In local development (`NODE_ENV=development`), `TURNSTILE_SECRET_KEY` can be omitted — Turnstile validation
soft-fails and the signup form proceeds without bot verification.

## Deployment

### One-off deploy

```bash
npm run deploy
```

This runs `next build`, then `opennextjs-cloudflare build`, then `opennextjs-cloudflare deploy`.
The `predeploy` hook automatically copies `wrangler.jsonc.template` to `wrangler.jsonc`.

### CI / git push

Configure a GitHub Actions workflow that runs `npm run deploy` with your Cloudflare API token in secrets.

## Database Migrations

Migrations are managed by [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview).

```bash
# Generate a new migration after editing drizzle/schema.ts
npx drizzle-kit generate

# Apply pending migrations to your local D1 instance
wrangler d1 migrations apply invest-collective --local

# Apply pending migrations to the production D1 instance
wrangler d1 migrations apply invest-collective --remote
```

Migration files live in `drizzle/migrations/`. Commit them alongside schema changes.

## Project Structure

```
invest-collective-site/
├── drizzle/            # Drizzle schema, migrations, and seed data
├── docs/               # Architecture, API, and contributing documentation
├── scripts/            # Build-time utilities (OpenAPI generator, etc.)
├── src/
│   ├── app/            # Next.js App Router pages, layouts, and API routes
│   │   ├── admin/      # Protected admin pages (Cloudflare Zero Trust)
│   │   ├── api/v1/     # Public REST API endpoints
│   │   └── (public)/   # Public-facing pages
│   ├── components/     # Shared React components (shadcn/ui + custom)
│   └── lib/            # Utilities: db.ts, auth.ts, validation-schemas.ts, etc.
└── wrangler.jsonc.template  # Cloudflare Workers configuration template
```
