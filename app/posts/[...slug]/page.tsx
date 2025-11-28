import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getPostData, getAllPostSlugs, getAllCategories } from '@/lib/posts';
import { format } from 'date-fns';
import { CategoryBadge } from '@/components/CategoryBadge';
import { TagBadge } from '@/components/TagBadge';
import { Comments } from '@/components/Comments';
import { CodeBlockEnhancer } from '@/components/CodeBlock';
import { MermaidRenderer } from '@/components/MermaidRenderer';
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
    <div className={`min-h-screen bg-gradient-to-b ${themeConfig.colors.light.background.primary} ${themeConfig.colors.dark.background.primary}`}>
      <main className="mx-auto px-5 py-12">
        {/* Back link */}
        <div className={`${themeConfig.spacing.container} mx-auto mb-8`}>
          <Link 
            href="/"
            className={`inline-flex items-center text-sm ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary} hover:text-stone-700 dark:hover:text-stone-200 ${themeConfig.animations.transition}`}
          >
            <svg 
              className="w-4 h-4 mr-1" 
              fill="none" 
              strokeWidth="2" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M19 12H5M5 12l7 7M5 12l7-7" />
            </svg>
            Back
          </Link>
        </div>

        {/* Content */}
        <div className="relative max-w-2xl mx-auto">
          <article>
            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <time className={`text-sm ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}>
                  {format(new Date(post.date), 'MMMM d, yyyy')}
                </time>
                {post.category && (
                  <>
                    <span className={`${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}>·</span>
                    <CategoryBadge 
                      category={post.category} 
                      index={allCategories.indexOf(post.category)}
                      size="sm"
                    />
                  </>
                )}
              </div>
              <h1 className={`text-2xl font-semibold ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} mb-3 leading-tight`}>
                {post.title}
              </h1>
              {post.excerpt && (
                <p className={`text-base ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary}`}>
                  {post.excerpt}
                </p>
              )}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {post.tags.map((tag) => (
                    <TagBadge key={tag} tag={tag} size="sm" />
                  ))}
                </div>
              )}
            </header>

            {/* Divider */}
            <hr className="border-stone-200 dark:border-stone-800 mb-8" />

            {/* Content */}
            <div>
              <CodeBlockEnhancer />
              <MermaidRenderer />
              
              <div 
                className={`prose ${themeConfig.prose.size} dark:prose-invert max-w-none
                  prose-headings:font-semibold prose-headings:text-stone-900 dark:prose-headings:text-stone-100 prose-headings:scroll-mt-20
                  prose-h1:${themeConfig.prose.h1} prose-h1:mb-4 prose-h1:mt-8
                  prose-h2:${themeConfig.prose.h2} prose-h2:mb-3 prose-h2:mt-8
                  prose-h3:${themeConfig.prose.h3} prose-h3:mb-2 prose-h3:mt-6
                  prose-p:${themeConfig.prose.paragraphColor.light} dark:prose-p:${themeConfig.prose.paragraphColor.dark} prose-p:leading-relaxed prose-p:mb-4
                  prose-a:text-stone-900 dark:prose-a:text-stone-100 prose-a:font-medium prose-a:no-underline prose-a:border-b prose-a:border-stone-300 dark:prose-a:border-stone-600 hover:prose-a:border-stone-500 dark:hover:prose-a:border-stone-400 prose-a:transition-colors
                  prose-strong:text-stone-900 dark:prose-strong:text-stone-100 prose-strong:font-semibold
                  prose-code:text-orange-700 dark:prose-code:text-amber-400 prose-code:bg-stone-200 dark:prose-code:bg-stone-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-stone-300 dark:prose-code:border-stone-600 prose-code:before:content-none prose-code:after:content-none prose-code:font-mono prose-code:text-sm
                  prose-pre:bg-stone-900 dark:prose-pre:bg-stone-950 prose-pre:border prose-pre:border-stone-800 dark:prose-pre:border-stone-800 prose-pre:rounded-lg prose-pre:p-4
                  prose-blockquote:border-l-2 prose-blockquote:border-stone-300 dark:prose-blockquote:border-stone-700 prose-blockquote:text-stone-600 dark:prose-blockquote:text-stone-400 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:not-italic
                  prose-hr:border-stone-200 dark:prose-hr:border-stone-800 prose-hr:my-8
                  prose-ul:${themeConfig.prose.listColor.light} dark:prose-ul:${themeConfig.prose.listColor.dark} prose-ul:list-disc prose-ul:pl-5
                  prose-ol:${themeConfig.prose.listColor.light} dark:prose-ol:${themeConfig.prose.listColor.dark} prose-ol:list-decimal prose-ol:pl-5
                  prose-li:${themeConfig.prose.listColor.light} dark:prose-li:${themeConfig.prose.listColor.dark} prose-li:mb-1
                  prose-img:rounded-lg`}
                dangerouslySetInnerHTML={{ __html: post.content || '' }}
              />
            </div>

            {/* Comments */}
            <div className="mt-12 pt-8 border-t border-stone-200 dark:border-stone-800">
              <Comments />
            </div>
          </article>

          {/* Table of Contents */}
          {post.toc && post.toc.length > 0 && (
            <aside className="hidden xl:block fixed right-8 top-24 w-48">
              <TableOfContents items={post.toc} />
            </aside>
          )}
        </div>

        {/* Footer navigation */}
        <div className={`${themeConfig.spacing.container} mx-auto px-5 mt-12`}>
          <Link 
            href="/"
            className={`inline-flex items-center text-sm ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary} hover:text-stone-700 dark:hover:text-stone-200 ${themeConfig.animations.transition}`}
          >
            <svg 
              className="w-4 h-4 mr-1" 
              fill="none" 
              strokeWidth="2" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M19 12H5M5 12l7 7M5 12l7-7" />
            </svg>
            All posts
          </Link>
        </div>
      </main>
    </div>
  );
}
