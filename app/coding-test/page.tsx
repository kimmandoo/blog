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
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <header className="border-b border-rose-100/70 dark:border-gray-800 pb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
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
          <nav className="sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 border-b border-rose-100/70 dark:border-gray-800/80 bg-white/92 dark:bg-gray-950/92 backdrop-blur-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Link
                href="/coding-test"
                className={`px-2.5 py-1 rounded border transition-colors ${
                  selectedTag === ''
                    ? 'border-rose-500 bg-rose-600 text-white dark:border-rose-300 dark:bg-rose-300 dark:text-gray-950'
                    : 'border-gray-200 bg-white/70 text-gray-600 hover:border-rose-200 hover:bg-rose-50/70 hover:text-rose-700 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/30 dark:hover:text-rose-200'
                }`}
              >
                전체
              </Link>
              {availableTags.map((currentTag) => (
                <Link
                  key={currentTag}
                  href={`/coding-test?tag=${encodeURIComponent(currentTag)}`}
                  className={`px-2.5 py-1 rounded border transition-colors ${
                    selectedTag === currentTag
                      ? 'border-rose-500 bg-rose-600 text-white dark:border-rose-300 dark:bg-rose-300 dark:text-gray-950'
                      : 'border-gray-200 bg-white/70 text-gray-600 hover:border-rose-200 hover:bg-rose-50/70 hover:text-rose-700 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/30 dark:hover:text-rose-200'
                  }`}
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
                      <span key={tagItem} className="px-2 py-0.5 border border-rose-200/70 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20 rounded-full">
                        #{tagItem}
                      </span>
                    ))}
                    <Link href={`/coding-test/${post.slug}`} className="underline underline-offset-2 hover:text-rose-600 dark:hover:text-rose-300 hover:underline transition-colors">
                      단일 페이지
                    </Link>
                  </div>
                  {post.excerpt && <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{post.excerpt}</p>}
                </header>

                <div
                  className="mt-6 prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-rose-600 dark:prose-a:text-rose-300"
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
