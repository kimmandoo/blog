'use client';

import { Fragment, Suspense, useEffect, useRef, useMemo, useSyncExternalStore, type ReactNode, type ComponentProps } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { TagBadge } from '@/components/TagBadge';
import { SearchBar } from '@/components/SearchBar';
import { formatDisplayDate, toMetadataDate } from '@/lib/date';
import type { PostData } from '@/lib/posts';
import { DEFAULT_POSTS_PER_PAGE, paginateItems, parsePageParam } from '@/lib/pagination';
import { getPsArchive, getPsArchiveHref, getPsLanguageLabel } from '@/lib/ps';

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


// These links change only the already-loaded archive, not its server components.
function ArchiveLink({
  href,
  scrollToResults = false,
  focusSearch = false,
  ...props
}: Omit<ComponentProps<'a'>, 'onClick'> & { href: string; scrollToResults?: boolean; focusSearch?: boolean }) {
  return <a {...props} href={href} onClick={event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
      || (event.currentTarget.target && event.currentTarget.target !== '_self') || event.currentTarget.hasAttribute('download')) return;
    event.preventDefault();
    navigateArchive(href);
    if (scrollToResults) {
      const main = event.currentTarget.closest('main');
      main?.focus({ preventScroll: true });
      main?.scrollIntoView({ block: 'start' });
    } else if (focusSearch) {
      event.currentTarget.closest('main')?.querySelector<HTMLInputElement>('input[type="search"]')?.focus({ preventScroll: true });
    }
  }} />;
}

function navigateArchive(href: string, method: 'pushState' | 'replaceState' = 'pushState') {
  if (`${window.location.pathname}${window.location.search}` !== href) {
    window.history[method](null, '', href);
    window.dispatchEvent(new Event('archive:navigate'));
  }
}

function subscribeArchive(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  window.addEventListener('archive:navigate', onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener('archive:navigate', onChange);
  };
}

// The archive is a static file, so the query only exists in the browser. This
// re-reads it after Next <Link> navigations (e.g. a tag badge pointing at /?tag=x).
// It sits in its own Suspense boundary so the post list itself stays prerendered.
function ArchiveRouterSync() {
  const routerParams = useSearchParams();
  useEffect(() => {
    window.dispatchEvent(new Event('archive:navigate'));
  }, [routerParams]);
  return null;
}

function ArchiveSearchSync() {
  return <Suspense fallback={null}><ArchiveRouterSync /></Suspense>;
}

function useArchiveSearch(sectionPath: string) {
  // Read the URL synchronously so a quick filter change cannot resurrect a
  // query that was just cleared. The prerendered HTML is the unfiltered list.
  const search = useSyncExternalStore(
    subscribeArchive,
    () => window.location.search,
    () => '',
  );
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const searchSession = useRef<string | null>(null);
  const searchQuery = params.get('q') ?? '';
  const endSearch = () => { searchSession.current = null; };
  const updateSearch = (query: string) => {
    const nextParams = new URLSearchParams(window.location.search);
    if (query.trim()) nextParams.set('q', query);
    else nextParams.delete('q');
    nextParams.delete('page');
    const suffix = nextParams.toString();
    const href = suffix ? `${sectionPath}?${suffix}` : sectionPath;
    const currentHref = `${window.location.pathname}${window.location.search}`;
    if (href === currentHref) return;
    // Keep the state before typing, but do not create a Back entry per keystroke.
    const method = searchSession.current === currentHref ? 'replaceState' : 'pushState';
    navigateArchive(href, method);
    searchSession.current = href;
  };
  return { params, searchQuery, updateSearch, endSearch };
}

export function PostList({
  initialPosts, 
  categories,
  totalPosts,
  profile,
  graph,
  allTags,
  postsPerPage = DEFAULT_POSTS_PER_PAGE,
  basePath = '/posts'
}: PostListProps) {
  const sectionPath = basePath === '/posts' ? '/' : basePath;
  const { params, searchQuery, updateSearch, endSearch } = useArchiveSearch(sectionPath);
  const selectedCategory = params.get('category')?.trim() || undefined;
  const selectedTag = params.get('tag')?.trim() || undefined;
  const currentPage = parsePageParam(params.get('page'));

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
  const pagination = useMemo(
    () => paginateItems(filteredPosts, currentPage, postsPerPage),
    [filteredPosts, currentPage, postsPerPage]
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
    if (hasSearchQuery) params.set('q', searchQuery);

    const query = params.toString();
    return query ? `${sectionPath}?${query}` : sectionPath;
  };

  return (
    <div className="archive-layout">
      <ArchiveSearchSync />
      <main id="main-content" className="archive-shell" tabIndex={-1}>
      <h1 className="archive-title">{selectedCategory || '전체 글'}</h1>
      <section className="post-tools" aria-label="글 찾기">
        <div className="post-tools-heading">
          <h2 className="sr-only">글 목록</h2>
          <p id="archive-results-status" role="status" aria-atomic="true">{searchStatus}</p>
          <label className="mobile-archive-selector">
            <span>카테고리</span>
            <select
              value={selectedCategory ?? ''}
              onChange={event => navigateArchive(createPageHref(1, undefined, event.target.value))}
            >
              <option value="">전체 글 ({totalPosts})</option>
              {selectedCategory && !categories.some(category => category.name === selectedCategory) && (
                <option value={selectedCategory}>{selectedCategory}</option>
              )}
              {categories.map(({ name, count }) => (
                <option key={name} value={name}>{name} ({count})</option>
              ))}
            </select>
          </label>
        </div>
        <SearchBar query={searchQuery} onSearch={updateSearch} onSearchEnd={endSearch} statusId="archive-results-status" />
        <div className="post-filters">
          {allTags.length > 0 && (
            <details className="taxonomy">
              <summary>태그 <span>{allTags.length}</span></summary>
              <div className="taxonomy-options">
                {allTags.map(tag => (
                  <ArchiveLink key={tag} href={createPageHref(1, undefined, selectedCategory, tag)} className="group" aria-current={selectedTag === tag ? 'true' : undefined}>
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
              <ArchiveLink focusSearch href={createPageHref(1, 'category')} aria-label={`분류 ${selectedCategory} 필터 해제`}>
                {selectedCategory} <span aria-hidden="true">×</span>
              </ArchiveLink>
            )}
            {selectedTag && (
              <ArchiveLink focusSearch href={createPageHref(1, 'tag')} aria-label={`태그 ${selectedTag} 필터 해제`}>
                #{selectedTag} <span aria-hidden="true">×</span>
              </ArchiveLink>
            )}
            <ArchiveLink focusSearch href={sectionPath}>모든 조건 초기화</ArchiveLink>
          </div>
        )}
      </section>

      {filteredPosts.length === 0 ? (
        <div className="empty-state">
          <p>{hasSearchQuery ? `"${searchQuery}"에 해당하는 글이 없습니다.` : '아직 표시할 글이 없습니다.'}</p>
          {hasSearchQuery && (
            <button type="button" onClick={() => {
              updateSearch('');
              document.getElementById('archive-search')?.focus();
            }}>검색 초기화</button>
          )}
          {hasActiveFilter && <ArchiveLink focusSearch href={sectionPath}>모든 조건 초기화</ArchiveLink>}
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
            <ArchiveLink scrollToResults href={createPageHref(pagination.currentPage - 1)} aria-label="이전 페이지">←</ArchiveLink>
          ) : <span aria-disabled="true" aria-label="이전 페이지">←</span>}
          {visiblePages.map((page, index) => (
            <Fragment key={page}>
              {index > 0 && page - visiblePages[index - 1] > 1 && <span aria-hidden="true">…</span>}
              {page === pagination.currentPage ? (
                <span aria-current="page">{page}</span>
              ) : (
                <ArchiveLink scrollToResults href={createPageHref(page)} aria-label={`${page}페이지`}>{page}</ArchiveLink>
              )}
            </Fragment>
          ))}
          {pagination.hasNext ? (
            <ArchiveLink scrollToResults href={createPageHref(pagination.currentPage + 1)} aria-label="다음 페이지">→</ArchiveLink>
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

export function PsPostList({
  initialPosts,
  profile,
  graph,
}: Pick<PostListProps, 'initialPosts' | 'profile' | 'graph'>) {
  const { params, searchQuery, updateSearch, endSearch } = useArchiveSearch('/coding-test/');
  const language = params.get('language') ?? '';
  const tag = params.get('tag') ?? '';
  const { posts, languages, tags, selectedLanguage, selectedTag, total } = useMemo(
    () => getPsArchive(initialPosts, { language, tag, q: searchQuery }),
    [initialPosts, language, tag, searchQuery],
  );
  const hasSearchQuery = Boolean(searchQuery.trim());
  const hasFilter = Boolean(selectedLanguage || selectedTag || hasSearchQuery);
  const createHref = (nextLanguage = selectedLanguage, nextTag = selectedTag) =>
    getPsArchiveHref({ language: nextLanguage, tag: nextTag, q: searchQuery });

  return (
    <div className="archive-layout">
      <ArchiveSearchSync />
      <main id="main-content" className="archive-shell ps-shell" tabIndex={-1}>
        <header className="archive-intro">
          <h1>PS</h1>
          <p>코테 노트</p>
        </header>

        <nav className="archive-tabs ps-language-tabs" aria-label="프로그래밍 언어">
          <ArchiveLink href={createHref('')} aria-current={!selectedLanguage ? 'page' : undefined}>
            전체 <span>{total}</span>
          </ArchiveLink>
          {languages.map(({ language: option, count }) => (
            <ArchiveLink key={option} href={createHref(option)} aria-current={selectedLanguage === option ? 'page' : undefined}>
              {getPsLanguageLabel(option)} <span>{count}</span>
            </ArchiveLink>
          ))}
        </nav>

        <section className="ps-toolbar" aria-label="노트 찾기">
          <div className="post-tools-heading">
            <h2>{selectedLanguage ? getPsLanguageLabel(selectedLanguage) : '전체 노트'}</h2>
            <p id="ps-results-status" role="status" aria-atomic="true">
              {hasSearchQuery ? `검색 결과 ${posts.length}개` : `${posts.length}개 글`}
            </p>
            <label className="mobile-archive-selector">
              <span>언어</span>
              <select value={selectedLanguage} onChange={event => navigateArchive(createHref(event.target.value))}>
                <option value="">전체 언어 ({total})</option>
                {selectedLanguage && !languages.some(option => option.language === selectedLanguage) && (
                  <option value={selectedLanguage}>{getPsLanguageLabel(selectedLanguage)}</option>
                )}
                {languages.map(({ language: option, count }) => (
                  <option key={option} value={option}>{getPsLanguageLabel(option)} ({count})</option>
                ))}
              </select>
            </label>
          </div>
          <SearchBar
            inputId="ps-search"
            statusId="ps-results-status"
            query={searchQuery}
            onSearch={updateSearch}
            onSearchEnd={endSearch}
            placeholder="제목, 요약, 태그, 언어로 검색"
          />
          {tags.length > 0 && (
            <details className="taxonomy">
              <summary>태그 <span>{tags.length}</span></summary>
              <nav className="taxonomy-options" aria-label="노트 태그">
                <ArchiveLink href={createHref(selectedLanguage, '')} aria-current={!selectedTag ? 'true' : undefined}>
                  전체 태그
                </ArchiveLink>
                {tags.map(({ tag: option, count }) => (
                  <ArchiveLink
                    key={option}
                    href={createHref(selectedLanguage, option)}
                    aria-current={selectedTag === option ? 'true' : undefined}
                  >
                    #{option} <span>{count}</span>
                  </ArchiveLink>
                ))}
              </nav>
            </details>
          )}
          {hasFilter && (
            <div className="active-filters">
              {selectedLanguage && (
                <ArchiveLink focusSearch href={createHref('')} aria-label={`언어 ${getPsLanguageLabel(selectedLanguage)} 필터 해제`}>
                  {getPsLanguageLabel(selectedLanguage)} <span aria-hidden="true">×</span>
                </ArchiveLink>
              )}
              {selectedTag && (
                <ArchiveLink focusSearch href={createHref(selectedLanguage, '')} aria-label={`태그 ${selectedTag} 필터 해제`}>
                  #{selectedTag} <span aria-hidden="true">×</span>
                </ArchiveLink>
              )}
              <ArchiveLink focusSearch href="/coding-test/">모든 조건 초기화</ArchiveLink>
            </div>
          )}
        </section>

        {posts.length === 0 ? (
          <div className="empty-state">
            <p>{hasFilter ? '선택한 조건에 해당하는 노트가 없습니다.' : '아직 작성된 PS 노트가 없습니다.'}</p>
            {hasSearchQuery && (
              <button type="button" onClick={() => {
                updateSearch('');
                document.getElementById('ps-search')?.focus();
              }}>검색 초기화</button>
            )}
            {hasFilter && <ArchiveLink focusSearch href="/coding-test/">전체 노트 보기</ArchiveLink>}
          </div>
        ) : (
          <div className="post-list">
            {posts.map(post => (
              <article key={post.slug} className="post-row">
                <Link href={`/coding-test/${post.slug}`}>
                  <h2>{post.title}</h2>
                  {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
                  <div className="post-meta">
                    <time dateTime={toMetadataDate(post.date) ?? post.date}>{formatDisplayDate(post.date)}</time>
                    <span>{getPsLanguageLabel(post.language)}</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
      <div className="archive-rail">
        {profile}
        {graph}
      </div>
    </div>
  );
}
