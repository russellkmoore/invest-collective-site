import Link from 'next/link';
import { Clock, TrendingUp } from 'lucide-react';
import {
  getStatusColor,
  calculateDaysRemaining,
  calculateTimeProgress,
  type Thesis,
} from '@/lib/thesis-scoring';

interface ThesisCardProps {
  thesis: Thesis;
  href: string;
}

export default function ThesisCard({ thesis, href }: ThesisCardProps) {
  const tags = JSON.parse(thesis.tags) as string[];
  const isActive = thesis.status === 'active';
  const daysRemaining = isActive ? calculateDaysRemaining(thesis.prediction_end_date) : null;
  const timeProgress = isActive
    ? calculateTimeProgress(thesis.prediction_start_date, thesis.prediction_end_date)
    : null;

  const displayScore = isActive ? thesis.confidence_score : thesis.outcome_score || 0;
  const scoreLabel = isActive ? 'Confidence' : 'Final Score';

  return (
    <Link
      href={href}
      className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{thesis.title}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{thesis.hypothesis}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(displayScore)}`}>
          {displayScore}% {scoreLabel}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
          {thesis.category.replace('_', ' ').toUpperCase()}
        </span>
        {thesis.subcategory && (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
            {thesis.subcategory}
          </span>
        )}
        {tags.slice(0, 3).map((tag) => (
          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
            {tag}
          </span>
        ))}
        {tags.length > 3 && (
          <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded">
            +{tags.length - 3} more
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600">
        {isActive && daysRemaining !== null && timeProgress !== null ? (
          <>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>
                {daysRemaining} days remaining ({timeProgress}%)
              </span>
            </div>
            <div>Created: {new Date(thesis.created_at).toLocaleDateString()}</div>
          </>
        ) : (
          <>
            <div>Closed: {thesis.closed_at ? new Date(thesis.closed_at).toLocaleDateString() : 'N/A'}</div>
            <div>
              Duration:{' '}
              {Math.ceil(
                (new Date(thesis.prediction_end_date).getTime() -
                  new Date(thesis.prediction_start_date).getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{' '}
              days
            </div>
          </>
        )}
      </div>

      {/* Progress bar for active theses */}
      {isActive && timeProgress !== null && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${timeProgress}%` }}
            />
          </div>
        </div>
      )}
    </Link>
  );
}
