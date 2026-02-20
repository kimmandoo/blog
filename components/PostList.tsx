'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { CategoryBadge } from '@/components/CategoryBadge';
import { TagBadge } from '@/components/TagBadge';
import { SearchBar } from '@/components/SearchBar';
import { themeConfig } from '@/config/theme.config';
import { PostData } from '@/lib/posts';

interface PostListProps {
  initialPosts: PostData[];
  allCategories: string[];
  allTags: string[];
  selectedCategory?: string;
  selectedTag?: string;
  basePath?: string; // Optional base path, defaults to '/posts'
}

export function PostList({ 
  initialPosts, 
  allCategories, 
  allTags,
  selectedCategory,
  selectedTag,
  basePath = '/posts'
}: PostListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const sectionPath = basePath === '/posts' ? '/' : basePath;

  // Filter posts based on search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) {
      return initialPosts;
    }

    const query = searchQuery.toLowerCase();
    return initialPosts.filter(post => {
      const titleMatch = post.title.toLowerCase().includes(query);
      const excerptMatch = post.excerpt?.toLowerCase().includes(query);
      const categoryMatch = post.category?.toLowerCase().includes(query);
      const tagsMatch = post.tags?.some(tag => tag.toLowerCase().includes(query));
      
      return titleMatch || excerptMatch || categoryMatch || tagsMatch;
    });
  }, [initialPosts, searchQuery]);

  return (
    <>
      {/* Search Bar */}
      <div className="mb-5">
        <SearchBar onSearch={setSearchQuery} placeholder="검색..." />
      </div>

      {/* Filter Tags */}
      {(selectedCategory || selectedTag) && (
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <span className={`font-medium ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary}`}>
            {themeConfig.text.filter}
          </span>
          {selectedCategory && (
            <div className="flex items-center gap-2">
              <CategoryBadge 
                category={selectedCategory} 
                index={allCategories.indexOf(selectedCategory)} 
                clickable={false}
              />
              <Link 
                href={sectionPath}
                className={`text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ${themeConfig.animations.transition}`}
              >
                <svg className="w-5 h-5" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Link>
            </div>
          )}
          {selectedTag && (
            <div className="flex items-center gap-2">
              <TagBadge tag={selectedTag} clickable={false} />
              <Link 
                href={sectionPath}
                className={`text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ${themeConfig.animations.transition}`}
              >
                <svg className="w-5 h-5" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Categories and Tags Filter */}
      {(allCategories.length > 0 || allTags.length > 0) && (
        <div className="mb-6 space-y-2.5">
          {/* Categories Section */}
          {allCategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mr-1">
                {themeConfig.text.categories}
              </span>
              {allCategories.map((cat, index) => (
                <CategoryBadge key={cat} category={cat} index={index} size="sm" basePath={sectionPath} />
              ))}
            </div>
          )}
          
          {/* Tags Section */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mr-1">
                {themeConfig.text.tags}
              </span>
              {allTags.map((tag) => (
                <TagBadge key={tag} tag={tag} size="sm" basePath={sectionPath} />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              {searchQuery ? (
                <>
                  <p className={`${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} mb-6 ${themeConfig.typography.fontSize.body}`}>
                    &quot;{searchQuery}&quot;에 해당하는 글을 찾을 수 없습니다
                  </p>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className={`inline-flex items-center px-5 py-2.5 ${themeConfig.colors.light.accent.primary} ${themeConfig.colors.dark.accent.primary} ${themeConfig.borderRadius.button} font-medium ${themeConfig.animations.transition} hover:opacity-80`}
                  >
                    검색 초기화
                  </button>
                </>
              ) : selectedCategory || selectedTag ? (
                <>
                  <p className={`${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} mb-6 ${themeConfig.typography.fontSize.body}`}>
                    {themeConfig.text.noPostsFound}
                  </p>
                  <Link 
                    href={sectionPath}
                    className={`inline-flex items-center px-5 py-2.5 ${themeConfig.colors.light.accent.primary} ${themeConfig.colors.dark.accent.primary} ${themeConfig.borderRadius.button} font-medium ${themeConfig.animations.transition} hover:opacity-80`}
                  >
                    {themeConfig.text.viewAllPosts}
                  </Link>
                </>
              ) : (
                <>
                  <p className={`${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} mb-6 ${themeConfig.typography.fontSize.body}`}>
                    No posts yet. Add markdown files to the <code className={`px-2 py-0.5 ${themeConfig.colors.light.code.background} ${themeConfig.colors.dark.code.background} ${themeConfig.colors.light.code.text} ${themeConfig.colors.dark.code.text} rounded font-mono text-sm`}>posts/</code> directory.
                  </p>
                  <p className={`text-sm ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}>
                    Example: <code className={`px-2 py-0.5 ${themeConfig.colors.light.code.background} ${themeConfig.colors.dark.code.background} ${themeConfig.colors.light.code.text} ${themeConfig.colors.dark.code.text} rounded font-mono text-xs`}>posts/my-first-post.md</code>
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <article key={post.slug} className="group">
              <Link href={`${basePath}/${post.slug}`}>
                <div className="py-4 px-4 -mx-4 rounded-xl transition-all duration-200 hover:bg-gray-50 dark:hover:bg-white/[0.03] border border-transparent hover:border-gray-200/60 dark:hover:border-gray-800/60">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <time className={`text-xs font-medium ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}>
                          {format(new Date(post.date), 'yyyy.MM.dd')}
                        </time>
                        {post.readingTime && (
                          <span className={`text-xs ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}>
                            · {post.readingTime}분
                          </span>
                        )}
                        {post.category && (
                          <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                            {post.category}
                          </span>
                        )}
                      </div>
                      <h2 className={`text-base sm:text-lg font-semibold mb-1 ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200`}>
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className={`${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} text-sm leading-relaxed mb-2 overflow-hidden`} style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {post.excerpt}
                        </p>
                      )}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {post.tags.map((tag) => (
                            <span key={tag} className="text-xs text-gray-400 dark:text-gray-500">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Arrow indicator */}
                    <div className="hidden sm:flex items-center pt-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200">
                      <svg className="w-4 h-4 text-gray-400 dark:text-gray-600" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))
        )}
      </div>
    </>
  );
}
