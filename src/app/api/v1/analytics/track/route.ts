import { NextRequest } from 'next/server';
import { trackEvent } from '@/lib/analytics';
import { apiSuccess, apiError } from '@/lib/api-response';

/**
 * POST /api/v1/analytics/track
 * Track an analytics event. No auth required — called by client-side PageViewTracker.
 * Migrated from /api/analytics/track/route.ts.
 * Accepts the same POST body format for backward compatibility.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_type, page_path, article_slug, topic } = body;

    if (!event_type) {
      return apiError('event_type is required', 400);
    }

    await trackEvent({
      event_type,
      page_path,
      article_slug,
      topic,
    });

    return apiSuccess({ tracked: true });
  } catch (error) {
    console.error('POST /api/v1/analytics/track error:', error);
    return apiError('Failed to track event', 500);
  }
}
