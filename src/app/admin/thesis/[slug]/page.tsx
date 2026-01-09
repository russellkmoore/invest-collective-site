'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Save,
  Trash2,
  Clock,
  Target,
  TrendingUp,
  MessageSquare,
  XCircle,
  CheckCircle,
} from 'lucide-react';
import {
  getThesisBySlug,
  updateDataPointValue,
  addThesisComment,
  closeThesis,
  deleteThesis,
} from '../actions';
import {
  getStatusColor,
  calculateDaysRemaining,
  calculateTimeProgress,
  type Thesis,
  type ThesisDataPoint,
} from '@/lib/thesis-scoring';

export default function ThesisManagePage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [thesis, setThesis] = useState<Thesis | null>(null);
  const [dataPoints, setDataPoints] = useState<ThesisDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [updateValues, setUpdateValues] = useState<Record<number, string>>({});
  const [comment, setComment] = useState('');
  const [closingCommentary, setClosingCommentary] = useState('');

  useEffect(() => {
    async function fetchThesis() {
      try {
        const result = await getThesisBySlug(params.slug);

        if (!result.thesis) {
          throw new Error('Thesis not found');
        }

        setThesis(result.thesis);
        setDataPoints(result.dataPoints);

        // Initialize update values with current values
        const initialValues: Record<number, string> = {};
        result.dataPoints.forEach((dp) => {
          if (dp.current_value !== undefined && dp.current_value !== null) {
            initialValues[dp.id] = dp.current_value.toString();
          }
        });
        setUpdateValues(initialValues);
      } catch (error) {
        console.error('Failed to fetch thesis:', error);
        setMessage({ type: 'error', text: 'Failed to load thesis' });
      } finally {
        setLoading(false);
      }
    }

    fetchThesis();
  }, [params.slug]);

  const handleUpdateDataPoint = async (dataPointId: number) => {
    if (!updateValues[dataPointId]) {
      setMessage({ type: 'error', text: 'Please enter a value' });
      return;
    }

    setUpdating(true);
    setMessage(null);

    try {
      const result = await updateDataPointValue(
        dataPointId,
        parseFloat(updateValues[dataPointId]),
        'admin' // This will be replaced with actual auth
      );

      if (result.success) {
        setMessage({ type: 'success', text: 'Data point updated successfully' });
        // Refresh thesis data
        const updated = await getThesisBySlug(params.slug);
        if (updated.thesis) {
          setThesis(updated.thesis);
          setDataPoints(updated.dataPoints);
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update data point' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
      console.error('Update error:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !thesis) return;

    setUpdating(true);
    setMessage(null);

    try {
      const result = await addThesisComment(thesis.id, comment, 'admin');

      if (result.success) {
        setMessage({ type: 'success', text: 'Comment added successfully' });
        setComment('');
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to add comment' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
      console.error('Comment error:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseThesis = async () => {
    if (!closingCommentary.trim() || !thesis) {
      setMessage({ type: 'error', text: 'Please provide closing commentary' });
      return;
    }

    setUpdating(true);
    setMessage(null);

    try {
      const result = await closeThesis(thesis.id, closingCommentary, 'admin');

      if (result.success) {
        setMessage({ type: 'success', text: 'Thesis closed successfully. Redirecting...' });
        setTimeout(() => {
          router.push('/admin/thesis');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to close thesis' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
      console.error('Close error:', error);
    } finally {
      setUpdating(false);
      setShowCloseDialog(false);
    }
  };

  const handleDelete = async () => {
    if (!thesis) return;

    setUpdating(true);
    setMessage(null);

    try {
      const result = await deleteThesis(thesis.id);

      if (result.success) {
        setMessage({ type: 'success', text: 'Thesis deleted. Redirecting...' });
        setTimeout(() => {
          router.push('/admin/thesis');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to delete thesis' });
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
      console.error('Delete error:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-24 flex items-center justify-center">
        <div className="text-gray-500">Loading thesis...</div>
      </div>
    );
  }

  if (!thesis) {
    return (
      <div className="min-h-screen bg-gray-50 py-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Thesis Not Found</h2>
          <Link href="/admin/thesis" className="text-blue-600 hover:text-blue-700">
            Return to Thesis List
          </Link>
        </div>
      </div>
    );
  }

  const tags = JSON.parse(thesis.tags) as string[];
  const daysRemaining = calculateDaysRemaining(thesis.prediction_end_date);
  const timeProgress = calculateTimeProgress(
    thesis.prediction_start_date,
    thesis.prediction_end_date
  );
  const isClosed = thesis.status === 'closed';

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/admin/thesis"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Thesis List</span>
          </Link>
          {!isClosed && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Thesis Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{thesis.title}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded">
                  {thesis.category.replace('_', ' ').toUpperCase()}
                </span>
                {thesis.subcategory && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                    {thesis.subcategory}
                  </span>
                )}
                {tags.slice(0, 5).map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div
              className={`px-4 py-2 rounded-full text-lg font-medium ${getStatusColor(
                isClosed ? thesis.outcome_score || 0 : thesis.confidence_score
              )}`}
            >
              {isClosed ? `${thesis.outcome_score}% Final` : `${thesis.confidence_score}% Confidence`}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Event</h3>
                <p className="text-sm text-gray-600">{thesis.event_description}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Hypothesis</h3>
                <p className="text-sm text-gray-600">{thesis.hypothesis}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Timeframe</h3>
                <p className="text-sm text-gray-600">{thesis.timeframe}</p>
                {!isClosed && (
                  <p className="text-xs text-gray-500 mt-1">
                    {daysRemaining} days remaining ({timeProgress}%)
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-900 mb-2">Rationale</h3>
            <p className="text-gray-600">{thesis.rationale}</p>
          </div>

          {!isClosed && (
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${timeProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Data Points */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Points</h2>

          <div className="space-y-4">
            {dataPoints.map((dp) => (
              <div key={dp.id} className="p-6 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{dp.name}</h3>
                    <p className="text-sm text-gray-600">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Target</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {dp.target_direction.charAt(0).toUpperCase() + dp.target_direction.slice(1)}{' '}
                      {dp.target_direction === 'between'
                        ? `${dp.target_threshold_low} - ${dp.target_threshold_high}`
                        : dp.target_value}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Current Value</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {dp.current_value !== undefined && dp.current_value !== null
                        ? dp.current_value
                        : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                    <p className="text-sm text-gray-900">
                      {dp.last_updated ? new Date(dp.last_updated).toLocaleString() : 'Never'}
                    </p>
                  </div>
                </div>

                {!isClosed && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="any"
                      value={updateValues[dp.id] || ''}
                      onChange={(e) =>
                        setUpdateValues({
                          ...updateValues,
                          [dp.id]: e.target.value,
                        })
                      }
                      placeholder="Enter new value"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleUpdateDataPoint(dp.id)}
                      disabled={updating}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Update
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {!isClosed && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Commentary</h2>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Add notes, observations, or updates about this thesis..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
            />

            <button
              onClick={handleAddComment}
              disabled={updating || !comment.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Add Comment
            </button>
          </div>
        )}

        {/* Close Thesis */}
        {!isClosed && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Close Thesis</h2>
            <p className="text-gray-600 mb-4">
              Ready to close this thesis? The final outcome score will be calculated based on the
              current status of all data points.
            </p>

            <button
              onClick={() => setShowCloseDialog(true)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Close Thesis
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Thesis?</h3>
              <p className="text-gray-600 mb-6">
                This will permanently delete this thesis and all associated data points and history. This
                action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
                >
                  {updating ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Close Dialog Modal */}
        {showCloseDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Close Thesis</h3>
              <p className="text-gray-600 mb-4">
                Provide closing commentary to explain the final outcome:
              </p>
              <textarea
                value={closingCommentary}
                onChange={(e) => setClosingCommentary(e.target.value)}
                rows={4}
                placeholder="Summarize the results, what went right or wrong, and key learnings..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
              />
              <div className="flex gap-4">
                <button
                  onClick={() => setShowCloseDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloseThesis}
                  disabled={updating || !closingCommentary.trim()}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400"
                >
                  {updating ? 'Closing...' : 'Close Thesis'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
