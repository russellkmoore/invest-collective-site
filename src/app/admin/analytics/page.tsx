import { getAnalyticsSummary } from '@/lib/analytics';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getCountryFlag, getCountryName } from '@/lib/user-agent-parser';
import Link from 'next/link';
import { BarChart3, Eye, Download, Filter, TrendingUp, FileText, ChevronLeft, Globe, Link as LinkIcon, Monitor, Clock } from 'lucide-react';

interface Article {
  slug: string;
  title: string;
}

async function getArticleTitles(slugs: string[]): Promise<Map<string, string>> {
  try {
    const { env } = getCloudflareContext();
    const { DB } = env;

    if (slugs.length === 0) return new Map();

    const placeholders = slugs.map(() => '?').join(',');
    const { results } = await DB.prepare(
      `SELECT slug, title FROM articles WHERE slug IN (${placeholders})`,
    )
      .bind(...slugs)
      .all<Article>();

    const map = new Map<string, string>();
    results?.forEach((article) => {
      map.set(article.slug, article.title);
    });

    return map;
  } catch (error) {
    console.error('Failed to fetch article titles:', error);
    return new Map();
  }
}

export default async function AnalyticsPage() {
  const analytics = await getAnalyticsSummary(30);
  const articleSlugs = analytics.topArticles.map((a) => a.article_slug);
  const articleTitles = await getArticleTitles(articleSlugs);

  const { summary, topPages, topArticles, topTopics, eventsByDay, topCountries, topReferrers, hourlyActivity, dailyActivity } = analytics;

  // Use pre-parsed browser/device columns from DB (no client-side UA parsing needed)
  const devices = (analytics.devices ?? [])
    .filter((d) => d.device != null)
    .map((d) => ({ type: d.device as string, count: d.count }));

  const browsers = (analytics.browsers ?? [])
    .filter((b) => b.browser != null)
    .map((b) => ({ name: b.browser as string, count: b.count }));

  // Process hourly activity for heatmap (create 24-hour array)
  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const found = hourlyActivity.find((h) => h.hour === i);
    return { hour: i, count: found?.count || 0 };
  });

  const maxHourlyCount = Math.max(...hourlyData.map((h) => h.count), 1);

  // Process daily activity (0 = Sunday, 6 = Saturday)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const found = dailyActivity.find((d) => d.day === i);
    return { day: i, dayName: dayNames[i], count: found?.count || 0 };
  });

  const maxDailyCount = Math.max(...dailyData.map((d) => d.count), 1);

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Admin Dashboard</span>
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-3 rounded-full">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          </div>
          <p className="text-gray-600">Research article performance over the last 30 days</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Page Views</h3>
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{summary.pageViews.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Article Views</h3>
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{summary.articleViews.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">PDF Downloads</h3>
              <Download className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{summary.pdfDownloads.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Events</h3>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{summary.totalEvents.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">All interactions</p>
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Eye className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Most Viewed Pages</h2>
          </div>

          {topPages.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No page views yet</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topPages.map((page, index) => (
                <div key={page.page_path} className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={page.page_path}
                      className="font-medium text-gray-900 hover:text-blue-600 transition-colors block truncate"
                    >
                      {page.page_path === '/' ? 'Home' : page.page_path}
                    </Link>
                    <p className="text-sm text-gray-500">{page.views.toLocaleString()} views</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Top Articles */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Most Viewed Articles</h2>
            </div>

            {topArticles.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No article views yet</p>
            ) : (
              <div className="space-y-4">
                {topArticles.map((article, index) => (
                  <div key={article.article_slug} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/research/${article.article_slug}`}
                        className="font-medium text-gray-900 hover:text-blue-600 transition-colors block truncate"
                      >
                        {articleTitles.get(article.article_slug) || article.article_slug}
                      </Link>
                      <p className="text-sm text-gray-500">{article.views} views</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Topics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Popular Topics</h2>
            </div>

            {topTopics.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No topic filters used yet</p>
            ) : (
              <div className="space-y-4">
                {topTopics.map((topic, index) => (
                  <div key={topic.topic} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold text-sm shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/research?topic=${encodeURIComponent(topic.topic)}`}
                        className="font-medium text-gray-900 hover:text-green-600 transition-colors block truncate"
                      >
                        {topic.topic}
                      </Link>
                      <p className="text-sm text-gray-500">{topic.clicks} clicks</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Events by Day */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Activity Over Time</h2>
          </div>

          {eventsByDay.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No activity data yet</p>
          ) : (
            <div className="space-y-2">
              {eventsByDay.slice(0, 14).map((day) => {
                const maxCount = Math.max(...eventsByDay.map((d) => d.count));
                const width = maxCount > 0 ? (day.count / maxCount) * 100 : 0;

                return (
                  <div key={day.date} className="flex items-center gap-4">
                    <div className="text-sm text-gray-600 w-24 shrink-0">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${width}%` }}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-sm font-medium text-gray-900">{day.count} events</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Geographic Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Geographic Distribution</h2>
            </div>

            {topCountries.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No country data yet</p>
            ) : (
              <div className="space-y-3">
                {topCountries.map((country, index) => {
                  const maxVisitors = topCountries[0].visitors;
                  const width = maxVisitors > 0 ? (country.visitors / maxVisitors) * 100 : 0;

                  return (
                    <div key={country.country} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm shrink-0">
                        {index + 1}
                      </div>
                      <div className="text-2xl shrink-0">{getCountryFlag(country.country)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900 text-sm">
                            {getCountryName(country.country)}
                          </span>
                          <span className="text-sm text-gray-500">{country.visitors} visitors</span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Traffic Sources */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <LinkIcon className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Traffic Sources</h2>
            </div>

            {topReferrers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No referrer data yet</p>
            ) : (
              <div className="space-y-3">
                {topReferrers.map((referrer, index) => {
                  const maxVisits = topReferrers[0].visits;
                  const width = maxVisits > 0 ? (referrer.visits / maxVisits) * 100 : 0;
                  const displayUrl = referrer.referrer.length > 40
                    ? referrer.referrer.substring(0, 40) + '...'
                    : referrer.referrer;

                  return (
                    <div key={referrer.referrer} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold text-sm shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900 text-sm truncate" title={referrer.referrer}>
                            {displayUrl}
                          </span>
                          <span className="text-sm text-gray-500 ml-2 shrink-0">{referrer.visits} visits</span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-green-600 h-full rounded-full transition-all"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Device & Browser Analytics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Monitor className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Device & Browser Analytics</h2>
            </div>

            {devices.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No device data yet</p>
            ) : (
              <div className="space-y-6">
                {/* Devices */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Device Types</h3>
                  <div className="space-y-2">
                    {devices.map((device) => {
                      const totalCount = devices.reduce((sum, d) => sum + d.count, 0);
                      const percentage = totalCount > 0 ? (device.count / totalCount) * 100 : 0;

                      return (
                        <div key={device.type} className="flex items-center gap-3">
                          <div className="w-20 text-sm text-gray-600 shrink-0">{device.type}</div>
                          <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                            <div
                              className="bg-purple-600 h-full rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-between px-3">
                              <span className="text-xs font-medium text-gray-900">{percentage.toFixed(1)}%</span>
                              <span className="text-xs text-gray-600">{device.count}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Browsers */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Browsers</h3>
                  <div className="space-y-2">
                    {browsers.slice(0, 5).map((browser) => {
                      const totalCount = browsers.reduce((sum, b) => sum + b.count, 0);
                      const percentage = totalCount > 0 ? (browser.count / totalCount) * 100 : 0;

                      return (
                        <div key={browser.name} className="flex items-center gap-3">
                          <div className="w-20 text-sm text-gray-600 shrink-0 truncate">{browser.name}</div>
                          <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-between px-3">
                              <span className="text-xs font-medium text-gray-900">{percentage.toFixed(1)}%</span>
                              <span className="text-xs text-gray-600">{browser.count}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Time-Based Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">Time-Based Activity</h2>
            </div>

            <div className="space-y-6">
              {/* Hour of Day Heatmap */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Hour of Day (UTC)</h3>
                <div className="grid grid-cols-12 gap-1">
                  {hourlyData.map((hour) => {
                    const intensity = maxHourlyCount > 0 ? (hour.count / maxHourlyCount) * 100 : 0;
                    const opacity = 0.2 + (intensity / 100) * 0.8;

                    return (
                      <div
                        key={hour.hour}
                        className="aspect-square rounded flex items-center justify-center text-xs font-medium relative group cursor-pointer"
                        style={{
                          backgroundColor: `rgba(249, 115, 22, ${opacity})`,
                        }}
                        title={`${hour.hour}:00 - ${hour.count} events`}
                      >
                        <span className="text-gray-700">{hour.hour}</span>
                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10">
                          {hour.hour}:00 - {hour.count} events
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Day of Week */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Day of Week</h3>
                <div className="space-y-2">
                  {dailyData.map((day) => {
                    const percentage = maxDailyCount > 0 ? (day.count / maxDailyCount) * 100 : 0;

                    return (
                      <div key={day.day} className="flex items-center gap-3">
                        <div className="w-12 text-sm text-gray-600 shrink-0">{day.dayName}</div>
                        <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                          <div
                            className="bg-orange-600 h-full rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-between px-3">
                            <span className="text-xs font-medium text-gray-900">{day.count} events</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cloudflare Web Analytics Note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Full Site Analytics</h3>
          <p className="text-blue-800 mb-4">
            For comprehensive site-wide analytics including page views, referrers, and visitor demographics, visit
            your Cloudflare Web Analytics dashboard.
          </p>
          <a
            href="https://dash.cloudflare.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            Open Cloudflare Dashboard →
          </a>
        </div>
      </div>
    </div>
  );
}
