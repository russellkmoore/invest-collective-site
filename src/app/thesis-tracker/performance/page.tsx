import Link from 'next/link';
import { ChevronLeft, TrendingUp } from 'lucide-react';
import { getAllTheses } from '@/app/admin/thesis/actions';
import { GenerationBadge } from '@/components/ThesisCard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Track Record | Thesis Tracker | The Invest Collective',
  description:
    'Our track record of investment thesis predictions — complete transparency on wins and losses, split by Human and AI generated theses.',
};

export default async function PerformanceDashboardPage() {
  const allTheses = await getAllTheses();

  const closedTheses = allTheses.filter((t) => t.status === 'closed');

  // Helper: determine if a thesis is a "win" (outcome_correct preferred, outcome_score >= 70 as fallback)
  const isWin = (t: (typeof allTheses)[number]): boolean => {
    return (t.outcome_score ?? 0) >= 70;
  };

  const isHumanGenerated = (t: (typeof allTheses)[number]): boolean =>
    !t.generation_method || t.generation_method === 'manual';

  const humanClosed = closedTheses.filter(isHumanGenerated);
  const aiClosed = closedTheses.filter((t) => !isHumanGenerated(t));

  const totalResolved = closedTheses.length;
  const humanWins = humanClosed.filter(isWin).length;
  const aiWins = aiClosed.filter(isWin).length;
  const overallWins = closedTheses.filter(isWin).length;

  const overallWinRate =
    totalResolved > 0 ? Math.round((overallWins / totalResolved) * 100) : null;
  const humanWinRate =
    humanClosed.length > 0 ? Math.round((humanWins / humanClosed.length) * 100) : null;
  const aiWinRate = aiClosed.length > 0 ? Math.round((aiWins / aiClosed.length) * 100) : null;

  // Sort resolved theses: most recently closed first
  const resolvedSorted = [...closedTheses].sort((a, b) => {
    const dateA = a.closed_at ? new Date(a.closed_at).getTime() : 0;
    const dateB = b.closed_at ? new Date(b.closed_at).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/thesis-tracker"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Thesis Tracker</span>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Track Record</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete transparency on our investment thesis predictions. Wins and losses shown with
              equal prominence — both matter.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Overall Win Rate */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Overall Win Rate</p>
            <p className="text-3xl font-bold text-gray-900">
              {overallWinRate !== null ? `${overallWinRate}%` : 'N/A'}
            </p>
            {overallWinRate !== null && (
              <p className="text-xs text-gray-500 mt-1">
                {overallWins} of {totalResolved} correct
              </p>
            )}
          </div>

          {/* Human Win Rate */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm text-gray-600">Human Win Rate</p>
              <GenerationBadge method="manual" />
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {humanWinRate !== null ? `${humanWinRate}%` : 'N/A'}
            </p>
            {humanWinRate !== null && (
              <p className="text-xs text-gray-500 mt-1">
                {humanWins} of {humanClosed.length} correct
              </p>
            )}
          </div>

          {/* AI Win Rate */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm text-gray-600">AI Win Rate</p>
              <GenerationBadge method="ai" />
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {aiWinRate !== null ? `${aiWinRate}%` : 'N/A'}
            </p>
            {aiWinRate !== null && (
              <p className="text-xs text-gray-500 mt-1">
                {aiWins} of {aiClosed.length} correct
              </p>
            )}
          </div>

          {/* Total Resolved */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Resolved</p>
            <p className="text-3xl font-bold text-gray-900">{totalResolved}</p>
            <p className="text-xs text-gray-500 mt-1">
              {humanClosed.length} human, {aiClosed.length} AI
            </p>
          </div>
        </div>

        {/* Resolved Thesis Cards */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Resolved Theses
            {totalResolved > 0 && (
              <span className="text-xl font-normal text-gray-500 ml-2">({totalResolved})</span>
            )}
          </h2>

          {totalResolved === 0 ? (
            /* Empty state */
            <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No resolved theses yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                No theses have been resolved yet. Check back after active theses reach their time
                horizon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resolvedSorted.map((thesis) => {
                const outcomeScore = thesis.outcome_score ?? 0;
                const correct = isWin(thesis);

                return (
                  <Link
                    key={thesis.id}
                    href={`/thesis-tracker/${thesis.slug}`}
                    className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 uppercase font-medium mb-1">
                          {thesis.category.replace('_', ' ')}
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                          {thesis.title}
                        </h3>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold border ${
                          correct
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {correct ? 'Correct' : 'Incorrect'}
                      </span>
                      <GenerationBadge method={thesis.generation_method} />
                    </div>

                    {/* Outcome score */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Outcome Score</span>
                      <span className="font-semibold text-gray-900">{outcomeScore}%</span>
                    </div>

                    {/* Score bar */}
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div
                        className={`h-1.5 rounded-full ${
                          outcomeScore >= 70
                            ? 'bg-green-500'
                            : outcomeScore >= 40
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${outcomeScore}%` }}
                      />
                    </div>

                    {/* Closed date */}
                    {thesis.closed_at && (
                      <div className="mt-3 text-xs text-gray-400">
                        Closed {new Date(thesis.closed_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
