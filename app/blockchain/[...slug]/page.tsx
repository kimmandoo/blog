import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getBlockchainData, getAllBlockchainSlugs, getSortedBlockchainData } from '@/lib/blockchain';
import { format } from 'date-fns';
import { CodeBlockEnhancer } from '@/components/CodeBlock';
import { MermaidRenderer } from '@/components/MermaidRenderer';
import { TableOfContents } from '@/components/TableOfContents';
import { ReadingProgressBar } from '@/components/ReadingProgressBar';
import { Comments } from '@/components/Comments';
import { themeConfig } from '@/config/theme.config';
import { BlockchainSidebar } from '@/components/BlockchainSidebar';
import { BlockchainNavigation } from '@/components/BlockchainNavigation';
import { ThemeToggle } from '@/components/ThemeToggle';

export async function generateStaticParams() {
  const items = getAllBlockchainSlugs();
  return items.map((item) => ({
    slug: item.slug.split('/'),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const slugString = slug.join('/');
  const { seo, site } = themeConfig;
  
  try {
    const item = await getBlockchainData(slugString);
    const itemUrl = `${seo.siteUrl}/blockchain/${slugString}`;
    
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
      title: 'Content Not Found',
    };
  }
}

export default async function BlockchainPost({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const slugString = slug.join('/');
  
  let item;
  try {
    item = await getBlockchainData(slugString);
  } catch {
    notFound();
  }

  const allItems = getSortedBlockchainData();

  return (
    <div className="min-h-screen bg-emerald-50/30 dark:bg-gray-950">
      {/* Reading Progress Bar */}
      <ReadingProgressBar readingTime={item.readingTime} />
      
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-emerald-200 dark:border-gray-800">
        <div className="h-16 px-6 flex items-center justify-between max-w-screen-2xl mx-auto">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {themeConfig.site.title}
              </span>
            </Link>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <Link href="/blockchain" className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Blockchain
            </Link>
          </div>
          
          {/* Right: Theme Toggle and Back to Blog */}
          <div className="flex items-center gap-3">
            <ThemeToggle inline />
            <Link 
              href="/" 
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors border border-gray-200 dark:border-gray-700"
            >
              Blog
            </Link>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="flex max-w-screen-2xl mx-auto">
        {/* Left Sidebar - Navigation */}
        <BlockchainSidebar items={allItems} currentSlug={slugString} />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 lg:flex lg:gap-8">
          {/* Article Content */}
          <article className="flex-1 min-w-0 px-8 py-12 max-w-4xl mx-auto lg:mx-0">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
              <Link href="/blockchain" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Blockchain
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
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                {item.title}
              </h1>
              
              {item.excerpt && (
                <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                  {item.excerpt}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 dark:text-gray-500">
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
                    <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20">
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
                  prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:scroll-mt-20
                  prose-h1:${themeConfig.prose.h1} prose-h1:mb-6 prose-h1:mt-12
                  prose-h2:${themeConfig.prose.h2} prose-h2:mb-4 prose-h2:mt-10 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-gray-800
                  prose-h3:${themeConfig.prose.h3} prose-h3:mb-3 prose-h3:mt-8
                  prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
                  prose-a:text-emerald-600 dark:prose-a:text-emerald-400 hover:prose-a:text-emerald-700 dark:hover:prose-a:text-emerald-300 prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
                  prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-bold
                  prose-code:text-emerald-700 dark:prose-code:text-emerald-400 prose-code:bg-emerald-50 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-code:font-mono prose-code:text-sm
                  prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-800 prose-pre:rounded-lg prose-pre:p-4
                  prose-blockquote:border-l-4 prose-blockquote:border-emerald-500 prose-blockquote:bg-emerald-50 dark:prose-blockquote:bg-emerald-900/10 prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:italic
                  prose-hr:border-gray-200 dark:prose-hr:border-gray-800 prose-hr:my-8
                  prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-ul:list-disc prose-ul:pl-6
                  prose-ol:text-gray-700 dark:prose-ol:text-gray-300 prose-ol:list-decimal prose-ol:pl-6
                  prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:mb-2
                  prose-img:rounded-lg prose-img:border prose-img:border-gray-200 dark:prose-img:border-gray-800 prose-img:mx-auto prose-img:block`}
                dangerouslySetInnerHTML={{ __html: item.content || '' }}
              />
            </div>

            {/* Previous/Next Navigation */}
            <BlockchainNavigation allItems={allItems} currentSlug={slugString} />

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
