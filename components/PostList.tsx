'use client';

import { Fragment, useState, useMemo } from 'react';
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

function getPostMonthLabel(post: PostData) {
  return formatDisplayDate(post.date, {
    dateFormat: 'yyyy.MM',
    dateTimeFormat: 'yyyy.MM',
    fallback: '',
  });
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
  const hasSearchQuery = searchQuery.trim().length > 0;
  const hasActiveFilter = Boolean(selectedCategory || selectedTag);
  const searchStatus = hasSearchQuery
    ? `검색 결과 ${filteredPosts.length} / ${initialPosts.length}개`
    : `전체 ${filteredPosts.length}개 글`;

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
      <section
        className="mb-7 space-y-4 border-b border-gray-200/70 pb-4 dark:border-gray-800/70"
        aria-label="글 찾기"
      >
        <SearchBar onSearch={setSearchQuery} placeholder="검색..." />
        <p className="mandoo-search-status text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
          {searchStatus}
        </p>

        {hasActiveFilter && (
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-semibold ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary}`}>
              {themeConfig.text.filter}
            </span>
            {selectedCategory && (
              <div className="mandoo-active-filter inline-flex items-center gap-1.5 rounded-full border border-rose-200/80 bg-rose-50/70 px-2.5 py-1 dark:border-rose-900/60 dark:bg-rose-950/25">
                <CategoryBadge category={selectedCategory} index={allCategories.indexOf(selectedCategory)} clickable={false} />
                <Link
                  href={sectionPath}
                  aria-label={`분류 ${selectedCategory} 필터 해제`}
                  className={`text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ${themeConfig.animations.transition}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Link>
              </div>
            )}
            {selectedTag && (
              <div className="mandoo-active-filter inline-flex items-center gap-1.5 rounded-full border border-rose-200/80 bg-rose-50/70 px-2.5 py-1 dark:border-rose-900/60 dark:bg-rose-950/25">
                <TagBadge tag={selectedTag} clickable={false} />
                <Link
                  href={sectionPath}
                  aria-label={`태그 ${selectedTag} 필터 해제`}
                  className={`text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ${themeConfig.animations.transition}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        )}

        {(allCategories.length > 0 || allTags.length > 0) && (
          <div className="space-y-3">
            {allCategories.length > 0 && (
              <details className="group/categories sm:contents">
                <summary className="mb-1 inline-flex cursor-pointer list-none items-center gap-1 rounded-md border border-gray-200/80 bg-white/70 px-2.5 py-1 text-xs font-semibold text-gray-500 transition-colors hover:border-rose-200 hover:bg-rose-50/70 hover:text-rose-700 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-400 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/30 dark:hover:text-rose-200 sm:hidden [&::-webkit-details-marker]:hidden">
                  분류 보기 ({allCategories.length})
                </summary>
                <div className="mandoo-details-panel hidden flex-wrap items-center gap-1.5 group-open/categories:flex sm:flex">
                  <span className="mr-1 hidden shrink-0 text-xs font-semibold text-gray-500 dark:text-gray-400 sm:inline">
                    {themeConfig.text.categories}
                  </span>
                  {allCategories.map((cat, index) => (
                    <CategoryBadge key={cat} category={cat} index={index} size="sm" basePath={sectionPath} />
                  ))}
                </div>
              </details>
            )}

            {allTags.length > 0 && (
              <details className="group/tags sm:contents">
                <summary className="mb-1 inline-flex cursor-pointer list-none items-center gap-1 rounded-md border border-gray-200/80 bg-white/70 px-2.5 py-1 text-xs font-semibold text-gray-500 transition-colors hover:border-rose-200 hover:bg-rose-50/70 hover:text-rose-700 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-400 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/30 dark:hover:text-rose-200 sm:hidden [&::-webkit-details-marker]:hidden">
                  태그 보기 ({allTags.length})
                </summary>
                <div className="mandoo-details-panel hidden flex-wrap items-center gap-1 group-open/tags:flex sm:flex">
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
      </section>

      {filteredPosts.length === 0 ? (
        <div className="mandoo-empty-state py-14 text-center">
            <div className="max-w-md mx-auto rounded-lg border border-gray-200/70 bg-white/60 px-5 py-8 dark:border-gray-800 dark:bg-gray-900/40">
              <div className="mandoo-empty-state__icon mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-950/30 dark:text-rose-300" aria-hidden="true">
                <svg className="h-5 w-5" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
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
        <div className="mandoo-post-list relative space-y-1 pl-4 sm:pl-5">
          {pagination.items.map((post, index) => {
            const monthLabel = getPostMonthLabel(post);
            const previousMonthLabel = index > 0 ? getPostMonthLabel(pagination.items[index - 1]) : '';
            const showMonthDivider = monthLabel && monthLabel !== previousMonthLabel;

            return (
              <Fragment key={post.slug}>
                {showMonthDivider && (
                  <div className="mandoo-month-divider -ml-4 mb-2 mt-6 flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 sm:-ml-5">
                    <span className="h-2 w-2 rounded-full bg-rose-300 dark:bg-rose-400" aria-hidden="true" />
                    <span>{monthLabel}</span>
                  </div>
                )}
                <article className="group relative">
                  <Link href={`${basePath}/${post.slug}`}>
                    <div className="mandoo-post-card py-4 pl-4 pr-3 -mx-3 rounded-lg transition-all duration-200 border border-transparent sm:py-5 sm:pl-5">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
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
                          </div>
                          {post.category && (
                            <span className="mandoo-post-category mb-1.5 inline-flex w-fit items-center rounded-full border border-rose-200/80 bg-rose-50/80 px-2 py-0.5 text-xs font-semibold text-rose-700 transition-colors duration-200 group-hover:border-rose-200 group-hover:bg-rose-100/80 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200 dark:group-hover:border-rose-800 dark:group-hover:bg-rose-950/45">
                              {post.category}
                            </span>
                          )}
                          <h2
                            className="break-words text-base sm:text-xl font-bold mb-1 leading-snug text-gray-950 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors duration-200"
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
              </Fragment>
            );
          })}
        </div>
      )}

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
                className="mandoo-page-control inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors hover:border-rose-200 hover:bg-rose-50/70 hover:text-rose-700 dark:border-gray-800 dark:text-gray-400 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/25 dark:hover:text-rose-200"
                aria-label="이전 페이지"
              >
                <svg className="h-4 w-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            ) : (
              <span
                className="mandoo-page-control inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-100 text-gray-300 dark:border-gray-900 dark:text-gray-700"
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
                  className="mandoo-page-control inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-rose-500 bg-rose-600 px-3 text-sm font-semibold text-white dark:border-rose-300 dark:bg-rose-300 dark:text-gray-950"
                  aria-current="page"
                >
                  {page}
                </span>
              ) : (
                <Link
                  key={page}
                  href={createPageHref(page)}
                  className="mandoo-page-control inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-gray-200 px-3 text-sm font-medium text-gray-600 transition-colors hover:border-rose-200 hover:bg-rose-50/70 hover:text-rose-700 dark:border-gray-800 dark:text-gray-300 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/25 dark:hover:text-rose-200"
                >
                  {page}
                </Link>
              );
            })}

            {pagination.hasNext ? (
              <Link
                href={createPageHref(pagination.currentPage + 1)}
                className="mandoo-page-control inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors hover:border-rose-200 hover:bg-rose-50/70 hover:text-rose-700 dark:border-gray-800 dark:text-gray-400 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/25 dark:hover:text-rose-200"
                aria-label="다음 페이지"
              >
                <svg className="h-4 w-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <span
                className="mandoo-page-control inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-100 text-gray-300 dark:border-gray-900 dark:text-gray-700"
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
