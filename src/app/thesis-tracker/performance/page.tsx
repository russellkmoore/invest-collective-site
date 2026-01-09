import Link from 'next/link';
import { ChevronLeft, TrendingUp, Target, Award, AlertCircle, Calendar, CheckCircle } from 'lucide-react';
import { getAllTheses } from '@/app/admin/thesis/actions';
import { getStatusLabel } from '@/lib/thesis-scoring';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Performance Dashboard | Thesis Tracker | The Invest Collective',
  description: 'Our track record of investment thesis predictions - complete transparency on wins and losses.',
};

interface CategoryStats {
  category: string;
  total: number;
  active: number;
  closed: number;
  successful: number;
  successRate: number;
  avgConfidence: number;
}

export default async function PerformanceDashboardPage() {
  const allTheses = await getAllTheses();

  // Overall Stats
  const totalTheses = allTheses.length;
  const activeTheses = allTheses.filter((t) => t.status === 'active');
  const closedTheses = allTheses.filter((t) => t.status === 'closed');
  const successfulTheses = closedTheses.filter((t) => (t.outcome_score || 0) >= 70);
  const partialSuccessTheses = closedTheses.filter(
    (t) => (t.outcome_score || 0) >= 50 && (t.outcome_score || 0) < 70
  );
  const failedTheses = closedTheses.filter((t) => (t.outcome_score || 0) < 50);

  const overallSuccessRate =
    closedTheses.length > 0 ? Math.round((successfulTheses.length / closedTheses.length) * 100) : 0;

  const avgActiveConfidence =
    activeTheses.length > 0
      ? Math.round(
          activeTheses.reduce((sum, t) => sum + t.confidence_score, 0) / activeTheses.length
        )
      : 0;

  const avgOutcomeScore =
    closedTheses.length > 0
      ? Math.round(
          closedTheses.reduce((sum, t) => sum + (t.outcome_score || 0), 0) / closedTheses.length
        )
      : 0;

  // Category Breakdown
  const categories = Array.from(new Set(allTheses.map((t) => t.category)));
  const categoryStats: CategoryStats[] = categories.map((category) => {
    const categoryTheses = allTheses.filter((t) => t.category === category);
    const categoryActive = categoryTheses.filter((t) => t.status === 'active');
    const categoryClosed = categoryTheses.filter((t) => t.status === 'closed');
    const categorySuccessful = categoryClosed.filter((t) => (t.outcome_score || 0) >= 70);

    const successRate =
      categoryClosed.length > 0
        ? Math.round((categorySuccessful.length / categoryClosed.length) * 100)
        : 0;

    const avgConfidence =
      categoryActive.length > 0
        ? Math.round(
            categoryActive.reduce((sum, t) => sum + t.confidence_score, 0) / categoryActive.length
          )
        : 0;

    return {
      category,
      total: categoryTheses.length,
      active: categoryActive.length,
      closed: categoryClosed.length,
      successful: categorySuccessful.length,
      successRate,
      avgConfidence,
    };
  });

  // Sort by success rate (descending)
  categoryStats.sort((a, b) => b.successRate - a.successRate);

  // Recent Activity - Last 10 closed theses
  const recentlyClosed = closedTheses
    .sort((a, b) => {
      const dateA = a.closed_at ? new Date(a.closed_at).getTime() : 0;
      const dateB = b.closed_at ? new Date(b.closed_at).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 10);

  // Recently Created - Last 10 theses
  const recentlyCreated = [...allTheses]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/thesis-tracker"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Thesis Tracker</span>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Performance Dashboard</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete transparency on our investment thesis predictions. We track every prediction and
              show you the results—wins, losses, and everything in between.
            </p>
          </div>
        </div>

        {/* Overall Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Theses</p>
                <p className="text-3xl font-bold text-gray-900">{totalTheses}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {activeTheses.length} active, {closedTheses.length} closed
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold text-green-600">
                  {closedTheses.length > 0 ? `${overallSuccessRate}%` : 'N/A'}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {successfulTheses.length} of {closedTheses.length} successful
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Active Confidence</p>
                <p className="text-3xl font-bold text-purple-600">
                  {activeTheses.length > 0 ? `${avgActiveConfidence}%` : 'N/A'}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Across {activeTheses.length} active theses</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Final Score</p>
                <p className="text-3xl font-bold text-orange-600">
                  {closedTheses.length > 0 ? `${avgOutcomeScore}%` : 'N/A'}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Across {closedTheses.length} closed theses</p>
          </div>
        </div>

        {/* Success Breakdown */}
        {closedTheses.length > 0 && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Success Breakdown</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {successfulTheses.length}
                </div>
                <div className="text-sm font-medium text-green-700 mb-1">Successful</div>
                <div className="text-xs text-green-600">≥70% outcome score</div>
              </div>

              <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-4xl font-bold text-yellow-600 mb-2">
                  {partialSuccessTheses.length}
                </div>
                <div className="text-sm font-medium text-yellow-700 mb-1">Partial Success</div>
                <div className="text-xs text-yellow-600">50-69% outcome score</div>
              </div>

              <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
                <div className="text-4xl font-bold text-red-600 mb-2">{failedTheses.length}</div>
                <div className="text-sm font-medium text-red-700 mb-1">Failed</div>
                <div className="text-xs text-red-600">&lt;50% outcome score</div>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
              {closedTheses.length > 0 && (
                <div className="h-full flex">
                  <div
                    className="bg-green-500 flex items-center justify-center text-white text-sm font-medium"
                    style={{
                      width: `${(successfulTheses.length / closedTheses.length) * 100}%`,
                    }}
                  >
                    {successfulTheses.length > 0 &&
                      `${Math.round((successfulTheses.length / closedTheses.length) * 100)}%`}
                  </div>
                  <div
                    className="bg-yellow-500 flex items-center justify-center text-white text-sm font-medium"
                    style={{
                      width: `${(partialSuccessTheses.length / closedTheses.length) * 100}%`,
                    }}
                  >
                    {partialSuccessTheses.length > 0 &&
                      `${Math.round((partialSuccessTheses.length / closedTheses.length) * 100)}%`}
                  </div>
                  <div
                    className="bg-red-500 flex items-center justify-center text-white text-sm font-medium"
                    style={{
                      width: `${(failedTheses.length / closedTheses.length) * 100}%`,
                    }}
                  >
                    {failedTheses.length > 0 &&
                      `${Math.round((failedTheses.length / closedTheses.length) * 100)}%`}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Category Performance */}
        {categoryStats.length > 0 && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance by Category</h2>

            <div className="space-y-4">
              {categoryStats.map((stat) => (
                <div key={stat.category} className="p-6 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {stat.category.replace('_', ' ').charAt(0).toUpperCase() +
                          stat.category.replace('_', ' ').slice(1)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {stat.total} total ({stat.active} active, {stat.closed} closed)
                      </p>
                    </div>
                    <div className="text-right">
                      {stat.closed > 0 ? (
                        <>
                          <div className="text-2xl font-bold text-gray-900">
                            {stat.successRate}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {stat.successful} of {stat.closed} successful
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">No closed theses yet</div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-2">
                        Success Rate {stat.closed > 0 && `(${stat.closed} closed)`}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            stat.successRate >= 70
                              ? 'bg-green-500'
                              : stat.successRate >= 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${stat.closed > 0 ? stat.successRate : 0}%` }}
                        />
                      </div>
                    </div>

                    {stat.active > 0 && (
                      <div>
                        <div className="text-sm text-gray-600 mb-2">
                          Avg Active Confidence ({stat.active} active)
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-blue-500 h-3 rounded-full"
                            style={{ width: `${stat.avgConfidence}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {categoryStats.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Best Category:</strong>{' '}
                  {categoryStats[0].category.replace('_', ' ').charAt(0).toUpperCase() +
                    categoryStats[0].category.replace('_', ' ').slice(1)}{' '}
                  ({categoryStats[0].successRate}% success rate)
                  {categoryStats.length > 1 && categoryStats[categoryStats.length - 1].closed > 0 && (
                    <>
                      {' • '}
                      <strong>Needs Improvement:</strong>{' '}
                      {categoryStats[categoryStats.length - 1].category
                        .replace('_', ' ')
                        .charAt(0)
                        .toUpperCase() +
                        categoryStats[categoryStats.length - 1].category.replace('_', ' ').slice(1)}{' '}
                      ({categoryStats[categoryStats.length - 1].successRate}% success rate)
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recently Closed */}
          {recentlyClosed.length > 0 && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle className="w-5 h-5 text-gray-600" />
                <h2 className="text-2xl font-bold text-gray-900">Recently Closed</h2>
              </div>

              <div className="space-y-4">
                {recentlyClosed.map((thesis) => {
                  const outcomeScore = thesis.outcome_score || 0;
                  const statusLabel = getStatusLabel(outcomeScore);

                  return (
                    <Link
                      key={thesis.id}
                      href={`/thesis-tracker/${thesis.slug}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-base font-semibold text-gray-900 flex-1">
                          {thesis.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            outcomeScore >= 70
                              ? 'bg-green-100 text-green-700'
                              : outcomeScore >= 50
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {outcomeScore}%
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{statusLabel}</span>
                        <span>•</span>
                        <span>
                          Closed {thesis.closed_at && new Date(thesis.closed_at).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recently Created */}
          {recentlyCreated.length > 0 && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h2 className="text-2xl font-bold text-gray-900">Recently Created</h2>
              </div>

              <div className="space-y-4">
                {recentlyCreated.map((thesis) => {
                  const isActive = thesis.status === 'active';
                  const score = isActive ? thesis.confidence_score : thesis.outcome_score || 0;

                  return (
                    <Link
                      key={thesis.id}
                      href={`/thesis-tracker/${thesis.slug}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-base font-semibold text-gray-900 flex-1">
                          {thesis.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {isActive && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                              Active
                            </span>
                          )}
                          <span className="text-sm font-medium text-gray-700">{score}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          {thesis.category.replace('_', ' ').charAt(0).toUpperCase() +
                            thesis.category.replace('_', ' ').slice(1)}
                        </span>
                        <span>•</span>
                        <span>Created {new Date(thesis.created_at).toLocaleDateString()}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Methodology */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-blue-900 mb-3">Our Scoring Methodology</h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>
                  <strong>Active Theses:</strong> Confidence score = percentage of data points that are
                  "met" or "on track"
                </p>
                <p>
                  <strong>Closed Theses:</strong> Outcome score = percentage of data points that fully
                  "met" their targets (more strict)
                </p>
                <p>
                  <strong>Success Criteria:</strong> ≥70% = Successful, 50-69% = Partial Success, &lt;50%
                  = Failed
                </p>
                <p className="pt-2 border-t border-blue-200">
                  We believe transparency builds trust. Every thesis—successful or not—remains publicly
                  visible to demonstrate our methodology and track record over time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
