'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { CategoryBadge } from '@/components/CategoryBadge';
import { TagBadge } from '@/components/TagBadge';
import { SearchBar } from '@/components/SearchBar';
import { themeConfig } from '@/config/theme.config';
import { formatDisplayDate, toMetadataDate } from '@/lib/date';
import { PostData } from '@/lib/posts';
import { DEFAULT_POSTS_PER_PAGE, paginateItems } from '@/lib/pagination';

interface PostListProps {
  initialPosts: PostData[];
  allCategories: string[];
  allTags: string[];
  selectedCategory?: string;
  selectedTag?: string;
  currentPage?: number;
  postsPerPage?: number;
  basePath?: string; // Optional base path, defaults to '/posts'
}

export function PostList({ 
  initialPosts, 
  allCategories, 
  allTags,
  selectedCategory,
  selectedTag,
  currentPage = 1,
  postsPerPage = DEFAULT_POSTS_PER_PAGE,
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

  const pagination = useMemo(
    () => paginateItems(filteredPosts, currentPage, postsPerPage),
    [filteredPosts, currentPage, postsPerPage]
  );

  const createPageHref = (page: number) => {
    const params = new URLSearchParams();

    if (selectedCategory) {
      params.set('category', selectedCategory);
    }
    if (selectedTag) {
      params.set('tag', selectedTag);
    }
    if (page > 1) {
      params.set('page', String(page));
    }

    const query = params.toString();
    return query ? `${sectionPath}?${query}` : sectionPath;
  };

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
        <div className="mb-6 space-y-3 border-b border-gray-200/70 pb-4 dark:border-gray-800/70">
          {/* Categories Section */}
          {allCategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 shrink-0 text-xs font-semibold text-gray-500 dark:text-gray-400">
                {themeConfig.text.categories}
              </span>
              {allCategories.map((cat, index) => (
                <CategoryBadge key={cat} category={cat} index={index} size="sm" basePath={sectionPath} />
              ))}
            </div>
          )}
          
          {/* Tags Section */}
          {allTags.length > 0 && (
            <details className="group/tags sm:contents">
              <summary className="mb-1 inline-flex cursor-pointer list-none items-center gap-1 rounded-md border border-gray-200/80 bg-white/70 px-2.5 py-1 text-xs font-semibold text-gray-500 transition-colors hover:border-rose-200 hover:bg-rose-50/70 hover:text-rose-700 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-400 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/30 dark:hover:text-rose-200 sm:hidden [&::-webkit-details-marker]:hidden">
                태그 보기 ({allTags.length})
              </summary>
              <div className="hidden flex-wrap items-center gap-1 group-open/tags:flex sm:flex">
                <span className="mr-1 hidden shrink-0 text-xs font-semibold text-gray-500 dark:text-gray-400 sm:inline">
                  {themeConfig.text.tags}
                </span>
                {allTags.map((tag) => (
                  <TagBadge key={tag} tag={tag} size="sm" basePath={sectionPath} />
                ))}
              </div>
            </details>
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
          pagination.items.map((post) => (
            <article key={post.slug} className="group">
              <Link href={`${basePath}/${post.slug}`}>
                <div className="mandoo-post-card py-4 px-4 -mx-4 rounded-xl transition-all duration-200 border border-transparent">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <time
                          dateTime={toMetadataDate(post.date) ?? post.date}
                          className="text-xs font-normal text-gray-400 dark:text-gray-500"
                        >
                          {formatDisplayDate(post.date)}
                        </time>
                        {post.readingTime && (
                          <span className="text-xs font-normal text-gray-400 dark:text-gray-500">
                            · {post.readingTime}분
                          </span>
                        )}
                        {post.category && (
                          <span className="text-xs px-2 py-0.5 rounded-full border border-gray-200/80 bg-gray-50/80 text-gray-500 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400 font-medium transition-colors duration-200 group-hover:border-rose-200 group-hover:bg-rose-50/70 group-hover:text-rose-700 dark:group-hover:border-rose-900/60 dark:group-hover:bg-rose-950/25 dark:group-hover:text-rose-200">
                            {post.category}
                          </span>
                        )}
                      </div>
                      <h2
                        className="break-words text-lg sm:text-xl font-bold mb-1 text-gray-950 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors duration-200"
                        style={{ overflowWrap: 'anywhere' }}
                      >
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

      {pagination.totalPages > 1 && (
        <nav
          className="mt-8 flex flex-col items-center gap-3 border-t border-gray-200/70 pt-5 dark:border-gray-800/70"
          aria-label="글 목록 페이지"
        >
          <p className={`text-xs ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}>
            {pagination.currentPage} / {pagination.totalPages}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {pagination.hasPrevious ? (
              <Link
                href={createPageHref(pagination.currentPage - 1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors hover:border-rose-200 hover:bg-rose-50/70 hover:text-rose-700 dark:border-gray-800 dark:text-gray-400 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/25 dark:hover:text-rose-200"
                aria-label="이전 페이지"
              >
                <svg className="h-4 w-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            ) : (
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-100 text-gray-300 dark:border-gray-900 dark:text-gray-700"
                aria-disabled="true"
                aria-label="이전 페이지"
              >
                <svg className="h-4 w-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </span>
            )}

            {Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map((page) => {
              const isCurrent = page === pagination.currentPage;

              return isCurrent ? (
                <span
                  key={page}
                  className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-rose-500 bg-rose-600 px-3 text-sm font-semibold text-white dark:border-rose-300 dark:bg-rose-300 dark:text-gray-950"
                  aria-current="page"
                >
                  {page}
                </span>
              ) : (
                <Link
                  key={page}
                  href={createPageHref(page)}
                  className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-gray-200 px-3 text-sm font-medium text-gray-600 transition-colors hover:border-rose-200 hover:bg-rose-50/70 hover:text-rose-700 dark:border-gray-800 dark:text-gray-300 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/25 dark:hover:text-rose-200"
                >
                  {page}
                </Link>
              );
            })}

            {pagination.hasNext ? (
              <Link
                href={createPageHref(pagination.currentPage + 1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors hover:border-rose-200 hover:bg-rose-50/70 hover:text-rose-700 dark:border-gray-800 dark:text-gray-400 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/25 dark:hover:text-rose-200"
                aria-label="다음 페이지"
              >
                <svg className="h-4 w-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-100 text-gray-300 dark:border-gray-900 dark:text-gray-700"
                aria-disabled="true"
                aria-label="다음 페이지"
              >
                <svg className="h-4 w-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </span>
            )}
          </div>
        </nav>
      )}
    </>
  );
}
