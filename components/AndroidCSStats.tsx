'use client';

import { AndroidCSData } from '@/lib/androidcs';
import { useState } from 'react';

interface AndroidCSStatsProps {
  items: AndroidCSData[];
}

export function AndroidCSStats({ items }: AndroidCSStatsProps) {
  const [hoveredSegment, setHoveredSegment] = useState<{ tag: string; count: number; percentage: number; color: string } | null>(null);
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

  // Extended color palette with vibrant colors
  const colors = [
    { solid: '#3B82F6', gradient: ['#3B82F6', '#2563EB'] }, // blue
    { solid: '#10B981', gradient: ['#10B981', '#059669'] }, // green
    { solid: '#A855F7', gradient: ['#A855F7', '#9333EA'] }, // purple
    { solid: '#F59E0B', gradient: ['#F59E0B', '#D97706'] }, // orange
    { solid: '#EC4899', gradient: ['#EC4899', '#DB2777'] }, // pink
    { solid: '#14B8A6', gradient: ['#14B8A6', '#0D9488'] }, // teal
    { solid: '#F43F5E', gradient: ['#F43F5E', '#E11D48'] }, // rose
    { solid: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'] }, // violet
    { solid: '#06B6D4', gradient: ['#06B6D4', '#0891B2'] }, // cyan
    { solid: '#EAB308', gradient: ['#EAB308', '#CA8A04'] }, // yellow
    { solid: '#6366F1', gradient: ['#6366F1', '#4F46E5'] }, // indigo
    { solid: '#84CC16', gradient: ['#84CC16', '#65A30D'] }, // lime
  ];

  // Create pie chart segments
  const segments = sortedTags.map(([tag, count], index) => {
    const percentage = totalTaggedPosts > 0 ? (count / totalTaggedPosts) * 100 : 0;
    const colorPair = colors[index % colors.length];
    return { tag, count, percentage, color: colorPair.solid, gradient: colorPair.gradient };
  });

  // Calculate cumulative percentages for pie chart using reduce
  const pieSegments = segments.reduce((acc, segment) => {
    const startPercentage = acc.length > 0 
      ? acc[acc.length - 1].startPercentage + acc[acc.length - 1].percentage
      : 0;
    acc.push({ ...segment, startPercentage });
    return acc;
  }, [] as Array<{ tag: string; count: number; percentage: number; color: string; gradient: string[]; startPercentage: number }>);

  return (
    <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between gap-8 flex-wrap">
        {/* Pie Chart */}
        <div className="flex-1 min-w-[280px]">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
              <svg className="w-4 h-4 text-white" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              태그별 문서 비율
            </h3>
          </div>
          
          <div className="flex items-center justify-center relative">
            {/* Background glow effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-56 h-56 rounded-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 blur-2xl opacity-50"></div>
            </div>

            {/* Pie Chart SVG */}
            <svg viewBox="0 0 220 220" className="w-64 h-64 relative" style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}>
              <defs>
                {pieSegments.map((segment, index) => (
                  <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={segment.gradient[0]} />
                    <stop offset="100%" stopColor={segment.gradient[1]} />
                  </linearGradient>
                ))}
              </defs>
              
              {/* Donut chart segments */}
              {pieSegments.map((segment, index) => {
                const startAngle = (segment.startPercentage / 100) * 360 - 90;
                const endAngle = ((segment.startPercentage + segment.percentage) / 100) * 360 - 90;
                
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;
                
                // Outer arc
                const x1 = 110 + 95 * Math.cos(startRad);
                const y1 = 110 + 95 * Math.sin(startRad);
                const x2 = 110 + 95 * Math.cos(endRad);
                const y2 = 110 + 95 * Math.sin(endRad);
                
                // Inner arc (for donut hole)
                const x3 = 110 + 50 * Math.cos(endRad);
                const y3 = 110 + 50 * Math.sin(endRad);
                const x4 = 110 + 50 * Math.cos(startRad);
                const y4 = 110 + 50 * Math.sin(startRad);
                
                const largeArc = segment.percentage > 50 ? 1 : 0;
                
                const isHovered = hoveredSegment?.tag === segment.tag;
                
                return (
                  <g key={index}>
                    <path
                      d={`M ${x1} ${y1} A 95 95 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A 50 50 0 ${largeArc} 0 ${x4} ${y4} Z`}
                      fill={`url(#gradient-${index})`}
                      opacity={isHovered ? 1 : 0.9}
                      className="transition-all duration-300 cursor-pointer"
                      style={{
                        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                        transformOrigin: '110px 110px',
                      }}
                      onMouseEnter={() => setHoveredSegment({ tag: segment.tag, count: segment.count, percentage: segment.percentage, color: segment.color })}
                      onMouseLeave={() => setHoveredSegment(null)}
                    />
                  </g>
                );
              })}
              
              {/* Center circle for donut effect */}
              <circle cx="110" cy="110" r="48" fill="white" className="dark:fill-gray-900" />
              <circle cx="110" cy="110" r="48" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="2" className="dark:stroke-white/5" />
            </svg>

            {/* Tooltip */}
            {hoveredSegment && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-in fade-in zoom-in duration-200">
                <div className="relative">
                  <div 
                    className="px-5 py-4 rounded-xl shadow-2xl text-center min-w-[180px] backdrop-blur-sm border-2"
                    style={{ 
                      backgroundColor: hoveredSegment.color + 'F0',
                      borderColor: hoveredSegment.color,
                    }}
                  >
                    <div className="font-bold text-base mb-1 text-white drop-shadow-md">
                      #{hoveredSegment.tag}
                    </div>
                    <div className="text-sm text-white/90 font-medium">
                      {hoveredSegment.count}개 문서
                    </div>
                    <div className="text-lg font-bold text-white mt-1">
                      {hoveredSegment.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reading Time */}
        <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm min-w-[160px] hover:shadow-md transition-shadow">
          <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
            <svg className="w-7 h-7 text-gray-600 dark:text-gray-400" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {totalReadingTime}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              총 읽기 시간(분)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
