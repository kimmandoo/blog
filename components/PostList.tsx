'use client';

import { Fragment, useState, useMemo, type ReactNode, type ComponentProps } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { TagBadge } from '@/components/TagBadge';
import { SearchBar } from '@/components/SearchBar';
import { formatDisplayDate, toMetadataDate } from '@/lib/date';
import type { PostData } from '@/lib/posts';
import { DEFAULT_POSTS_PER_PAGE, paginateItems, parsePageParam } from '@/lib/pagination';

interface PostListProps {
  initialPosts: PostData[];
  categories: { name: string; count: number }[];
  totalPosts: number;
  profile: ReactNode;
  graph: ReactNode;
  allTags: string[];
  postsPerPage?: number;
  basePath?: string; // Optional base path, defaults to '/posts'
}

type ArchiveSelection = {
  selectedCategory?: string;
  selectedTag?: string;
  currentPage: number;
  initialSearchQuery: string;
};

// These links change only the already-loaded archive, not its server components.
function ArchiveLink({ href, ...props }: Omit<ComponentProps<'a'>, 'onClick'> & { href: string }) {
  return <a {...props} href={href} onClick={event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
      || (event.currentTarget.target && event.currentTarget.target !== '_self') || event.currentTarget.hasAttribute('download')) return;
    event.preventDefault();
    if (`${window.location.pathname}${window.location.search}` !== href) {
      window.history.pushState(null, '', href);
    }
    document.querySelector('.archive-shell')?.scrollIntoView({ block: 'start' });
  }} />;
}

export function PostList(props: PostListProps) {
  const params = useSearchParams();
  return <PostListView
    {...props}
    key={params.toString()}
    selectedCategory={params.get('category')?.trim() || undefined}
    selectedTag={params.get('tag')?.trim() || undefined}
    currentPage={parsePageParam(params.get('page'))}
    initialSearchQuery={params.get('q')?.trim() || ''}
  />;
}


function PostListView({
  initialPosts, 
  categories,
  totalPosts,
  profile,
  graph,
  allTags,
  selectedCategory,
  selectedTag,
  currentPage = 1,
  initialSearchQuery = '',
  postsPerPage = DEFAULT_POSTS_PER_PAGE,
  basePath = '/posts'
}: PostListProps & ArchiveSelection) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const sectionPath = basePath === '/posts' ? '/' : basePath;

  const categoryPosts = useMemo(() => initialPosts.filter(post =>
    (!selectedCategory || post.category === selectedCategory)
    && (!selectedTag || post.tags?.includes(selectedTag))
  ), [initialPosts, selectedCategory, selectedTag]);

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return categoryPosts;
    return categoryPosts.filter(post =>
      post.title.toLowerCase().includes(query)
      || post.excerpt?.toLowerCase().includes(query)
      || post.category?.toLowerCase().includes(query)
      || post.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [categoryPosts, searchQuery]);

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
    ? `검색 결과 ${filteredPosts.length} / ${categoryPosts.length}개`
    : `전체 ${filteredPosts.length}개 글`;

  const createPageHref = (page: number, omit?: 'category' | 'tag', category = selectedCategory, tag = selectedTag) => {
    const params = new URLSearchParams();

    if (category && omit !== 'category') {
      params.set('category', category);
    }
    if (tag && omit !== 'tag') {
      params.set('tag', tag);
    }
    if (page > 1) {
      params.set('page', String(page));
    }
    if (hasSearchQuery) params.set('q', searchQuery.trim());

    const query = params.toString();
    return query ? `${sectionPath}?${query}` : sectionPath;
  };

  return (
    <div className="archive-layout">
      <main className="archive-shell">
      <h1 className="archive-title">{selectedCategory || '전체 글'}</h1>
      <section className="post-tools" aria-label="글 찾기">
        <div className="post-tools-heading">
          <h2 className="sr-only">글 목록</h2>
          <p aria-live="polite">{searchStatus}</p>
          <a className="mobile-category-link" href="#categories">카테고리 선택 <span aria-hidden="true">↓</span></a>
        </div>
        <SearchBar query={searchQuery} onSearch={setSearchQuery} />
        <div className="post-filters">
          {allTags.length > 0 && (
            <details className="taxonomy">
              <summary>태그 <span>{allTags.length}</span></summary>
              <div className="taxonomy-options">
                {allTags.map(tag => (
                  <ArchiveLink key={tag} href={createPageHref(1, undefined, selectedCategory, tag)} className="group">
                    <TagBadge tag={tag} clickable={false} />
                  </ArchiveLink>
                ))}
              </div>
            </details>
          )}
        </div>
        {hasActiveFilter && (
          <div className="active-filters">
            {selectedCategory && (
              <ArchiveLink href={createPageHref(1, 'category')} aria-label={`분류 ${selectedCategory} 필터 해제`}>
                {selectedCategory} <span aria-hidden="true">×</span>
              </ArchiveLink>
            )}
            {selectedTag && (
              <ArchiveLink href={createPageHref(1, 'tag')} aria-label={`태그 ${selectedTag} 필터 해제`}>
                #{selectedTag} <span aria-hidden="true">×</span>
              </ArchiveLink>
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
            <ArchiveLink href={sectionPath}>전체 글 보기</ArchiveLink>
          ) : null}
        </div>
      ) : (
        <div className="post-list">
          {pagination.items.map(post => (
            <article key={post.slug} className="post-row">
              <Link href={`${basePath}/${post.slug}`}>
                <h2>{post.title}</h2>
                {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
                <div className="post-meta">
                  <time dateTime={toMetadataDate(post.date) ?? post.date}>{formatDisplayDate(post.date)}</time>
                  {post.category && <span>{post.category}</span>}
                  {post.readingTime && <span>{post.readingTime}분</span>}
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <nav className="pagination" aria-label="글 목록 페이지">
          {pagination.hasPrevious ? (
            <ArchiveLink href={createPageHref(pagination.currentPage - 1)} aria-label="이전 페이지">←</ArchiveLink>
          ) : <span aria-disabled="true" aria-label="이전 페이지">←</span>}
          {visiblePages.map((page, index) => (
            <Fragment key={page}>
              {index > 0 && page - visiblePages[index - 1] > 1 && <span aria-hidden="true">…</span>}
              {page === pagination.currentPage ? (
                <span aria-current="page">{page}</span>
              ) : (
                <ArchiveLink href={createPageHref(page)} aria-label={`${page}페이지`}>{page}</ArchiveLink>
              )}
            </Fragment>
          ))}
          {pagination.hasNext ? (
            <ArchiveLink href={createPageHref(pagination.currentPage + 1)} aria-label="다음 페이지">→</ArchiveLink>
          ) : <span aria-disabled="true" aria-label="다음 페이지">→</span>}
        </nav>
      )}
      </main>
      <div className="archive-rail">
        {profile}
        <nav id="categories" className="category-panel" aria-labelledby="category-heading">
          <div className="category-panel-heading">
            <h2 id="category-heading">카테고리</h2>
            <span>{categories.length}</span>
          </div>
          <ul className="category-list">
            <li>
              <ArchiveLink href={createPageHref(1, 'category')} aria-current={!selectedCategory ? 'page' : undefined}>
                <span>전체 글</span><span className="category-count">{totalPosts}</span>
              </ArchiveLink>
            </li>
            {categories.map(({ name, count }) => (
              <li key={name}>
                <ArchiveLink href={createPageHref(1, undefined, name)} aria-current={selectedCategory === name ? 'page' : undefined}>
                  <span>{name}</span><span className="category-count">{count}</span>
                </ArchiveLink>
              </li>
            ))}
          </ul>
        </nav>
        {graph}
      </div>
    </div>
  );
}
