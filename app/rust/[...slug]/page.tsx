import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getRustData, getAllRustSlugs, getAdjacentRust } from '@/lib/rust';
import { format } from 'date-fns';
import { Comments } from '@/components/Comments';
import { CodeBlockEnhancer } from '@/components/CodeBlock';
import { MermaidRenderer } from '@/components/MermaidRenderer';
import { TableOfContents } from '@/components/TableOfContents';
import { ReadingProgressBar } from '@/components/ReadingProgressBar';
import { ShareButtons } from '@/components/ShareButtons';
import { PostNavigation } from '@/components/PostNavigation';
import { themeConfig } from '@/config/theme.config';

export async function generateStaticParams() {
  const items = getAllRustSlugs();
  return items.map((item) => ({
    slug: item.slug.split('/'),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const slugString = slug.join('/');
  const { seo, site } = themeConfig;

  try {
    const item = await getRustData(slugString);
    const itemUrl = `${seo.siteUrl}/rust/${slugString}`;

    const ogImageUrl = seo.openGraph.defaultImage.startsWith('http://') || seo.openGraph.defaultImage.startsWith('https://')
      ? seo.openGraph.defaultImage
      : `${seo.siteUrl}${seo.openGraph.defaultImage}`;

    return {
      title: item.title,
      description: item.excerpt || item.title,
      keywords: item.tags || [],
      openGraph: {
        type: 'article',
        locale: seo.openGraph.locale,
        url: itemUrl,
        siteName: seo.openGraph.siteName,
        title: item.title,
        description: item.excerpt || item.title,
        publishedTime: item.date,
        authors: [site.title],
        tags: item.tags,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: item.title,
          },
        ],
      },
      twitter: {
        card: seo.twitter.card as 'summary_large_image',
        title: item.title,
        description: item.excerpt || item.title,
        images: [ogImageUrl],
      },
      alternates: {
        canonical: itemUrl,
      },
    };
  } catch {
    return {
      title: 'Post Not Found',
    };
  }
}

export default async function RustPost({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const slugString = slug.join('/');

  let item;
  try {
    item = await getRustData(slugString);
  } catch {
    notFound();
  }

  const { previous: previousItem, next: nextItem } = getAdjacentRust(slugString);
  const itemUrl = `${themeConfig.seo.siteUrl}/rust/${slugString}`;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeConfig.colors.light.background.primary} ${themeConfig.colors.dark.background.primary}`}>
      <ReadingProgressBar readingTime={item.readingTime} />

      <main className="mx-auto px-6 py-16">
        <div className={`${themeConfig.spacing.container} mx-auto mb-12`}>
          <Link
            href="/rust"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all group"
          >
            <svg
              className={`w-5 h-5 mr-2 group-hover:-translate-x-1 ${themeConfig.animations.transition}`}
              fill="none"
              strokeWidth="2"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19 12H5M5 12l7 7M5 12l7-7" />
            </svg>
            <span className="font-medium">Back to Rust</span>
          </Link>
        </div>

        <div className={`relative ${themeConfig.spacing.postWidth} mx-auto`}>
          <article>
            <header className={`pb-8 mb-8 ${themeConfig.colors.light.border.secondary} ${themeConfig.colors.dark.border.secondary} border-b`}>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <time className={`text-sm ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}>
                  {format(new Date(item.date), 'yyyy.MM.dd')}
                </time>
                {item.readingTime && (
                  <span className={`text-sm ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}>
                    · {item.readingTime} min read
                  </span>
                )}
                {item.level && (
                  <span className={`text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300`}>
                    {item.level}
                  </span>
                )}
                {item.category && (
                  <span className={`text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary}`}>
                    {item.category}
                  </span>
                )}
              </div>
              <h1 className={`text-3xl md:text-4xl font-bold ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} mb-4 leading-tight`}>
                {item.title}
              </h1>
              {item.excerpt && (
                <p className={`text-lg ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} leading-relaxed`}>
                  {item.excerpt}
                </p>
              )}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {item.tags.map((tag) => (
                    <span key={tag} className={`text-sm ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            <div>
              <CodeBlockEnhancer />
              <MermaidRenderer />

              <div
                className={`prose ${themeConfig.prose.size} dark:prose-invert max-w-none
                  prose-headings:font-semibold prose-headings:text-black dark:prose-headings:text-white prose-headings:scroll-mt-20
                  prose-h1:${themeConfig.prose.h1} prose-h1:mb-6 prose-h1:mt-12
                  prose-h2:${themeConfig.prose.h2} prose-h2:mb-4 prose-h2:mt-10 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-gray-800
                  prose-h3:${themeConfig.prose.h3} prose-h3:mb-3 prose-h3:mt-8
                  prose-p:${themeConfig.prose.paragraphColor.light} dark:prose-p:${themeConfig.prose.paragraphColor.dark} prose-p:leading-relaxed prose-p:mb-6
                  prose-a:text-black dark:prose-a:text-white prose-a:font-medium prose-a:no-underline prose-a:border-b prose-a:border-gray-400 dark:prose-a:border-gray-600 hover:prose-a:border-black dark:hover:prose-a:border-white prose-a:transition-colors
                  prose-strong:text-black dark:prose-strong:text-white prose-strong:font-bold
                  prose-code:text-black dark:prose-code:text-white prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-code:font-mono prose-code:text-sm
                  prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:border prose-pre:border-gray-800 dark:prose-pre:border-gray-700 prose-pre:rounded-lg prose-pre:p-4
                  prose-blockquote:border-l-2 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-700 prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400 prose-blockquote:pl-4 prose-blockquote:italic
                  prose-hr:border-gray-200 dark:prose-hr:border-gray-800 prose-hr:my-8
                  prose-ul:${themeConfig.prose.listColor.light} dark:prose-ul:${themeConfig.prose.listColor.dark} prose-ul:list-disc prose-ul:pl-6
                  prose-ol:${themeConfig.prose.listColor.light} dark:prose-ol:${themeConfig.prose.listColor.dark} prose-ol:list-decimal prose-ol:pl-6
                  prose-li:${themeConfig.prose.listColor.light} dark:prose-li:${themeConfig.prose.listColor.dark} prose-li:mb-2
                  prose-img:rounded-lg prose-img:mx-auto prose-img:block`}
                dangerouslySetInnerHTML={{ __html: item.content || '' }}
              />
            </div>

            <div className={`py-6 ${themeConfig.colors.light.border.secondary} ${themeConfig.colors.dark.border.secondary} border-t`}>
              <ShareButtons title={item.title} url={itemUrl} />
            </div>

            <PostNavigation
              previousPost={previousItem ? { slug: previousItem.slug, title: previousItem.title } : null}
              nextPost={nextItem ? { slug: nextItem.slug, title: nextItem.title } : null}
              basePath="/rust"
            />

            <div className={`pt-8 mt-8 ${themeConfig.colors.light.border.secondary} ${themeConfig.colors.dark.border.secondary} border-t`}>
              <Comments />
            </div>
          </article>

          {item.toc && item.toc.length > 0 && (
            <aside className="hidden xl:block fixed right-8 top-24 w-56">
              <TableOfContents items={item.toc} />
            </aside>
          )}
        </div>

        <div className={`${themeConfig.spacing.container} mx-auto px-6 mt-12 text-center`}>
          <Link
            href="/rust"
            className={`inline-flex items-center px-6 py-3 ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} hover:${themeConfig.colors.light.text.primary} hover:${themeConfig.colors.dark.text.primary} ${themeConfig.animations.transition}`}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              strokeWidth="2"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19 12H5M5 12l7 7M5 12l7-7" />
            </svg>
            Back to Rust
          </Link>
        </div>
      </main>
    </div>
  );
}
