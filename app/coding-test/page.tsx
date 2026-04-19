import Link from 'next/link';
import type { Metadata } from 'next';
import { getPostData, getSortedPostsDataByCategory } from '@/lib/posts';
import { CodeBlockEnhancer } from '@/components/CodeBlock';
import { MermaidRenderer } from '@/components/MermaidRenderer';
import { formatDisplayDate, toMetadataDate } from '@/lib/date';

export const metadata: Metadata = {
  title: 'PS Thread',
  description: 'PS',
};

export default async function CodingTestPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
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
  const selectedTag = tag?.trim() || '';
  const filteredPosts = selectedTag
    ? codingTestPosts.filter((post) => (post.tags ?? []).includes(selectedTag))
    : codingTestPosts;
  const threadPosts = await Promise.all(filteredPosts.map((post) => getPostData(post.slug)));

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <header className="border-b border-gray-200 dark:border-gray-800 pb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <svg className="w-3.5 h-3.5" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            Home
          </Link>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold">PS Thread</h1>
          <div className="mt-4 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span>{threadPosts.length} posts</span>
            {selectedTag && <span>filter: #{selectedTag}</span>}
          </div>
        </header>

        {availableTags.length > 0 && (
          <nav className="sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 border-b border-gray-200/80 dark:border-gray-800/80 bg-white/92 dark:bg-gray-950/92 backdrop-blur-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Link
                href="/coding-test"
                className={`px-2.5 py-1 rounded border ${
                  selectedTag === ''
                    ? 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900'
                    : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                전체
              </Link>
              {availableTags.map((currentTag) => (
                <Link
                  key={currentTag}
                  href={`/coding-test?tag=${encodeURIComponent(currentTag)}`}
                  className={`px-2.5 py-1 rounded border ${
                    selectedTag === currentTag
                      ? 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900'
                      : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300'
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
                    {post.readingTime && <span>{post.readingTime} min</span>}
                    {post.tags?.map((tagItem) => (
                      <span key={tagItem} className="px-2 py-0.5 border border-gray-300 dark:border-gray-700 rounded-full">
                        #{tagItem}
                      </span>
                    ))}
                    <Link href={`/coding-test/${post.slug}`} className="underline underline-offset-2">
                      단일 페이지
                    </Link>
                  </div>
                  {post.excerpt && <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{post.excerpt}</p>}
                </header>

                <div
                  className="mt-5 prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-20"
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
