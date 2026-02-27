import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPSData, getAllPSSlugs, getAdjacentPS, getSortedPSData } from '@/lib/ps';
import { format } from 'date-fns';
import { Comments } from '@/components/Comments';
import { CodeBlockEnhancer } from '@/components/CodeBlock';
import { MermaidRenderer } from '@/components/MermaidRenderer';
import { TableOfContents } from '@/components/TableOfContents';
import { ReadingProgressBar } from '@/components/ReadingProgressBar';
import { ShareButtons } from '@/components/ShareButtons';
import { PostNavigation } from '@/components/PostNavigation';
import { PSSidebar } from '@/components/PSSidebar';
import { PSTopBar } from '@/components/PSTopBar';
import { themeConfig } from '@/config/theme.config';

export async function generateStaticParams() {
  const items = getAllPSSlugs();
  return items.map((item) => ({
    slug: item.slug.split('/'),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const slugString = slug.join('/');
  const { seo, site } = themeConfig;
  
  try {
    const item = await getPSData(slugString);
    const itemUrl = `${seo.siteUrl}/ps/${slugString}`;
    
    // Auto-generate OG image with post metadata
    const ogParams = new URLSearchParams({
      title: item.title,
      ...(item.category && { category: item.category }),
      ...(item.date && { date: item.date }),
      ...(item.tags?.length && { tags: item.tags.join(',') }),
    });
    const ogImageUrl = `${seo.siteUrl}/og?${ogParams.toString()}`;
    
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

export default async function PSPost({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const slugString = slug.join('/');
  
  let item;
  try {
    item = await getPSData(slugString);
  } catch {
    notFound();
  }

  const allItems = getSortedPSData();
  const { previous: previousItem, next: nextItem } = getAdjacentPS(slugString);
  const itemUrl = `${themeConfig.seo.siteUrl}/ps/${slugString}`;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <ReadingProgressBar readingTime={item.readingTime} />

      <PSTopBar />

      <div className="flex max-w-screen-2xl mx-auto">
        <PSSidebar items={allItems} currentSlug={slugString} />

        <main className="flex-1 min-w-0 px-8 py-12">
          <div className={`relative ${themeConfig.spacing.postWidth} mx-auto`}>
            <article>
              <header className={`pb-8 mb-8 border-b border-gray-200 dark:border-gray-800`}>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <time className="text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(item.date), 'yyyy.MM.dd')}
                  </time>
                  {item.readingTime && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      · {item.readingTime}분
                    </span>
                  )}
                  {item.category && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                      {item.category}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
                  {item.title}
                </h1>
                {item.excerpt && (
                  <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                    {item.excerpt}
                  </p>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {item.tags.map((tag) => (
                      <span key={tag} className="text-sm text-gray-500 dark:text-gray-400">
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
                    prose-h4:${themeConfig.prose.h4} prose-h4:mb-2 prose-h4:mt-6
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

              <div className="py-6 border-t border-gray-200 dark:border-gray-800">
                <ShareButtons title={item.title} url={itemUrl} />
              </div>

              <PostNavigation 
                previousPost={previousItem ? { slug: previousItem.slug, title: previousItem.title } : null}
                nextPost={nextItem ? { slug: nextItem.slug, title: nextItem.title } : null}
                basePath="/ps"
              />

              <div className="pt-8 mt-8 border-t border-gray-200 dark:border-gray-800">
                <Comments />
              </div>
            </article>

            {item.toc && item.toc.length > 0 && (
              <aside className="hidden xl:block fixed right-8 top-24 w-56">
                <TableOfContents items={item.toc} />
              </aside>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
