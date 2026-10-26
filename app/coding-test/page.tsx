import Link from 'next/link';
import type { Metadata } from 'next';
import { getPostData, getSortedPostsDataByCategory } from '@/lib/posts';
import { CodeBlockEnhancer } from '@/components/CodeBlock';
import { MermaidRenderer } from '@/components/MermaidRenderer';
import { formatDisplayDate, toMetadataDate } from '@/lib/date';
import { createCodingTestPageMetadata, getSearchParamValue } from '@/lib/metadata';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string | string[] }>;
}): Promise<Metadata> {
  return createCodingTestPageMetadata(await searchParams);
}

export default async function CodingTestPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string | string[] }>;
}) {
  const { tag } = await searchParams;
  const codingTestPosts = getSortedPostsDataByCategory('PS');
  const tagCounts = codingTestPosts.reduce<Record<string, number>>((acc, post) => {
    (post.tags ?? []).forEach((tagItem) => {
      acc[tagItem] = (acc[tagItem] || 0) + 1;
    });
    return acc;
  }, {});
  const availableTags = Object.keys(tagCounts).sort((a, b) => a.localeCompare(b));
  const selectedTag = getSearchParamValue(tag) || '';
  const filteredPosts = selectedTag
    ? codingTestPosts.filter((post) => (post.tags ?? []).includes(selectedTag))
    : codingTestPosts;
  const threadPosts = await Promise.all(filteredPosts.map((post) => getPostData(post.slug)));

  return (
    <div>
      <main className="reading-shell">
        <header className="reading-header">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <svg className="w-3.5 h-3.5" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            <span>홈</span>
          </Link>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold">PS 노트</h1>
          <div className="mt-4 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span>{threadPosts.length}개 글</span>
            {selectedTag && <span>필터: #{selectedTag}</span>}
          </div>
        </header>

        {availableTags.length > 0 && (
          <nav aria-label="노트 태그" className="border-b border-[var(--border)] py-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Link
                href="/coding-test"
                aria-current={selectedTag === '' ? 'page' : undefined}
                className="inline-flex min-h-11 items-center px-2 text-[var(--muted)] hover:text-[var(--foreground)] aria-[current=page]:text-[var(--foreground)] aria-[current=page]:underline underline-offset-4"
              >
                전체
              </Link>
              {availableTags.map((currentTag) => (
                <Link
                  key={currentTag}
                  href={`/coding-test?tag=${encodeURIComponent(currentTag)}`}
                  aria-current={selectedTag === currentTag ? 'page' : undefined}
                  className="inline-flex min-h-11 items-center px-2 text-[var(--muted)] hover:text-[var(--foreground)] aria-[current=page]:text-[var(--foreground)] aria-[current=page]:underline underline-offset-4"
                >
                  #{currentTag} {tagCounts[currentTag]}
                </Link>
              ))}
            </div>
          </nav>
        )}

        {threadPosts.length === 0 ? (
          <p className="py-10 text-sm text-gray-500 dark:text-gray-400">
            {selectedTag ? `#${selectedTag} 태그의 노트가 없습니다.` : '아직 작성된 코테 노트가 없습니다.'}
          </p>
        ) : (
          <section className="mt-6 space-y-10">
            <CodeBlockEnhancer />
            <MermaidRenderer />
            {threadPosts.map((post) => (
              <article
                key={post.slug}
                id={post.slug.replace(/\//g, '-')}
                className="pb-10 border-b border-gray-200 dark:border-gray-800"
              >
                <header>
                  <h2 className="text-xl sm:text-2xl font-semibold leading-tight">{post.title}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <time dateTime={toMetadataDate(post.date) ?? post.date}>{formatDisplayDate(post.date)}</time>
                    {post.readingTime && <span>{post.readingTime}분</span>}
                    {post.tags?.map((tagItem) => (
                      <span key={tagItem}>
                        #{tagItem}
                      </span>
                    ))}
                    <Link href={`/coding-test/${post.slug}`} className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-[var(--foreground)]">
                      단일 페이지
                    </Link>
                  </div>
                  {post.excerpt && <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{post.excerpt}</p>}
                </header>

                <div
                  className="mt-6 prose dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-inherit"
                  dangerouslySetInnerHTML={{ __html: post.content || '' }}
                />
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
