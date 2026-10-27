import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPostData, getSortedPostsDataByCategory } from '@/lib/posts';
import { CodeBlockEnhancer } from '@/components/CodeBlock';
import { MermaidRenderer } from '@/components/MermaidRenderer';
import { formatDisplayDate, toMetadataDate } from '@/lib/date';
import { createPageMetadata } from '@/lib/metadata';
import { getPsArchiveHref, getPsLanguageLabel, normalizePsLanguage } from '@/lib/ps';

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
    <div>
      <main className="reading-shell">
        <div className="mb-6">
          <Link
            href={getPsArchiveHref({ language: normalizePsLanguage(post.language) })}
            className="inline-flex min-h-11 items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <svg className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            {getPsLanguageLabel(post.language)} 노트 목록
          </Link>
        </div>

        <article>
          <header className="reading-header">
            <h1 className="text-2xl sm:text-3xl font-semibold leading-tight">{post.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <time dateTime={toMetadataDate(post.date) ?? post.date}>{formatDisplayDate(post.date)}</time>
              <Link href={getPsArchiveHref({ language: normalizePsLanguage(post.language) })}>
                {getPsLanguageLabel(post.language)}
              </Link>
              {post.readingTime && <span>{post.readingTime}분</span>}
              {post.tags?.map((tagItem) => (
                <span key={tagItem}>
                  #{tagItem}
                </span>
              ))}
            </div>
            {post.excerpt && <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{post.excerpt}</p>}
          </header>

          <CodeBlockEnhancer />
          <MermaidRenderer />

          <div
            className="mt-6 prose dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-inherit"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />
        </article>
      </main>
    </div>
  );
}
