'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { SearchBar } from '@/components/SearchBar';
import { themeConfig } from '@/config/theme.config';
import { AndroidCSData } from '@/lib/androidcs';

interface AndroidCSListProps {
  items: AndroidCSData[];
}

export function AndroidCSList({ items }: AndroidCSListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }

    const query = searchQuery.toLowerCase();
    return items.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(query);
      const excerptMatch = item.excerpt?.toLowerCase().includes(query);
      const categoryMatch = item.category?.toLowerCase().includes(query);
      const tagsMatch = item.tags?.some(tag => tag.toLowerCase().includes(query));
      
      return titleMatch || excerptMatch || categoryMatch || tagsMatch;
    });
  }, [items, searchQuery]);

  return (
    <>
      {/* Search Bar */}
      <div className="mb-8">
        <SearchBar onSearch={setSearchQuery} placeholder="Search by title, excerpt, category, or tags..." />
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-16 px-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          {searchQuery ? (
            <>
              <p className={`${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} mb-6`}>
                No documents found matching &quot;{searchQuery}&quot;
              </p>
              <button 
                onClick={() => setSearchQuery('')}
                className={`inline-flex items-center px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md font-medium transition-colors`}
              >
                Clear Search
              </button>
            </>
          ) : (
            <p className={`${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} mb-6`}>
              아직 작성된 문서가 없습니다. <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-mono text-sm">android-cs/</code> 디렉토리에 마크다운 파일을 추가해주세요.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <h2 className={`text-2xl font-semibold ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} mb-6`}>
            📚 {searchQuery ? `검색 결과 (${filteredItems.length}개)` : '전체 문서'}
          </h2>
          <div className="grid gap-4">
            {filteredItems.map((item) => (
              <Link 
                key={item.slug} 
                href={`/androidcs/${item.slug}`}
                className="group block p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-900"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-xl font-semibold ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>
                      {item.title}
                    </h3>
                    {item.excerpt && (
                      <p className={`text-sm ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} line-clamp-2`}>
                        {item.excerpt}
                      </p>
                    )}
                    {(item.category || (item.tags && item.tags.length > 0)) && (
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {item.category && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            {item.category}
                          </span>
                        )}
                        {item.tags && item.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-blue-500" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
