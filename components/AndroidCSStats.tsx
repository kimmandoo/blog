'use client';

import { AndroidCSData } from '@/lib/androidcs';
import { useState } from 'react';

interface AndroidCSStatsProps {
  items: AndroidCSData[];
}

export function AndroidCSStats({ items }: AndroidCSStatsProps) {
  const [hoveredSegment, setHoveredSegment] = useState<{ tag: string; count: number; percentage: number } | null>(null);
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

  // Sort all tags by count
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
  const totalTaggedPosts = Object.values(tagCounts).reduce((sum, count) => sum + count, 0);

  // Extended color palette for all tags
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#A855F7', // purple
    '#F59E0B', // orange
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F43F5E', // rose
    '#8B5CF6', // violet
    '#06B6D4', // cyan
    '#EAB308', // yellow
    '#6366F1', // indigo
    '#84CC16', // lime
  ];

  // Create pie chart segments
  const segments = sortedTags.map(([tag, count], index) => {
    const percentage = totalTaggedPosts > 0 ? (count / totalTaggedPosts) * 100 : 0;
    const color = colors[index % colors.length];
    return { tag, count, percentage, color };
  });

  // Calculate cumulative percentages for pie chart using reduce
  const pieSegments = segments.reduce((acc, segment) => {
    const startPercentage = acc.length > 0 
      ? acc[acc.length - 1].startPercentage + acc[acc.length - 1].percentage
      : 0;
    acc.push({ ...segment, startPercentage });
    return acc;
  }, [] as Array<{ tag: string; count: number; percentage: number; color: string; startPercentage: number }>);

  return (
    <div className="mt-6 p-5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between gap-8 flex-wrap">
        {/* Pie Chart */}
        <div className="flex-1 min-w-[280px]">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              태그별 문서 비율
            </h3>
          </div>
          
          <div className="flex items-center justify-center relative">
            {/* Pie Chart SVG */}
            <svg viewBox="0 0 200 200" className="w-52 h-52">
              {pieSegments.map((segment, index) => {
                const startAngle = (segment.startPercentage / 100) * 360 - 90;
                const endAngle = ((segment.startPercentage + segment.percentage) / 100) * 360 - 90;
                
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;
                
                const x1 = 100 + 90 * Math.cos(startRad);
                const y1 = 100 + 90 * Math.sin(startRad);
                const x2 = 100 + 90 * Math.cos(endRad);
                const y2 = 100 + 90 * Math.sin(endRad);
                
                const largeArc = segment.percentage > 50 ? 1 : 0;
                
                return (
                  <path
                    key={index}
                    d={`M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={segment.color}
                    opacity="0.85"
                    className="hover:opacity-100 transition-opacity cursor-pointer"
                    onMouseEnter={() => setHoveredSegment({ tag: segment.tag, count: segment.count, percentage: segment.percentage })}
                    onMouseLeave={() => setHoveredSegment(null)}
                  />
                );
              })}
            </svg>

            {/* Tooltip */}
            {hoveredSegment && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-3 rounded-lg shadow-lg text-center min-w-[160px]">
                  <div className="font-semibold text-sm mb-1">#{hoveredSegment.tag}</div>
                  <div className="text-xs">
                    {hoveredSegment.count}개 ({hoveredSegment.percentage.toFixed(1)}%)
                  </div>
                </div>
              </div>
            )}
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
