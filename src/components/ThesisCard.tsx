import Link from 'next/link';
import { Clock } from 'lucide-react';
import {
  getStatusColor,
  calculateDaysRemaining,
  type Thesis,
} from '@/lib/thesis-scoring';

interface ThesisCardProps {
  thesis: Thesis;
  href: string;
}

export function GenerationBadge({ method }: { method?: string | null }) {
  const isHuman = !method || method === 'manual';
  if (isHuman) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-blue-200 bg-blue-50 text-blue-700">
        Human
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-purple-200 bg-purple-50 text-purple-700">
      AI
    </span>
  );
}

export default function ThesisCard({ thesis, href }: ThesisCardProps) {
  const tags = JSON.parse(thesis.tags) as string[];
  const isActive = thesis.status === 'active';
  const daysRemaining = isActive ? calculateDaysRemaining(thesis.prediction_end_date) : null;

  const displayScore = isActive ? thesis.confidence_score : thesis.outcome_score || 0;
  const scoreLabel = isActive ? 'Confidence' : 'Final Score';

  const getScoreColor = (score: number): string => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreEmoji = (score: number): string => {
    if (score >= 70) return '🟢';
    if (score >= 40) return '🟡';
    return '🔴';
  };

  return (
    <Link
      href={href}
      className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200"
    >
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-gray-500 uppercase font-medium">
            {thesis.category.replace('_', ' ')}
          </div>
          <GenerationBadge method={thesis.generation_method} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
          {thesis.title}
        </h3>

        {/* Metadata */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{scoreLabel}:</span>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(displayScore)}`}>
              {displayScore}% {getScoreEmoji(displayScore)}
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
          {isActive ? (
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
          ) : (
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
          )}
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
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

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">
            {isActive ? 'Current Score:' : 'Final Score:'}
          </span>
          <span className="font-semibold text-gray-900">{displayScore}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getScoreColor(displayScore)}`}
            style={{ width: `${displayScore}%` }}
          />
        </div>
      </div>

      {/* Time remaining for active theses */}
      {isActive && daysRemaining !== null && daysRemaining > 0 && (
        <div className="text-center text-sm text-gray-500 pt-2 border-t border-gray-100">
          <Clock className="w-4 h-4 inline mr-1" />
          {daysRemaining} days left
        </div>
      )}

      {/* Status badge for closed theses */}
      {!isActive && (
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
      )}
    </Link>
  );
}
