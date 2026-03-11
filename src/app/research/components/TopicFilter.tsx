'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { X, Filter } from 'lucide-react';

interface TopicFilterProps {
  allTopics: string[];
}

export function TopicFilter({ allTopics }: TopicFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTopic = searchParams.get('topic');

  const handleTopicClick = (topic: string) => {
    if (selectedTopic === topic) {
      // If clicking the same topic, clear the filter
      router.push('/research');
    } else {
      // Track topic filter usage
      fetch('/api/v1/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: 'topic_filter', topic }),
      }).catch(() => {
        // Silently fail
      });

      // Set the new topic filter
      router.push(`/research?topic=${encodeURIComponent(topic)}`);
    }
  };

  const clearFilter = () => {
    router.push('/research');
  };

  if (allTopics.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filter by Topic</h2>
        </div>
        {selectedTopic && (
          <button
            onClick={clearFilter}
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
          >
            <X className="w-4 h-4" />
            Clear Filter
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {allTopics.map((topic) => {
          const isSelected = selectedTopic === topic;
          return (
            <button
              key={topic}
              onClick={() => handleTopicClick(topic)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {topic}
            </button>
          );
        })}
      </div>

      {selectedTopic && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing articles tagged with <span className="font-semibold text-gray-900">{selectedTopic}</span>
          </p>
        </div>
      )}
    </div>
  );
}
