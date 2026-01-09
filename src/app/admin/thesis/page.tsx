import Link from 'next/link';
import { Plus, TrendingUp, Clock, Target } from 'lucide-react';
import { getAllTheses } from './actions';
import {
  getStatusColor,
  calculateDaysRemaining,
  calculateTimeProgress,
} from '@/lib/thesis-scoring';

export const dynamic = 'force-dynamic';

export default async function AdminThesisListPage() {
  const theses = await getAllTheses();

  const activeTheses = theses.filter((t) => t.status === 'active');
  const closedTheses = theses.filter((t) => t.status === 'closed');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Thesis Management</h1>
            <p className="text-gray-600 mt-2">
              Create and manage investment theses
            </p>
          </div>
          <Link
            href="/admin/thesis/create"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create New Thesis
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Theses</p>
                <p className="text-2xl font-bold">{theses.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{activeTheses.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Closed</p>
                <p className="text-2xl font-bold">{closedTheses.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Confidence</p>
                <p className="text-2xl font-bold">
                  {activeTheses.length > 0
                    ? Math.round(
                        activeTheses.reduce((sum, t) => sum + t.confidence_score, 0) /
                          activeTheses.length
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Theses */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Theses</h2>
          {activeTheses.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">No active theses yet.</p>
              <Link
                href="/admin/thesis/create"
                className="text-blue-600 hover:underline mt-2 inline-block"
              >
                Create your first thesis →
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {activeTheses.map((thesis) => {
                const daysRemaining = calculateDaysRemaining(thesis.prediction_end_date);
                const timeProgress = calculateTimeProgress(
                  thesis.prediction_start_date,
                  thesis.prediction_end_date
                );
                const tags = JSON.parse(thesis.tags) as string[];

                return (
                  <Link
                    key={thesis.id}
                    href={`/admin/thesis/${thesis.slug}`}
                    className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {thesis.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{thesis.hypothesis}</p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          thesis.confidence_score
                        )}`}
                      >
                        {thesis.confidence_score}% Confidence
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        {thesis.category.replace('_', ' ').toUpperCase()}
                      </span>
                      {tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {daysRemaining} days remaining ({timeProgress}%)
                        </span>
                      </div>
                      <div>Created: {new Date(thesis.created_at).toLocaleDateString()}</div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${timeProgress}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Closed Theses */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Closed Theses</h2>
          {closedTheses.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">No closed theses yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {closedTheses.map((thesis) => {
                const tags = JSON.parse(thesis.tags) as string[];

                return (
                  <Link
                    key={thesis.id}
                    href={`/admin/thesis/${thesis.slug}`}
                    className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {thesis.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{thesis.hypothesis}</p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          thesis.outcome_score || 0
                        )}`}
                      >
                        {thesis.outcome_score}% Final Score
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        {thesis.category.replace('_', ' ').toUpperCase()}
                      </span>
                      {tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div>
                        Closed: {thesis.closed_at ? new Date(thesis.closed_at).toLocaleDateString() : 'N/A'}
                      </div>
                      <div>
                        Duration:{' '}
                        {Math.ceil(
                          (new Date(thesis.prediction_end_date).getTime() -
                            new Date(thesis.prediction_start_date).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{' '}
                        days
                      </div>
                    </div>
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
