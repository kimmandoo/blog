'use client';

import { AndroidCSData } from '@/lib/androidcs';

interface AndroidCSStatsProps {
  items: AndroidCSData[];
}

export function AndroidCSStats({ items }: AndroidCSStatsProps) {
  const totalReadingTime = items.reduce((sum, item) => sum + (item.readingTime || 0), 0);

  // Count posts per tag
  const tagCounts: Record<string, number> = {};
  items.forEach(item => {
    if (item.tags) {
      item.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  // Sort tags by count and get top tags
  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalTaggedPosts = Object.values(tagCounts).reduce((sum, count) => sum + count, 0);

  const colors = [
    { bg: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
    { bg: 'bg-green-500', text: 'text-green-600 dark:text-green-400' },
    { bg: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-400' },
    { bg: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400' },
    { bg: 'bg-pink-500', text: 'text-pink-600 dark:text-pink-400' },
  ];

  return (
    <div className="mt-6 p-5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between gap-6 flex-wrap">
        {/* Tag Distribution */}
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              태그별 문서 비율
            </h3>
          </div>
          <div className="space-y-2">
            {sortedTags.map(([tag, count], index) => {
              const percentage = totalTaggedPosts > 0 ? (count / totalTaggedPosts) * 100 : 0;
              return (
                <div key={tag}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">#{tag}</span>
                    <span className={`font-semibold ${colors[index].text}`}>{count}개 ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[index].bg} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reading Time */}
        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 min-w-[140px]">
          <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {totalReadingTime}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              총 읽기 시간(분)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
