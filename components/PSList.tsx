'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { SearchBar } from '@/components/SearchBar';
import { themeConfig } from '@/config/theme.config';
import { PSData } from '@/lib/ps';

interface PSListProps {
  items: PSData[];
}

export function PSList({ items }: PSListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }

    const query = searchQuery.toLowerCase();
    return items.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(query);
      const excerptMatch = item.excerpt?.toLowerCase()?.includes(query);
      const categoryMatch = item.category?.toLowerCase()?.includes(query);
      const tagsMatch = item.tags?.some(tag => tag.toLowerCase().includes(query));
      
      return titleMatch || excerptMatch || categoryMatch || tagsMatch;
    });
  }, [items, searchQuery]);

  // Group by tags for better organization
  const groupedItems = useMemo(() => {
    const groups: Record<string, PSData[]> = {};
    filteredItems.forEach(item => {
      const primaryTag = item.tags?.[0] || '기타';
      if (!groups[primaryTag]) {
        groups[primaryTag] = [];
      }
      groups[primaryTag].push(item);
    });
    return groups;
  }, [filteredItems]);

  return (
    <>
      {/* Search Bar */}
      <div className="mb-8">
        <SearchBar onSearch={setSearchQuery} placeholder="문제 검색..." />
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-16 px-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          {searchQuery ? (
            <>
              <p className={`${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} mb-6`}>
                &quot;{searchQuery}&quot;에 해당하는 문제를 찾을 수 없습니다
              </p>
              <button 
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center px-5 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-md font-medium transition-colors"
              >
                검색 초기화
              </button>
            </>
          ) : (
            <p className={`${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} mb-6`}>
              아직 작성된 문제가 없습니다. <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-mono text-sm">posts/ps/</code> 디렉토리에 마크다운 파일을 추가해주세요.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-semibold ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary}`}>
              📝 {searchQuery ? `검색 결과 (${filteredItems.length}개)` : `전체 문제 (${filteredItems.length}개)`}
            </h2>
          </div>

          {/* Grouped by primary tag */}
          {Object.entries(groupedItems).map(([tag, tagItems]) => (
            <div key={tag} className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <h3 className={`text-xl font-semibold ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary}`}>
                  {tag}
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                  {tagItems.length}개
                </span>
              </div>
              
              <div className="grid gap-3">
                {tagItems.map((item) => (
                  <Link 
                    key={item.slug} 
                    href={`/ps/${item.slug}`}
                    className="group block p-5 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-900"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-lg font-semibold ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors`}>
                          {item.title}
                        </h4>
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {format(new Date(item.date), 'yyyy.MM.dd')}
                          </span>
                          {item.readingTime && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {item.readingTime}분
                              </span>
                            </>
                          )}
                        </div>
                        
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {item.tags.map((t) => (
                              <span key={t} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-5 h-5 text-emerald-500" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
