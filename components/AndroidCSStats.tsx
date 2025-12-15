'use client';

import { AndroidCSData } from '@/lib/androidcs';

interface AndroidCSStatsProps {
  items: AndroidCSData[];
}

export function AndroidCSStats({ items }: AndroidCSStatsProps) {
  const totalDocs = items.length;
  const totalCategories = new Set(items.map(item => item.category)).size;
  const totalTags = items.reduce((sum, item) => sum + (item.tags?.length || 0), 0);
  const totalReadingTime = items.reduce((sum, item) => sum + (item.readingTime || 0), 0);

  // Calculate percentages for visual representation (max value is 100%)
  const maxValue = Math.max(totalDocs, totalCategories, totalTags, totalReadingTime);
  const docsPercent = (totalDocs / maxValue) * 100;
  const categoriesPercent = (totalCategories / maxValue) * 100;
  const tagsPercent = (totalTags / maxValue) * 100;
  const readingPercent = (totalReadingTime / maxValue) * 100;

  const stats = [
    {
      label: '전체 문서',
      value: totalDocs,
      percent: docsPercent,
      color: 'bg-blue-500',
      lightBg: 'bg-blue-50',
      darkBg: 'bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      icon: (
        <svg className="w-5 h-5" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: '카테고리',
      value: totalCategories,
      percent: categoriesPercent,
      color: 'bg-green-500',
      lightBg: 'bg-green-50',
      darkBg: 'bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
      icon: (
        <svg className="w-5 h-5" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
    },
    {
      label: '태그',
      value: totalTags,
      percent: tagsPercent,
      color: 'bg-purple-500',
      lightBg: 'bg-purple-50',
      darkBg: 'bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      icon: (
        <svg className="w-5 h-5" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      label: '총 읽기 시간',
      value: `${totalReadingTime}분`,
      percent: readingPercent,
      color: 'bg-orange-500',
      lightBg: 'bg-orange-50',
      darkBg: 'bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400',
      icon: (
        <svg className="w-5 h-5" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative mt-6 p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          📊 콘텐츠 통계
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          전체 문서 현황을 한눈에 확인하세요
        </p>
      </div>

      {/* Stats Grid */}
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="group">
            {/* Label and Value */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`${stat.textColor}`}>
                  {stat.icon}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {stat.label}
                </span>
              </div>
              <span className={`text-lg font-bold ${stat.textColor}`}>
                {stat.value}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${stat.color} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${stat.percent}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-600">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            평균 읽기 시간
          </span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {totalDocs > 0 ? Math.round(totalReadingTime / totalDocs) : 0}분/문서
          </span>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
}
