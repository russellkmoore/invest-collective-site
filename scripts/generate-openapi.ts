/**
 * Build-time OpenAPI spec generator.
 *
 * Imports Zod schemas with OpenAPI metadata from validation-schemas.ts and
 * registers all /api/v1/ paths. Outputs docs/openapi.json.
 *
 * Usage: npm run generate:openapi
 */

import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { writeFileSync, mkdirSync } from 'fs';

extendZodWithOpenApi(z);

// ─── Schemas ─────────────────────────────────────────────────────────────────

// Re-define schemas here instead of importing from src/ to avoid Next.js server-only
// module constraints in a plain Node script. These must stay in sync with validation-schemas.ts.

const dataPointSchema = z.object({
  name: z.string().min(1),
  metric_type: z.string().min(1),
  data_source: z.string().min(1),
  data_source_identifier: z.string().optional(),
  target_value: z.number(),
  target_direction: z.enum(['above', 'below', 'between', 'equals']),
  threshold_low: z.number().optional(),
  threshold_high: z.number().optional(),
  unit: z.string().optional(),
  weight: z.number().min(0).max(10).optional().default(1),
}).openapi('DataPoint');

const createThesisSchema = z.object({
  title: z.string().min(1).max(200),
  hypothesis: z.string().min(1),
  category: z.string().min(1),
  timeframe: z.string().min(1),
  source: z.enum(['human', 'ai', 'hybrid']),
  tags: z.array(z.string()).optional().default([]),
  key_arguments: z.string().optional(),
  contrarian_view: z.string().optional(),
  data_points: z.array(dataPointSchema).min(2).max(8),
}).openapi('CreateThesisRequest');

const updateDataPointSchema = z.object({
  data_point_id: z.number().int().positive(),
  value: z.number(),
  source: z.string().optional(),
}).openapi('UpdateDataPointRequest');

const createArticleSchema = z.object({
  title: z.string().min(1),
  date: z.string().min(1),
  topics: z.array(z.string().min(1)).min(1),
  summary: z.string().min(1),
  status: z.enum(['draft', 'published']).default('draft'),
}).openapi('CreateArticleRequest');

const createApiKeySchema = z.object({
  label: z.string().min(1).max(100),
}).openapi('CreateApiKeyRequest');

// ─── Shared response schemas ──────────────────────────────────────────────────

const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
}).openapi('ErrorResponse');

const thesisListItemSchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  hypothesis: z.string(),
  category: z.string(),
  status: z.string(),
  confidence_score: z.number(),
  created_at: z.string(),
}).openapi('ThesisListItem');

const articleListItemSchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  date: z.string(),
  topics: z.string(),
  summary: z.string(),
  status: z.string(),
  created_at: z.string(),
}).openapi('ArticleListItem');

const memberListItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  status: z.string(),
  created_at: z.string(),
}).openapi('MemberListItem');

// ─── Registry ─────────────────────────────────────────────────────────────────

const registry = new OpenAPIRegistry();

// Security scheme
registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  description: 'API key obtained from the admin panel at /admin/api-keys',
});

// ─── Theses paths ─────────────────────────────────────────────────────────────

registry.registerPath({
  method: 'get',
  path: '/theses',
  summary: 'List all investment theses',
  tags: ['Theses'],
  request: {
    query: z.object({
      status: z.enum(['active', 'closed', 'invalidated']).optional(),
      category: z.enum(['stocks', 'fed_policy', 'sector', 'macro']).optional(),
    }),
  },
  responses: {
    200: {
      description: 'List of theses',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.array(thesisListItemSchema),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/theses',
  summary: 'Create a new investment thesis',
  tags: ['Theses'],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': { schema: createThesisSchema },
      },
    },
  },
  responses: {
    201: {
      description: 'Thesis created',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.object({ id: z.number(), slug: z.string() }),
          }),
        },
      },
    },
    400: { description: 'Validation error', content: { 'application/json': { schema: errorResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
    409: { description: 'Slug conflict', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/theses/{slug}',
  summary: 'Get a single thesis with data points and update history',
  tags: ['Theses'],
  request: {
    params: z.object({ slug: z.string() }),
  },
  responses: {
    200: {
      description: 'Thesis detail',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.object({
              thesis: thesisListItemSchema,
              dataPoints: z.array(z.object({ id: z.number(), name: z.string() }).passthrough()),
              updates: z.array(z.object({ update_type: z.string(), content: z.string() }).passthrough()),
            }),
          }),
        },
      },
    },
    404: { description: 'Not found', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: 'put',
  path: '/theses/{slug}/data-points',
  summary: 'Update a data point current value and recalculate confidence score',
  tags: ['Theses'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ slug: z.string() }),
    body: {
      content: {
        'application/json': { schema: updateDataPointSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Data point updated',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.object({ confidence_score: z.number() }),
          }),
        },
      },
    },
    400: { description: 'Validation error', content: { 'application/json': { schema: errorResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
    404: { description: 'Data point not found', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

// ─── Research paths ───────────────────────────────────────────────────────────

registry.registerPath({
  method: 'get',
  path: '/research',
  summary: 'List published research articles',
  tags: ['Research'],
  request: {
    query: z.object({
      topic: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: 'List of published articles',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.array(articleListItemSchema),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/research',
  summary: 'Create a new research article record',
  tags: ['Research'],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': { schema: createArticleSchema },
      },
    },
  },
  responses: {
    201: {
      description: 'Article created',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.object({ id: z.number(), slug: z.string() }),
          }),
        },
      },
    },
    400: { description: 'Validation error', content: { 'application/json': { schema: errorResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/research/{slug}',
  summary: 'Get a single research article with full content',
  tags: ['Research'],
  request: {
    params: z.object({ slug: z.string() }),
  },
  responses: {
    200: {
      description: 'Article detail',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: articleListItemSchema,
          }),
        },
      },
    },
    404: { description: 'Not found', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

// ─── Members paths ────────────────────────────────────────────────────────────

registry.registerPath({
  method: 'get',
  path: '/members',
  summary: 'List all members (admin)',
  tags: ['Members'],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      status: z.enum(['pending', 'approved', 'active']).optional(),
    }),
  },
  responses: {
    200: {
      description: 'List of members',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.array(memberListItemSchema),
          }),
        },
      },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

// ─── API Keys paths ───────────────────────────────────────────────────────────

registry.registerPath({
  method: 'post',
  path: '/api-keys',
  summary: 'Create a new API key',
  tags: ['API Keys'],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': { schema: createApiKeySchema },
      },
    },
  },
  responses: {
    201: {
      description: 'API key created (key shown once only)',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.object({ id: z.number(), key: z.string(), label: z.string() }),
          }),
        },
      },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

// ─── Generate and write ───────────────────────────────────────────────────────

const generator = new OpenApiGeneratorV31(registry.definitions);

const spec = generator.generateDocument({
  openapi: '3.1.0',
  info: {
    title: 'InvestCollective API',
    version: '1.0.0',
    description: 'REST API for InvestCollective investment analysis platform',
  },
  servers: [{ url: '/api/v1', description: 'Production' }],
});

mkdirSync('docs', { recursive: true });
writeFileSync('docs/openapi.json', JSON.stringify(spec, null, 2));
console.log('OpenAPI spec written to docs/openapi.json');
