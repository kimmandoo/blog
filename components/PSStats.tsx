'use client';

import { PSData } from '@/lib/ps';

interface PSStatsProps {
  items: PSData[];
}

export function PSStats({ items }: PSStatsProps) {
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

  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
  const maxCount = sortedTags.length > 0 ? sortedTags[0][1] : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
      {/* Total Problems */}
      <div className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-gray-900 border border-emerald-200/60 dark:border-emerald-800/40">
        <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
          <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{items.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">풀이 수</div>
        </div>
      </div>

      {/* Reading Time */}
      <div className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900 border border-blue-200/60 dark:border-blue-800/40">
        <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/40">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalReadingTime}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">총 읽기 시간(분)</div>
        </div>
      </div>

      {/* Tags Count */}
      <div className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-br from-violet-50 to-white dark:from-violet-900/20 dark:to-gray-900 border border-violet-200/60 dark:border-violet-800/40">
        <div className="p-2.5 rounded-lg bg-violet-100 dark:bg-violet-900/40">
          <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{sortedTags.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">태그 수</div>
        </div>
      </div>

      {/* Tag Distribution */}
      {sortedTags.length > 0 && (
        <div className="sm:col-span-3 p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">태그 분포</h4>
          <div className="space-y-2">
            {sortedTags.slice(0, 8).map(([tag, count]) => (
              <div key={tag} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-400 w-28 truncate">#{tag}</span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 dark:from-emerald-500 dark:to-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
