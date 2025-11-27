import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getPostData, getAllPostSlugs, getAllCategories } from '@/lib/posts';
import { format } from 'date-fns';
import { CategoryBadge } from '@/components/CategoryBadge';
import { TagBadge } from '@/components/TagBadge';
import { Comments } from '@/components/Comments';
import { CodeBlockEnhancer } from '@/components/CodeBlock';
import { TableOfContents } from '@/components/TableOfContents';
import { themeConfig } from '@/config/theme.config';

export async function generateStaticParams() {
  const posts = getAllPostSlugs();
  return posts.map((post) => ({
    slug: post.slug.split('/'),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const slugString = slug.join('/');
  const { seo, site } = themeConfig;
  
  try {
    const post = await getPostData(slugString);
    const postUrl = `${seo.siteUrl}/posts/${slugString}`;
    const ogImageUrl = `${seo.siteUrl}${seo.openGraph.defaultImage}`;
    
    return {
      title: post.title,
      description: post.excerpt || post.title,
      keywords: post.tags || [],
      openGraph: {
        type: 'article',
        locale: seo.openGraph.locale,
        url: postUrl,
        siteName: seo.openGraph.siteName,
        title: post.title,
        description: post.excerpt || post.title,
        publishedTime: post.date,
        authors: [site.title],
        tags: post.tags,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
      },
      twitter: {
        card: seo.twitter.card as 'summary_large_image',
        title: post.title,
        description: post.excerpt || post.title,
        images: [ogImageUrl],
      },
      alternates: {
        canonical: postUrl,
      },
    };
  } catch {
    return {
      title: 'Post Not Found',
    };
  }
}

export default async function Post({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const slugString = slug.join('/');
  
  let post;
  try {
    post = await getPostData(slugString);
  } catch {
    notFound();
  }

  const allCategories = getAllCategories();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeConfig.colors.light.background.primary} ${themeConfig.colors.dark.background.primary}`}>
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-pink-200/30 to-rose-200/30 dark:from-pink-900/20 dark:to-rose-900/20 rounded-full blur-3xl" />
      </div>

      <main className="mx-auto px-6 py-16 relative z-10">
        <div className={`${themeConfig.spacing.container} mx-auto mb-12`}>
          <Link 
            href="/"
            className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all group px-4 py-2 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
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
            <span className="font-medium">Back to all posts</span>
          </Link>
        </div>

        {/* Content layout with ToC positioned absolutely to not affect content width */}
        <div className="relative max-w-4xl mx-auto">
            {/* Main content area - always centered with same width */}
            <article className={`${themeConfig.colors.light.background.card} ${themeConfig.colors.dark.background.card} rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 ${themeConfig.colors.light.border.primary} ${themeConfig.colors.dark.border.primary} border overflow-hidden`}>
          <header className={`px-8 md:px-12 pt-12 pb-8 ${themeConfig.colors.light.border.secondary} ${themeConfig.colors.dark.border.secondary} border-b relative`}>
            {/* Gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <time className={`${themeConfig.typography.fontSize.small} font-medium ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary} uppercase tracking-wider flex items-center gap-2`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {format(new Date(post.date), 'MMMM dd, yyyy')}
              </time>
              {post.category && (
                <CategoryBadge 
                  category={post.category} 
                  index={allCategories.indexOf(post.category)}
                  size="md"
                />
              )}
            </div>
            <h1 className="text-4xl md:text-3xl font-bold mb-4 leading-tight bg-gradient-to-r from-slate-900 via-indigo-800 to-purple-800 dark:from-white dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className={`${themeConfig.typography.fontSize.subheading} ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} leading-relaxed`}>
                {post.excerpt}
              </p>
            )}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {post.tags.map((tag) => (
                  <TagBadge key={tag} tag={tag} size="md" />
                ))}
              </div>
            )}
          </header>

          <div className="px-8 md:px-12 py-12">
            <CodeBlockEnhancer />
            
            <div 
              className={`prose ${themeConfig.prose.size} dark:prose-invert max-w-none
                prose-headings:font-semibold prose-headings:text-black dark:prose-headings:text-white prose-headings:scroll-mt-20
                prose-h1:${themeConfig.prose.h1} prose-h1:mb-6 prose-h1:mt-12
                prose-h2:${themeConfig.prose.h2} prose-h2:mb-4 prose-h2:mt-10 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-gray-800
                prose-h3:${themeConfig.prose.h3} prose-h3:mb-3 prose-h3:mt-8
                prose-p:${themeConfig.prose.paragraphColor.light} dark:prose-p:${themeConfig.prose.paragraphColor.dark} prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-black dark:prose-a:text-white prose-a:font-medium prose-a:no-underline prose-a:border-b-2 prose-a:border-black dark:prose-a:border-white hover:prose-a:border-gray-400 dark:hover:prose-a:border-gray-600 prose-a:transition-colors
                prose-strong:text-black dark:prose-strong:text-white prose-strong:font-bold
                prose-code:text-black dark:prose-code:text-white prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded-lg prose-code:before:content-none prose-code:after:content-none prose-code:font-mono prose-code:text-sm
                prose-pre:bg-gradient-to-br prose-pre:from-gray-900 prose-pre:to-black dark:prose-pre:from-gray-950 dark:prose-pre:to-black prose-pre:border prose-pre:border-gray-800 dark:prose-pre:border-gray-700 prose-pre:rounded-2xl prose-pre:shadow-lg prose-pre:p-6
                prose-blockquote:border-l-4 prose-blockquote:border-black dark:prose-blockquote:border-white prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-900 prose-blockquote:py-4 prose-blockquote:rounded-r-xl
                prose-hr:border-gray-200 dark:prose-hr:border-gray-800 prose-hr:my-12
                prose-ul:${themeConfig.prose.listColor.light} dark:prose-ul:${themeConfig.prose.listColor.dark} prose-ul:list-disc prose-ul:pl-6
                prose-ol:${themeConfig.prose.listColor.light} dark:prose-ol:${themeConfig.prose.listColor.dark} prose-ol:list-decimal prose-ol:pl-6
                prose-li:${themeConfig.prose.listColor.light} dark:prose-li:${themeConfig.prose.listColor.dark} prose-li:mb-2
                prose-img:rounded-2xl prose-img:shadow-lg`}
              dangerouslySetInnerHTML={{ __html: post.content || '' }}
            />
          </div>

          {/* Comments Section */}
          <div className={`px-8 md:px-12 pb-12 pt-8 ${themeConfig.colors.light.border.secondary} ${themeConfig.colors.dark.border.secondary} border-t`}>
            <Comments />
          </div>
        </article>

        {/* Table of Contents Sidebar - Fixed position to not affect content width */}
        {post.toc && post.toc.length > 0 && (
          <aside className="hidden xl:block fixed right-8 top-24 w-56">
            <TableOfContents items={post.toc} />
          </aside>
        )}
      </div>

    <div className={`${themeConfig.spacing.container} mx-auto px-6 mt-12 text-center`}>
      <Link 
        href="/"
        className={`inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white ${themeConfig.borderRadius.button} font-bold ${themeConfig.animations.scale} ${themeConfig.animations.transition} shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40`}
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
        Back to Home
      </Link>
    </div>
  </main>
</div>
  );
}
