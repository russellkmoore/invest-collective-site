import Link from 'next/link';
import { ChevronLeft, Clock, Target, TrendingUp, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { getThesisBySlug } from '@/app/admin/thesis/actions';
import {
  getStatusColor,
  getStatusLabel,
  calculateDaysRemaining,
  calculateTimeProgress,
} from '@/lib/thesis-scoring';
import { notFound } from 'next/navigation';
import { GenerationBadge } from '@/components/ThesisCard';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { thesis } = await getThesisBySlug(params.slug);

  if (!thesis) {
    return {
      title: 'Thesis Not Found',
    };
  }

  return {
    title: `${thesis.title} | Thesis Tracker | The Invest Collective`,
    description: thesis.hypothesis,
  };
}

export default async function ThesisDetailPage({ params }: { params: { slug: string } }) {
  const { thesis, dataPoints } = await getThesisBySlug(params.slug);

  if (!thesis) {
    notFound();
  }

  const tags = JSON.parse(thesis.tags) as string[];
  const isActive = thesis.status === 'active';
  const daysRemaining = isActive ? calculateDaysRemaining(thesis.prediction_end_date) : null;
  const timeProgress = isActive
    ? calculateTimeProgress(thesis.prediction_start_date, thesis.prediction_end_date)
    : null;

  const displayScore = isActive ? thesis.confidence_score : thesis.outcome_score || 0;
  const scoreLabel = isActive ? 'Confidence Score' : 'Final Outcome Score';
  const statusLabel = isActive ? 'Active Thesis' : getStatusLabel(displayScore);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/thesis-tracker"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to All Theses</span>
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{thesis.title}</h1>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded">
                  {thesis.category.replace('_', ' ').toUpperCase()}
                </span>
                {thesis.subcategory && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                    {thesis.subcategory}
                  </span>
                )}
                <span
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {isActive ? 'Active' : 'Closed'}
                </span>
                <GenerationBadge method={thesis.generation_method} />
              </div>
            </div>
            <div className="text-center">
              <div className={`px-6 py-3 rounded-lg text-2xl font-bold ${getStatusColor(displayScore)}`}>
                {displayScore}%
              </div>
              <p className="text-sm text-gray-600 mt-2">{scoreLabel}</p>
              {!isActive && (
                <p className="text-xs text-gray-500 mt-1 font-medium">{statusLabel}</p>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-lg">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Calendar className="w-4 h-4" />
                Event Date
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(thesis.event_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Clock className="w-4 h-4" />
                Prediction Window
              </div>
              <p className="text-lg font-semibold text-gray-900">{thesis.timeframe}</p>
              <p className="text-xs text-gray-500">
                {new Date(thesis.prediction_start_date).toLocaleDateString()} -{' '}
                {new Date(thesis.prediction_end_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                {isActive ? 'Time Remaining' : 'Closed Date'}
              </div>
              {isActive && daysRemaining !== null ? (
                <p className="text-lg font-semibold text-gray-900">{daysRemaining} days</p>
              ) : (
                <p className="text-lg font-semibold text-gray-900">
                  {thesis.closed_at ? new Date(thesis.closed_at).toLocaleDateString() : 'N/A'}
                </p>
              )}
            </div>
          </div>

          {/* Progress Bar (Active Only) */}
          {isActive && timeProgress !== null && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progress through prediction window</span>
                <span className="font-medium">{timeProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${timeProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Thesis Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Thesis Details</h2>

          <div className="space-y-6">
            <div>
              <div className="flex items-start gap-3 mb-2">
                <Target className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">The Event</h3>
                  <p className="text-gray-700 leading-relaxed">{thesis.event_description}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-start gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Our Hypothesis</h3>
                  <p className="text-gray-700 leading-relaxed">{thesis.hypothesis}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Rationale</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{thesis.rationale}</p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Data Points */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Measurable Data Points ({dataPoints.length})
          </h2>

          <div className="space-y-4">
            {dataPoints.map((dp, index) => {
              const hasValue = dp.current_value !== undefined && dp.current_value !== null;

              return (
                <div key={dp.id} className="p-6 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-500">
                          Data Point {index + 1}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{dp.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {dp.metric_type.charAt(0).toUpperCase() + dp.metric_type.slice(1)} •{' '}
                        {dp.data_source.replace('_', ' ')}
                        {dp.data_source_identifier && ` (${dp.data_source_identifier})`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {dp.current_status === 'met' && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">Met</span>
                        </div>
                      )}
                      {dp.current_status === 'on_track' && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <TrendingUp className="w-5 h-5" />
                          <span className="text-sm font-medium">On Track</span>
                        </div>
                      )}
                      {dp.current_status === 'off_track' && (
                        <div className="flex items-center gap-1 text-orange-600">
                          <XCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">Off Track</span>
                        </div>
                      )}
                      {dp.current_status === 'failed' && (
                        <div className="flex items-center gap-1 text-red-600">
                          <XCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">Failed</span>
                        </div>
                      )}
                      {dp.current_status === 'pending' && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="w-5 h-5" />
                          <span className="text-sm font-medium">Pending</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Target</p>
                      <p className="text-base font-semibold text-gray-900">
                        {dp.target_direction.charAt(0).toUpperCase() + dp.target_direction.slice(1)}{' '}
                        {dp.target_direction === 'between'
                          ? `${dp.target_threshold_low} - ${dp.target_threshold_high}`
                          : dp.target_value}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Current Value</p>
                      <p className="text-base font-semibold text-gray-900">
                        {hasValue ? dp.current_value : 'Not yet measured'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                      <p className="text-sm text-gray-900">
                        {dp.last_updated ? new Date(dp.last_updated).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>How we score:</strong> Each data point is evaluated as "met", "on track", "off
              track", or "failed" based on its current value vs. target. The overall confidence score
              is calculated as the percentage of data points that are "met" or "on track". When a
              thesis is closed, the final outcome score only counts "met" data points.
            </p>
          </div>
        </div>

        {/* Attribution */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Created by The Invest Collective •{' '}
          {new Date(thesis.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
