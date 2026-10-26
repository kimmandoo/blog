'use client';

import { Fragment, useState, useMemo } from 'react';
import Link from 'next/link';
import { CategoryBadge } from '@/components/CategoryBadge';
import { TagBadge } from '@/components/TagBadge';
import { SearchBar } from '@/components/SearchBar';
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
  initialSearchQuery?: string;
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
  initialSearchQuery = '',
  postsPerPage = DEFAULT_POSTS_PER_PAGE,
  basePath = '/posts'
}: PostListProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const sectionPath = basePath === '/posts' ? '/' : basePath;

  // Filter posts based on search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) {
      return initialPosts;
    }

    const query = searchQuery.trim().toLowerCase();
    return initialPosts.filter(post => {
      const titleMatch = post.title.toLowerCase().includes(query);
      const excerptMatch = post.excerpt?.toLowerCase().includes(query);
      const categoryMatch = post.category?.toLowerCase().includes(query);
      const tagsMatch = post.tags?.some(tag => tag.toLowerCase().includes(query));
      
      return titleMatch || excerptMatch || categoryMatch || tagsMatch;
    });
  }, [initialPosts, searchQuery]);

  const hasSearchQuery = searchQuery.trim().length > 0;
  const searchPage = searchQuery === initialSearchQuery ? currentPage : 1;
  const pagination = useMemo(
    () => paginateItems(filteredPosts, searchPage, postsPerPage),
    [filteredPosts, searchPage, postsPerPage]
  );
  const visiblePages = Array.from(
    new Set([1, pagination.currentPage - 1, pagination.currentPage, pagination.currentPage + 1, pagination.totalPages])
  ).filter(page => page >= 1 && page <= pagination.totalPages).sort((a, b) => a - b);
  const hasActiveFilter = Boolean(selectedCategory || selectedTag);
  const searchStatus = hasSearchQuery
    ? `검색 결과 ${filteredPosts.length} / ${initialPosts.length}개`
    : `전체 ${filteredPosts.length}개 글`;

  const createPageHref = (page: number, omit?: 'category' | 'tag') => {
    const params = new URLSearchParams();

    if (selectedCategory && omit !== 'category') {
      params.set('category', selectedCategory);
    }
    if (selectedTag && omit !== 'tag') {
      params.set('tag', selectedTag);
    }
    if (page > 1) {
      params.set('page', String(page));
    }
    if (hasSearchQuery) params.set('q', searchQuery.trim());

    const query = params.toString();
    return query ? `${sectionPath}?${query}` : sectionPath;
  };

  return (
    <>
      <section className="post-tools" aria-label="글 찾기">
        <div className="post-tools-heading">
          <h2>글</h2>
          <p aria-live="polite">{searchStatus}</p>
        </div>
        <SearchBar query={searchQuery} onSearch={setSearchQuery} />
        <div className="post-filters">
          {allCategories.length > 0 && (
            <details className="taxonomy">
              <summary>분류 <span>{allCategories.length}</span></summary>
              <div className="taxonomy-options">
                {allCategories.map(category => (
                  <CategoryBadge key={category} category={category} basePath={sectionPath} />
                ))}
              </div>
            </details>
          )}
          {allTags.length > 0 && (
            <details className="taxonomy">
              <summary>태그 <span>{allTags.length}</span></summary>
              <div className="taxonomy-options">
                {allTags.map(tag => <TagBadge key={tag} tag={tag} basePath={sectionPath} />)}
              </div>
            </details>
          )}
        </div>
        {hasActiveFilter && (
          <div className="active-filters">
            {selectedCategory && (
              <Link href={createPageHref(1, 'category')} aria-label={`분류 ${selectedCategory} 필터 해제`}>
                {selectedCategory} <span aria-hidden="true">×</span>
              </Link>
            )}
            {selectedTag && (
              <Link href={createPageHref(1, 'tag')} aria-label={`태그 ${selectedTag} 필터 해제`}>
                #{selectedTag} <span aria-hidden="true">×</span>
              </Link>
            )}
          </div>
        )}
      </section>

      {filteredPosts.length === 0 ? (
        <div className="empty-state">
          <p>{hasSearchQuery ? `"${searchQuery}"에 해당하는 글이 없습니다.` : '아직 표시할 글이 없습니다.'}</p>
          {hasSearchQuery ? (
            <button type="button" onClick={() => setSearchQuery('')}>검색 초기화</button>
          ) : hasActiveFilter ? (
            <Link href={sectionPath}>전체 글 보기</Link>
          ) : null}
        </div>
      ) : (
        <div className="post-list">
          {pagination.items.map(post => (
            <article key={post.slug} className="post-row">
              <Link href={`${basePath}/${post.slug}`}>
                <div className="post-meta">
                  <time dateTime={toMetadataDate(post.date) ?? post.date}>{formatDisplayDate(post.date)}</time>
                  {post.category && <span>{post.category}</span>}
                  {post.readingTime && <span>{post.readingTime}분</span>}
                </div>
                <h2>{post.title}</h2>
                {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
              </Link>
            </article>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <nav className="pagination" aria-label="글 목록 페이지">
          {pagination.hasPrevious ? (
            <Link href={createPageHref(pagination.currentPage - 1)} aria-label="이전 페이지">←</Link>
          ) : <span aria-disabled="true" aria-label="이전 페이지">←</span>}
          {visiblePages.map((page, index) => (
            <Fragment key={page}>
              {index > 0 && page - visiblePages[index - 1] > 1 && <span aria-hidden="true">…</span>}
              {page === pagination.currentPage ? (
                <span aria-current="page">{page}</span>
              ) : (
                <Link href={createPageHref(page)} aria-label={`${page}페이지`}>{page}</Link>
              )}
            </Fragment>
          ))}
          {pagination.hasNext ? (
            <Link href={createPageHref(pagination.currentPage + 1)} aria-label="다음 페이지">→</Link>
          ) : <span aria-disabled="true" aria-label="다음 페이지">→</span>}
        </nav>
      )}
    </>
  );
}
