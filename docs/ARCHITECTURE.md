# Architecture

## Deployment Architecture

InvestCollective runs on **Cloudflare Workers** using the
[OpenNext adapter](https://opennext.js.org/cloudflare) to host a Next.js 15 App Router application at the edge.
There is no separate server — each request is handled by a single Worker that runs Next.js server-side rendering
and API route logic.

```
Browser
  |
  +---> Cloudflare Edge (CDN + WAF + Zero Trust)
          |
          +---> Cloudflare Worker (OpenNext + Next.js SSR)
                  |
                  +---> D1 SQLite database (structured data)
                  +---> R2 object storage (PDFs)
                  +---> Workers AI (content generation)
```

## Data Layer

| Binding | Purpose | Access pattern |
|---|---|---|
| `D1` (via Drizzle ORM) | Theses, articles, members, legal pages, API keys, analytics | Per-request `getDb()` factory |
| `R2` (`RESEARCH_PDFS`) | Research article PDF files | Direct `env.RESEARCH_PDFS` from action/route |
| `Workers AI` (`AI`) | Generate article HTML from PDF metadata | Direct `env.AI` from upload action |

**Drizzle ORM** is the only permitted way to access D1. Raw `DB.prepare()` calls are prohibited.
The schema is defined once in `drizzle/schema.ts` and serves as the TypeScript type source of truth.

## Authentication

### Admin routes (`/admin/*`)

Protected by **Cloudflare Zero Trust Access**. Cloudflare terminates the connection and injects a signed JWT
(`cf-access-jwt-assertion`) and an email header (`cf-access-authenticated-user-email`) before the request
reaches the Worker. The `getAuthInfo()` utility in `src/lib/auth.ts` decodes the JWT payload and returns
`{ isAuthenticated, email, userId, groups }`.

Auth state is persisted in a `cf-auth-state` cookie set by middleware so it remains accessible on non-admin
pages (e.g., the public navbar that shows the admin link for authenticated users).

In development (`NODE_ENV=development`), `getAuthInfo()` returns a mock `dev@localhost` identity so the
admin UI works without Cloudflare Access configured.

### REST API (`/api/v1/*`)

Protected by **API key auth** for write operations. API keys are stored (hashed) in the `api_keys` D1 table
and managed through the admin UI at `/admin/api-keys`. The `withApiKey` higher-order function in
`src/lib/api-auth.ts` guards protected routes.

Public read endpoints (GET theses, GET research) require no authentication.

## Request Flow

### Public page request

```
Browser -> Worker -> Next.js page.tsx (Server Component)
                        -> getDb() -> D1 query
                        -> Return rendered HTML
```

### Admin server action

```
Browser -> Worker (Zero Trust validates JWT)
        -> Next.js Server Action (actions.ts)
            -> getAuthInfo() (read auth cookie / header)
            -> Zod safeParse(formData)
            -> getDb() -> Drizzle ORM -> D1
            -> revalidatePath()
            -> Return { success, error? }
```

### API request (authenticated write)

```
Client -> Worker -> Next.js Route Handler (route.ts)
                      -> withApiKey() checks Authorization: Bearer header
                      -> getDbAsync() -> Drizzle ORM -> D1
                      -> Zod safeParse(body)
                      -> apiSuccess() / apiError() response envelope
```

## Key Abstractions

### `getDb()` / `getDbAsync()`

Located in `src/lib/db.ts`. Uses React `cache()` to create one Drizzle instance per request — never a global
singleton (Cloudflare Workers reuse isolates across requests, which would cause cross-request data leakage).

```typescript
// Server Components and Server Actions:
const db = getDb();

// Route Handlers (async context required):
const db = await getDbAsync();
```

### `withApiKey(handler)` HOF

Located in `src/lib/api-auth.ts`. Wraps a Route Handler to require a valid `Authorization: Bearer <key>` header.
Returns 401 if no key provided, 403 if key is unknown or revoked.

### Server action return pattern

All server actions return `{ success: boolean; error?: string; [extra fields]? }`. The `error` field is
the human-readable message shown to the user. Never throw across the server/client boundary.

### `apiSuccess(data)` / `apiError(message, status, details?)`

Located in `src/lib/api-response.ts`. All API routes use this envelope for consistent response shapes:
- Success: `{ success: true, data: T }`
- Error: `{ success: false, error: string, details?: unknown }`

## Directory Structure

```
src/
├── app/
│   ├── admin/                    # Admin-only pages (protected by Cloudflare Zero Trust)
│   │   ├── analytics/            # Traffic analytics dashboard
│   │   ├── api-keys/             # API key management
│   │   ├── legal/                # Legal page content editor
│   │   ├── research/             # Research article management
│   │   │   ├── manage/           # List and status-toggle articles
│   │   │   └── upload/           # PDF upload + AI content generation
│   │   ├── settings/members/     # Member application review
│   │   └── thesis/               # Thesis creation and data point updates
│   ├── api/v1/                   # REST API routes
│   │   ├── analytics/track/      # POST analytics events
│   │   ├── api-keys/             # POST create API key (admin only)
│   │   ├── members/              # GET members list + [id] detail
│   │   ├── research/             # GET/POST research articles
│   │   ├── research/[slug]/      # GET single article
│   │   ├── research/pdf/[filename]/ # GET R2 PDF proxy
│   │   └── theses/               # GET/POST theses + [slug] detail + data-points
│   ├── (public pages)/           # Home, research list, thesis tracker, signup, legal
│   └── layout.tsx                # Root layout + navigation
├── components/
│   ├── ui/                       # shadcn/ui primitives (Button, Card, Input, etc.)
│   └── (feature components)/     # NavigationWrapper, ThesisCard, etc.
└── lib/
    ├── auth.ts                   # getAuthInfo() — Cloudflare Zero Trust JWT decoder
    ├── api-auth.ts               # withApiKey() HOF for API route protection
    ├── api-response.ts           # apiSuccess() / apiError() envelope helpers
    ├── db.ts                     # getDb() / getDbAsync() per-request Drizzle factory
    ├── email.ts                  # Resend email notification utilities
    ├── sanitize.ts               # DOMPurify HTML sanitization (XSS prevention)
    ├── slug.ts                   # URL slug generation
    ├── thesis-scoring.ts         # Confidence score and outcome score algorithms
    └── validation-schemas.ts     # All Zod schemas (single source of truth for API + UI)
```
