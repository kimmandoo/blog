import Link from 'next/link';
import type { Metadata } from 'next';
import { getSortedPostsDataByCategory } from '@/lib/posts';
import { formatDisplayDate, toMetadataDate } from '@/lib/date';
import { createCodingTestPageMetadata, getSearchParamValue } from '@/lib/metadata';
import { getPsArchive, getPsArchiveHref, getPsLanguageLabel } from '@/lib/ps';
import { ProfileSidebar } from '@/components/ProfileSidebar';
import { PostGraph } from '@/components/PostGraph';
import { getPostGraph } from '@/lib/postGraph';
import { layoutPostGraph } from '@/lib/postGraphLayout';

type CodingTestPageProps = {
  searchParams: Promise<{
    language?: string | string[];
    tag?: string | string[];
  }>;
};

export async function generateMetadata({ searchParams }: CodingTestPageProps): Promise<Metadata> {
  return createCodingTestPageMetadata(await searchParams);
}

export default async function CodingTestPage({ searchParams }: CodingTestPageProps) {
  const params = await searchParams;
  const { posts, languages, tags, selectedLanguage, selectedTag, total } = getPsArchive(
    getSortedPostsDataByCategory('PS'),
    {
      language: getSearchParamValue(params.language),
      tag: getSearchParamValue(params.tag),
    },
  );
  const hasFilter = Boolean(selectedLanguage || selectedTag);
  const graph = getPostGraph();

  return (
    <div className="archive-layout">
    <main className="archive-shell ps-shell">
      <header className="archive-intro">
        <h1>PS</h1>
        <p>코테 노트</p>
      </header>

      <nav className="archive-tabs" aria-label="프로그래밍 언어">
        <Link
          href={getPsArchiveHref({ tag: selectedTag })}
          aria-current={!selectedLanguage ? 'page' : undefined}
        >
          전체 <span>{total}</span>
        </Link>
        {languages.map(({ language, count }) => (
          <Link
            key={language}
            href={getPsArchiveHref({ language, tag: selectedTag })}
            aria-current={selectedLanguage === language ? 'page' : undefined}
          >
            {getPsLanguageLabel(language)} <span>{count}</span>
          </Link>
        ))}
      </nav>

      <section className="ps-toolbar" aria-label="노트 필터">
        <div className="post-tools-heading">
          <h2>{selectedLanguage ? getPsLanguageLabel(selectedLanguage) : '전체 노트'}</h2>
          <p>{posts.length}개 글</p>
        </div>
        {tags.length > 0 && (
          <details className="taxonomy">
            <summary>태그 <span>{tags.length}</span></summary>
            <nav className="taxonomy-options" aria-label="노트 태그">
              <Link
                href={getPsArchiveHref({ language: selectedLanguage })}
                aria-current={!selectedTag ? 'page' : undefined}
              >
                전체 태그
              </Link>
              {tags.map(({ tag, count }) => (
                <Link
                  key={tag}
                  href={getPsArchiveHref({ language: selectedLanguage, tag })}
                  aria-current={selectedTag === tag ? 'page' : undefined}
                >
                  #{tag} <span>{count}</span>
                </Link>
              ))}
            </nav>
          </details>
        )}
        {hasFilter && (
          <div className="active-filters">
            {selectedLanguage && (
              <Link
                href={getPsArchiveHref({ tag: selectedTag })}
                aria-label={`언어 ${getPsLanguageLabel(selectedLanguage)} 필터 해제`}
              >
                {getPsLanguageLabel(selectedLanguage)} <span aria-hidden="true">×</span>
              </Link>
            )}
            {selectedTag && (
              <Link
                href={getPsArchiveHref({ language: selectedLanguage })}
                aria-label={`태그 ${selectedTag} 필터 해제`}
              >
                #{selectedTag} <span aria-hidden="true">×</span>
              </Link>
            )}
            <Link href="/coding-test">필터 초기화</Link>
          </div>
        )}
      </section>

      {posts.length === 0 ? (
        <div className="empty-state">
          <p>{hasFilter ? '선택한 조건에 해당하는 노트가 없습니다.' : '아직 작성된 PS 노트가 없습니다.'}</p>
          {hasFilter && <Link href="/coding-test">전체 노트 보기</Link>}
        </div>
      ) : (
        <div className="post-list">
          {posts.map((post) => (
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
        <ProfileSidebar />
        <PostGraph graph={graph} positions={layoutPostGraph(graph)} />
      </div>
    </div>
  );
}
