import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPostData, getSortedPostsDataByCategory } from '@/lib/posts';
import { CodeBlockEnhancer } from '@/components/CodeBlock';
import { MermaidRenderer } from '@/components/MermaidRenderer';
import { formatDisplayDate, toMetadataDate } from '@/lib/date';
import { createPageMetadata } from '@/lib/metadata';

export async function generateStaticParams() {
  const posts = getSortedPostsDataByCategory('PS');
  return posts.map((post) => ({ slug: post.slug.split('/') }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const slugString = slug.join('/');

  try {
    const post = await getPostData(slugString);
    if (post.category !== 'PS') {
      return { title: 'Post Not Found' };
    }

    return {
      ...createPageMetadata({
        title: post.title,
        description: post.excerpt || post.title,
        canonicalPath: `/coding-test/${slugString}`,
      }),
    };
  } catch {
    return { title: 'Post Not Found' };
  }
}

export default async function CodingTestPostPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const slugString = slug.join('/');

  let post;
  try {
    post = await getPostData(slugString);
  } catch {
    notFound();
  }

  if (post.category !== 'PS') {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-6">
          <Link
            href="/coding-test"
            className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            스레드로 돌아가기
          </Link>
        </div>

        <article>
          <header className="pb-5 border-b border-rose-100/70 dark:border-gray-800">
            <h1 className="text-2xl sm:text-3xl font-semibold leading-tight">{post.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <time dateTime={toMetadataDate(post.date) ?? post.date}>{formatDisplayDate(post.date)}</time>
              {post.readingTime && <span>{post.readingTime}분</span>}
              {post.tags?.map((tagItem) => (
                <span key={tagItem} className="px-2 py-0.5 rounded-full border border-rose-200/70 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20">
                  #{tagItem}
                </span>
              ))}
            </div>
            {post.excerpt && <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{post.excerpt}</p>}
          </header>

          <CodeBlockEnhancer />
          <MermaidRenderer />

          <div
            className="mt-6 prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-rose-600 dark:prose-a:text-rose-300"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />
        </article>
      </main>
    </div>
  );
}
