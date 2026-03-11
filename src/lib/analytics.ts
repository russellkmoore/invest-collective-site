'use server';

import { getDb } from '@/lib/db';
import { analyticsEvents } from '../../drizzle/schema';
import { eq, and, gte, count, isNotNull, ne, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { parseUserAgent } from '@/lib/user-agent-parser';

type EventType = 'page_view' | 'article_view' | 'pdf_download' | 'topic_filter';

interface AnalyticsEvent {
  event_type: EventType;
  page_path?: string;
  article_slug?: string;
  topic?: string;
}

export async function trackEvent(event: AnalyticsEvent) {
  try {
    const db = getDb();
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const cfCountry = headersList.get('cf-ipcountry') || '';
    const referrer = headersList.get('referer') || '';

    // Parse UA at write time so analytics queries can GROUP BY parsed columns
    const { browser, os, device } = parseUserAgent(userAgent);

    await db.insert(analyticsEvents).values({
      event_type: event.event_type,
      page_path: event.page_path ?? null,
      article_slug: event.article_slug ?? null,
      topic: event.topic ?? null,
      user_agent: userAgent,
      country: cfCountry,
      referrer: referrer,
      browser,
      os,
      device,
    });

    return { success: true };
  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Don't fail the page if analytics fails
    return { success: false };
  }
}

export async function getAnalyticsSummary(days = 30) {
  try {
    const db = getDb();
    const cutoff = new Date(Date.now() - days * 86400000).toISOString();

    // Execute all 11 queries in a single D1 batch round-trip
    const [
      totalEventsResult,
      articleViewsResult,
      pdfDownloadsResult,
      pageViewsResult,
      topPagesResult,
      topArticlesResult,
      topTopicsResult,
      eventsByDayResult,
      topCountriesResult,
      topReferrersResult,
      browserGroupResult,
      deviceGroupResult,
      hourlyActivityResult,
      dailyActivityResult,
    ] = await db.batch([
      // Total events
      db.select({ count: count() })
        .from(analyticsEvents)
        .where(gte(analyticsEvents.timestamp, cutoff)),

      // Article views
      db.select({ count: count() })
        .from(analyticsEvents)
        .where(and(eq(analyticsEvents.event_type, 'article_view'), gte(analyticsEvents.timestamp, cutoff))),

      // PDF downloads
      db.select({ count: count() })
        .from(analyticsEvents)
        .where(and(eq(analyticsEvents.event_type, 'pdf_download'), gte(analyticsEvents.timestamp, cutoff))),

      // Page views
      db.select({ count: count() })
        .from(analyticsEvents)
        .where(and(eq(analyticsEvents.event_type, 'page_view'), gte(analyticsEvents.timestamp, cutoff))),

      // Top pages
      db.select({
        page_path: analyticsEvents.page_path,
        views: count(),
      })
        .from(analyticsEvents)
        .where(and(
          eq(analyticsEvents.event_type, 'page_view'),
          isNotNull(analyticsEvents.page_path),
          gte(analyticsEvents.timestamp, cutoff),
        ))
        .groupBy(analyticsEvents.page_path)
        .orderBy(sql`count(*) desc`)
        .limit(10),

      // Top articles
      db.select({
        article_slug: analyticsEvents.article_slug,
        views: count(),
      })
        .from(analyticsEvents)
        .where(and(
          eq(analyticsEvents.event_type, 'article_view'),
          isNotNull(analyticsEvents.article_slug),
          gte(analyticsEvents.timestamp, cutoff),
        ))
        .groupBy(analyticsEvents.article_slug)
        .orderBy(sql`count(*) desc`)
        .limit(10),

      // Top topics
      db.select({
        topic: analyticsEvents.topic,
        clicks: count(),
      })
        .from(analyticsEvents)
        .where(and(
          eq(analyticsEvents.event_type, 'topic_filter'),
          isNotNull(analyticsEvents.topic),
          gte(analyticsEvents.timestamp, cutoff),
        ))
        .groupBy(analyticsEvents.topic)
        .orderBy(sql`count(*) desc`)
        .limit(10),

      // Events by day
      db.select({
        date: sql<string>`DATE(${analyticsEvents.timestamp})`,
        count: count(),
      })
        .from(analyticsEvents)
        .where(gte(analyticsEvents.timestamp, cutoff))
        .groupBy(sql`DATE(${analyticsEvents.timestamp})`)
        .orderBy(sql`DATE(${analyticsEvents.timestamp}) desc`)
        .limit(30),

      // Top countries
      db.select({
        country: analyticsEvents.country,
        visitors: count(),
      })
        .from(analyticsEvents)
        .where(and(
          isNotNull(analyticsEvents.country),
          ne(analyticsEvents.country, ''),
          gte(analyticsEvents.timestamp, cutoff),
        ))
        .groupBy(analyticsEvents.country)
        .orderBy(sql`count(*) desc`)
        .limit(10),

      // Top referrers
      db.select({
        referrer: analyticsEvents.referrer,
        visits: count(),
      })
        .from(analyticsEvents)
        .where(and(
          isNotNull(analyticsEvents.referrer),
          ne(analyticsEvents.referrer, ''),
          gte(analyticsEvents.timestamp, cutoff),
        ))
        .groupBy(analyticsEvents.referrer)
        .orderBy(sql`count(*) desc`)
        .limit(10),

      // Browser breakdown (grouped by pre-parsed browser column)
      db.select({
        browser: analyticsEvents.browser,
        count: count(),
      })
        .from(analyticsEvents)
        .where(and(
          isNotNull(analyticsEvents.browser),
          gte(analyticsEvents.timestamp, cutoff),
        ))
        .groupBy(analyticsEvents.browser)
        .orderBy(sql`count(*) desc`),

      // Device breakdown (grouped by pre-parsed device column)
      db.select({
        device: analyticsEvents.device,
        count: count(),
      })
        .from(analyticsEvents)
        .where(and(
          isNotNull(analyticsEvents.device),
          gte(analyticsEvents.timestamp, cutoff),
        ))
        .groupBy(analyticsEvents.device)
        .orderBy(sql`count(*) desc`),

      // Hourly activity
      db.select({
        hour: sql<number>`CAST(strftime('%H', ${analyticsEvents.timestamp}) AS INTEGER)`,
        count: count(),
      })
        .from(analyticsEvents)
        .where(gte(analyticsEvents.timestamp, cutoff))
        .groupBy(sql`CAST(strftime('%H', ${analyticsEvents.timestamp}) AS INTEGER)`)
        .orderBy(sql`CAST(strftime('%H', ${analyticsEvents.timestamp}) AS INTEGER)`),

      // Day of week activity
      db.select({
        day: sql<number>`CAST(strftime('%w', ${analyticsEvents.timestamp}) AS INTEGER)`,
        count: count(),
      })
        .from(analyticsEvents)
        .where(gte(analyticsEvents.timestamp, cutoff))
        .groupBy(sql`CAST(strftime('%w', ${analyticsEvents.timestamp}) AS INTEGER)`)
        .orderBy(sql`CAST(strftime('%w', ${analyticsEvents.timestamp}) AS INTEGER)`),
    ]);

    return {
      summary: {
        totalEvents: totalEventsResult[0]?.count ?? 0,
        pageViews: pageViewsResult[0]?.count ?? 0,
        articleViews: articleViewsResult[0]?.count ?? 0,
        pdfDownloads: pdfDownloadsResult[0]?.count ?? 0,
      },
      topPages: (topPagesResult as Array<{ page_path: string | null; views: number }>).filter(
        (r) => r.page_path != null,
      ) as Array<{ page_path: string; views: number }>,
      topArticles: (topArticlesResult as Array<{ article_slug: string | null; views: number }>).filter(
        (r) => r.article_slug != null,
      ) as Array<{ article_slug: string; views: number }>,
      topTopics: (topTopicsResult as Array<{ topic: string | null; clicks: number }>).filter(
        (r) => r.topic != null,
      ) as Array<{ topic: string; clicks: number }>,
      eventsByDay: eventsByDayResult as Array<{ date: string; count: number }>,
      topCountries: (topCountriesResult as Array<{ country: string | null; visitors: number }>).filter(
        (r) => r.country != null,
      ) as Array<{ country: string; visitors: number }>,
      topReferrers: (topReferrersResult as Array<{ referrer: string | null; visits: number }>).filter(
        (r) => r.referrer != null,
      ) as Array<{ referrer: string; visits: number }>,
      // Pre-grouped by parsed columns — analytics dashboard no longer needs to parse raw UA strings
      browsers: browserGroupResult as Array<{ browser: string | null; count: number }>,
      devices: deviceGroupResult as Array<{ device: string | null; count: number }>,
      // Legacy field kept for backward compat — empty since we now group by parsed columns
      userAgents: [] as Array<{ user_agent: string; count: number }>,
      hourlyActivity: hourlyActivityResult as Array<{ hour: number; count: number }>,
      dailyActivity: dailyActivityResult as Array<{ day: number; count: number }>,
    };
  } catch (error) {
    console.error('Analytics summary error:', error);
    return {
      summary: { totalEvents: 0, pageViews: 0, articleViews: 0, pdfDownloads: 0 },
      topPages: [],
      topArticles: [],
      topTopics: [],
      eventsByDay: [],
      topCountries: [],
      topReferrers: [],
      browsers: [],
      devices: [],
      userAgents: [],
      hourlyActivity: [],
      dailyActivity: [],
    };
  }
}
