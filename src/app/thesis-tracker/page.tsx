import Link from 'next/link';
import { TrendingUp, Filter, BarChart3 } from 'lucide-react';
import { getAllTheses } from '../admin/thesis/actions';
import ThesisCard from '@/components/ThesisCard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Thesis Tracker | The Invest Collective',
  description:
    'Track our investment hypotheses and predictions with transparent, data-driven analysis. See our accuracy over time.',
};

export default async function ThesisTrackerPage({
  searchParams,
}: {
  searchParams: { category?: string; status?: string; page?: string };
}) {
  const category = searchParams.category;
  const status = searchParams.status;
  const currentPage = parseInt(searchParams.page || '1', 10);
  const ITEMS_PER_PAGE = 10;

  // Fetch ALL theses first (no filters) for stats and category list
  const allThesesUnfiltered = await getAllTheses();

  // Get unique categories from all theses (not filtered)
  const categories = Array.from(new Set(allThesesUnfiltered.map((t) => t.category)));

  // Calculate overall stats from unfiltered data
  const totalTheses = allThesesUnfiltered.length;
  const totalActive = allThesesUnfiltered.filter((t) => t.status === 'active').length;
  const totalClosed = allThesesUnfiltered.filter((t) => t.status === 'closed').length;
  const successfulTheses = allThesesUnfiltered.filter(
    (t) => t.status === 'closed' && (t.outcome_score || 0) >= 70
  );
  const overallAccuracy =
    totalClosed > 0 ? Math.round((successfulTheses.length / totalClosed) * 100) : 0;

  // Now apply filters for display
  const filters: { category?: string; status?: string } = {};
  if (category) filters.category = category;
  if (status) filters.status = status;

  const allTheses = await getAllTheses(filters);

  // Sort and calculate filtered stats for display sections
  // Active theses: sort by most recent (created_at DESC)
  const activeTheses = allTheses
    .filter((t) => t.status === 'active')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Closed theses: sort by most recently closed (closed_at DESC)
  const closedTheses = allTheses
    .filter((t) => t.status === 'closed')
    .sort((a, b) => {
      const dateA = a.closed_at ? new Date(a.closed_at).getTime() : 0;
      const dateB = b.closed_at ? new Date(b.closed_at).getTime() : 0;
      return dateB - dateA;
    });

  // Pagination for closed theses (active theses typically fewer, so no pagination needed)
  const totalClosedPages = Math.ceil(closedTheses.length / ITEMS_PER_PAGE);
  const paginatedClosedTheses = closedTheses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-6 rounded-full">
              <TrendingUp className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Investment Thesis Tracker</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            We make predictions. We track them. We show you the results—both wins and losses.
            Transparency builds trust.
          </p>
          <Link
            href="/thesis-tracker/performance"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <BarChart3 className="w-5 h-5" />
            View Performance Dashboard
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total Theses</div>
            <div className="text-3xl font-bold text-gray-900">{totalTheses}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Active</div>
            <div className="text-3xl font-bold text-blue-600">{totalActive}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Completed</div>
            <div className="text-3xl font-bold text-gray-900">{totalClosed}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Overall Accuracy</div>
            <div className="text-3xl font-bold text-green-600">
              {totalClosed > 0 ? `${overallAccuracy}%` : 'N/A'}
            </div>
            {totalClosed > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                {successfulTheses.length} of {totalClosed} successful
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div id="filters" className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filter Theses</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/thesis-tracker#filters"
                  scroll={false}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    href={`/thesis-tracker?category=${cat}${status ? `&status=${status}` : ''}#filters`}
                    scroll={false}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      category === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.replace('_', ' ').charAt(0).toUpperCase() +
                      cat.replace('_', ' ').slice(1)}
                  </Link>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/thesis-tracker${category ? `?category=${category}` : ''}#filters`}
                  scroll={false}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </Link>
                <Link
                  href={`/thesis-tracker?status=active${category ? `&category=${category}` : ''}#filters`}
                  scroll={false}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    status === 'active'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Active
                </Link>
                <Link
                  href={`/thesis-tracker?status=closed${category ? `&category=${category}` : ''}#filters`}
                  scroll={false}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    status === 'closed'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Closed
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Active Theses Section */}
        {(!status || status === 'active') && activeTheses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Active Theses ({activeTheses.length})
            </h2>
            <div className="grid gap-6">
              {activeTheses.map((thesis) => (
                <ThesisCard key={thesis.id} thesis={thesis} href={`/thesis-tracker/${thesis.slug}`} />
              ))}
            </div>
          </div>
        )}

        {/* Closed Theses Section */}
        {(!status || status === 'closed') && closedTheses.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Completed Theses ({closedTheses.length})
              </h2>
              {totalClosedPages > 1 && (
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalClosedPages}
                </div>
              )}
            </div>
            <div className="grid gap-6 mb-8">
              {paginatedClosedTheses.map((thesis) => (
                <ThesisCard key={thesis.id} thesis={thesis} href={`/thesis-tracker/${thesis.slug}`} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalClosedPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Link
                  href={`/thesis-tracker?${category ? `category=${category}&` : ''}${
                    status ? `status=${status}&` : ''
                  }page=${Math.max(1, currentPage - 1)}#filters`}
                  scroll={false}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-disabled={currentPage === 1}
                >
                  Previous
                </Link>

                <div className="flex gap-2">
                  {Array.from({ length: totalClosedPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show first page, last page, current page, and pages around current
                      return (
                        page === 1 ||
                        page === totalClosedPages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .map((page, idx, arr) => {
                      // Add ellipsis if there's a gap
                      const prevPage = arr[idx - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;

                      return (
                        <div key={page} className="flex gap-2">
                          {showEllipsis && (
                            <span className="px-3 py-2 text-gray-400">...</span>
                          )}
                          <Link
                            href={`/thesis-tracker?${category ? `category=${category}&` : ''}${
                              status ? `status=${status}&` : ''
                            }page=${page}#filters`}
                            scroll={false}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </Link>
                        </div>
                      );
                    })}
                </div>

                <Link
                  href={`/thesis-tracker?${category ? `category=${category}&` : ''}${
                    status ? `status=${status}&` : ''
                  }page=${Math.min(totalClosedPages, currentPage + 1)}#filters`}
                  scroll={false}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === totalClosedPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-disabled={currentPage === totalClosedPages}
                >
                  Next
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {allTheses.length === 0 && (
          <div className="text-center py-16">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Theses Yet</h3>
            <p className="text-gray-600">
              We're working on creating our first investment theses. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
