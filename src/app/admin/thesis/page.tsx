import Link from 'next/link';
import { Plus, TrendingUp, Clock, Target, ChevronLeft, AlertCircle } from 'lucide-react';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Admin Dashboard</span>
          </Link>
          <Link
            href="/thesis-tracker"
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            View Public Thesis Tracker →
          </Link>
        </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200"
                  >
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 uppercase mb-2 font-medium">
                        {thesis.category.replace('_', ' ')}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                        {thesis.title}
                      </h3>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Confidence:</span>
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              thesis.confidence_score
                            )}`}
                          >
                            {thesis.confidence_score}%
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Created:</span>
                          <span className="text-gray-900">
                            {new Date(thesis.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Decision:</span>
                          <span className="text-gray-900">
                            {new Date(thesis.prediction_end_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {tags.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded">
                              +{tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Time Progress:</span>
                        <span className="font-semibold text-gray-900">{timeProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${timeProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-center text-sm text-gray-500 pt-2 border-t border-gray-100">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {daysRemaining} days left
                    </div>

                    {new Date(thesis.prediction_end_date) < new Date() && (
                      <div className="mt-3 flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Expired — Resolve Now</span>
                      </div>
                    )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {closedTheses.map((thesis) => {
                const tags = JSON.parse(thesis.tags) as string[];
                const displayScore = thesis.outcome_score || 0;

                return (
                  <Link
                    key={thesis.id}
                    href={`/admin/thesis/${thesis.slug}`}
                    className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200"
                  >
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 uppercase mb-2 font-medium">
                        {thesis.category.replace('_', ' ')}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                        {thesis.title}
                      </h3>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Final Score:</span>
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              displayScore
                            )}`}
                          >
                            {displayScore}%
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Created:</span>
                          <span className="text-gray-900">
                            {new Date(thesis.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Closed:</span>
                          <span className="text-gray-900">
                            {thesis.closed_at
                              ? new Date(thesis.closed_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {tags.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded">
                              +{tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Final Score:</span>
                        <span className="font-semibold text-gray-900">{displayScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            displayScore >= 70
                              ? 'bg-green-500'
                              : displayScore >= 40
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          }`}
                          style={{ width: `${displayScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-center text-sm pt-2 border-t border-gray-100">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          displayScore >= 70
                            ? 'bg-green-100 text-green-800'
                            : displayScore >= 40
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {displayScore >= 70 ? '✓ Successful' : displayScore >= 40 ? '≈ Partial' : '✗ Failed'}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Back to Admin */}
        <div className="mt-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
