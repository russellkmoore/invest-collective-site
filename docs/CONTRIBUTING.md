# Contributing Guide

## File Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Utility / lib files | kebab-case | `validation-schemas.ts`, `api-response.ts` |
| React components | PascalCase | `ThesisCard.tsx`, `NavigationWrapper.tsx` |
| Next.js App Router | framework names | `page.tsx`, `layout.tsx`, `route.ts`, `actions.ts` |
| shadcn/ui primitives | kebab-case in `components/ui/` | `button.tsx`, `card.tsx` |

## Code Style

- **TypeScript strict mode** — all files must compile with `tsc --noEmit` without errors
- **Zod for all input validation** — no manual type casts on external input
- **Drizzle ORM for all DB access** — no `DB.prepare()` raw SQL
- **No `as string`** on `FormData.get()` — use Zod `safeParse` instead
- **No `export const runtime = 'edge'`** — the entire app runs on Cloudflare Workers; the adapter handles this

## Server Action Pattern

All server actions live in `actions.ts` co-located with the feature route. They must:

1. Start with `'use server'` directive
2. Return `{ success: boolean; error?: string; [extra]? }` — never throw across the boundary
3. Validate inputs with Zod `safeParse` before any DB access
4. Use `getDb()` from `src/lib/db.ts` for D1 access
5. Call `revalidatePath()` for any paths the mutation affects
6. Have a JSDoc comment on every exported function

```typescript
'use server';

import { getDb } from '@/lib/db';
import { mySchema } from '@/lib/validation-schemas';
import { myTable } from '../../../drizzle/schema';

/**
 * Brief description of what this action does and why.
 */
export async function myAction(input: MyInput): Promise<{ success: boolean; error?: string }> {
  const parsed = mySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const db = getDb();
  await db.insert(myTable).values(parsed.data);

  revalidatePath('/my-page');
  return { success: true };
}
```

## API Route Pattern

All API routes live under `src/app/api/v1/`. They must:

1. Use `withApiKey()` from `src/lib/api-auth.ts` for any write or sensitive read endpoint
2. Validate request bodies with Zod `safeParse`
3. Return responses via `apiSuccess()` / `apiError()` from `src/lib/api-response.ts`
4. Use `getDbAsync()` (the async variant) for D1 access in Route Handlers

```typescript
import { withApiKey } from '@/lib/api-auth';
import { apiSuccess, apiError } from '@/lib/api-response';
import { mySchema } from '@/lib/validation-schemas';
import { getDbAsync } from '@/lib/db';

export const POST = withApiKey(async (req: NextRequest) => {
  const body = await req.json();
  const parsed = mySchema.safeParse(body);
  if (!parsed.success) {
    return apiError('Validation failed', 400, parsed.error.flatten());
  }

  const db = await getDbAsync();
  // ... db operations ...
  return apiSuccess({ id: result[0].id });
});
```

## Component Pattern

- **Server components by default** — omit `'use client'` unless the component needs browser APIs or state
- **'use client' only for interactivity** — event handlers, useState, useEffect, browser APIs
- **Prefer small client islands** — keep client boundary as narrow as possible; pass data as props from server

```tsx
// page.tsx — Server Component (default)
export default async function MyPage() {
  const data = await getMyData(); // direct async call, no useEffect
  return <MyList items={data} />;
}

// MyActionButton.tsx — Client Component (has onClick)
'use client';
export function MyActionButton({ id }: { id: number }) {
  return <button onClick={() => doSomething(id)}>Action</button>;
}
```

## Where to Add New Code

### New page
Create `src/app/<path>/page.tsx`. For admin pages: create under `src/app/admin/<feature>/page.tsx`.
The admin layout (`src/app/admin/layout.tsx`) automatically wraps all admin pages with the sidebar.

### New API endpoint
Create `src/app/api/v1/<resource>/route.ts`. Add a GET handler for reads (use `withApiKey` if sensitive),
and a POST/PUT/DELETE handler for writes (always use `withApiKey`).
Register the new path in `scripts/generate-openapi.ts`.

### New admin feature
1. Create `src/app/admin/<feature>/page.tsx` (server component, fetches data)
2. Create `src/app/admin/<feature>/actions.ts` (server actions for mutations)
3. Add a nav link in `src/app/admin/layout.tsx` sidebar

### New utility function
Add to the appropriate file in `src/lib/` or create a new file with a kebab-case name.
Export from `src/lib/index.ts` if the utility is used across multiple features.

### New Zod schema
Add to `src/lib/validation-schemas.ts`. Register the schema with OpenAPI metadata using `.openapi('SchemaName')`.
Run `npm run generate:openapi` after adding schemas.

## Commit Message Format

```
<type>(<scope>): <short description>

- key change 1
- key change 2
```

| Type | When |
|---|---|
| `feat` | New feature, endpoint, or page |
| `fix` | Bug fix or incorrect behavior correction |
| `refactor` | Code cleanup with no behavior change |
| `chore` | Config, tooling, dependency updates |
| `test` | Test-only changes |
| `docs` | Documentation changes |

Scope is typically the phase-plan number (e.g., `01-05`) during planned development,
or the feature name (e.g., `thesis`, `research`) for ad-hoc changes.

## Critical Anti-Patterns

Do NOT do any of the following:

| Anti-pattern | Why | Do this instead |
|---|---|---|
| `export const runtime = 'edge'` | The entire app runs on Workers; setting this causes incompatibilities with the OpenNext adapter | Remove it — the adapter handles the runtime |
| Global Drizzle instance | Workers reuse isolates across requests — a global db holds stale context from previous requests | Use `getDb()` / `getDbAsync()` per-request factories |
| `formData.get('field') as string` | Silent type cast — returns `null` if field missing, causing runtime errors | Use `zod.safeParse()` to validate and type all FormData |
| `DB.prepare('SELECT ...')` raw SQL | Bypasses type safety, bypasses Drizzle schema, produces unmaintainable query strings | Use `getDb().select().from(table).where(...)` |
| Throw across server/client boundary | React does not serialize arbitrary errors — clients see a generic message | Return `{ success: false, error: 'message' }` |
| Hardcoded reviewer/actor names | Traceability issue — admin actions should record the actual authenticated user | Read from `getAuthInfo()` |
