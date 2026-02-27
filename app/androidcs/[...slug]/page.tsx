import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getAndroidCSData, getAllAndroidCSSlugs, getSortedAndroidCSData } from '@/lib/androidcs';
import { format } from 'date-fns';
import { CodeBlockEnhancer } from '@/components/CodeBlock';
import { MermaidRenderer } from '@/components/MermaidRenderer';
import { TableOfContents } from '@/components/TableOfContents';
import { ReadingProgressBar } from '@/components/ReadingProgressBar';
import { Comments } from '@/components/Comments';
import { themeConfig } from '@/config/theme.config';
import { AndroidCSSidebar } from '@/components/AndroidCSSidebar';
import { AndroidCSNavigation } from '@/components/AndroidCSNavigation';
import { AndroidTopBar } from '@/components/AndroidTopBar';

export async function generateStaticParams() {
  const items = getAllAndroidCSSlugs();
  return items.map((item) => ({
    slug: item.slug.split('/'),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const slugString = slug.join('/');
  const { seo, site } = themeConfig;
  
  try {
    const item = await getAndroidCSData(slugString);
    const itemUrl = `${seo.siteUrl}/androidcs/${slugString}`;
    
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
      title: 'Content Not Found',
    };
  }
}

export default async function AndroidCSPost({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const slugString = slug.join('/');
  
  let item;
  try {
    item = await getAndroidCSData(slugString);
  } catch {
    notFound();
  }

  const allItems = getSortedAndroidCSData();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Reading Progress Bar */}
      <ReadingProgressBar readingTime={item.readingTime} />
      
      <AndroidTopBar />

      {/* GitBook-style Layout */}
      <div className="flex max-w-screen-2xl mx-auto">
        {/* Left Sidebar - Navigation */}
        <AndroidCSSidebar items={allItems} currentSlug={slugString} />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 lg:flex lg:gap-8">
          {/* Article Content */}
          <article className="flex-1 min-w-0 px-8 py-12 max-w-4xl mx-auto lg:mx-0">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
              <Link href="/androidcs" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Android
              </Link>
              <svg className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" />
              </svg>
              {item.category && (
                <>
                  <span>{item.category}</span>
                  <svg className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
              <span className="text-gray-900 dark:text-gray-100">{item.title}</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
              <h1 className={`text-4xl md:text-5xl font-bold ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} mb-6 leading-tight`}>
                {item.title}
              </h1>
              
              {item.excerpt && (
                <p className={`text-xl ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} leading-relaxed mb-6`}>
                  {item.excerpt}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <time className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {format(new Date(item.date), 'yyyy년 MM월 dd일')}
                </time>
                {item.readingTime && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {item.readingTime}분 읽기
                  </span>
                )}
              </div>
              
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {item.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {/* Content */}
            <div className="pb-12 border-b border-gray-200 dark:border-gray-800">
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
                  prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
                  prose-strong:text-black dark:prose-strong:text-white prose-strong:font-bold
                  prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-code:font-mono prose-code:text-sm
                  prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:border prose-pre:border-gray-800 dark:prose-pre:border-gray-700 prose-pre:rounded-lg prose-pre:p-4
                  prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/10 prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:italic
                  prose-hr:border-gray-200 dark:prose-hr:border-gray-800 prose-hr:my-8
                  prose-ul:${themeConfig.prose.listColor.light} dark:prose-ul:${themeConfig.prose.listColor.dark} prose-ul:list-disc prose-ul:pl-6
                  prose-ol:${themeConfig.prose.listColor.light} dark:prose-ol:${themeConfig.prose.listColor.dark} prose-ol:list-decimal prose-ol:pl-6
                  prose-li:${themeConfig.prose.listColor.light} dark:prose-li:${themeConfig.prose.listColor.dark} prose-li:mb-2
                  prose-img:rounded-lg prose-img:border prose-img:border-gray-200 dark:prose-img:border-gray-800 prose-img:mx-auto prose-img:block`}
                dangerouslySetInnerHTML={{ __html: item.content || '' }}
              />
            </div>

            {/* Previous/Next Navigation */}
            <AndroidCSNavigation allItems={allItems} currentSlug={slugString} />

            {/* Comments Section */}
            <div className="mt-12">
              <Comments />
            </div>
          </article>

          {/* Right Sidebar - Table of Contents (Desktop only) */}
          {item.toc && item.toc.length > 0 && (
            <aside className="hidden xl:block sticky top-[64px] h-[calc(100vh-64px)] w-64 py-12 pr-8 overflow-y-auto">
              <TableOfContents items={item.toc} />
            </aside>
          )}
        </main>
      </div>
    </div>
  );
}
