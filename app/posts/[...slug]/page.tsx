import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getPostData, getAllPostSlugs, getAdjacentPosts } from '@/lib/posts';
import { Comments } from '@/components/Comments';
import { CodeBlockEnhancer } from '@/components/CodeBlock';
import { MermaidRenderer } from '@/components/MermaidRenderer';
import { TableOfContents } from '@/components/TableOfContents';
import { ReadingProgressBar } from '@/components/ReadingProgressBar';
import { ShareButtons } from '@/components/ShareButtons';
import { PostNavigation } from '@/components/PostNavigation';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd';
import { themeConfig } from '@/config/theme.config';
import { formatDisplayDate, toMetadataDate } from '@/lib/date';

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
    const publishedTime = toMetadataDate(post.date);
    
    // Use the first image from the post content if available, otherwise auto-generate
    let ogImageUrl: string;
    if (post.firstImage) {
      // If the image is a relative path (starts with /), prepend the site URL
      // If it's already an absolute URL (http/https), use it as-is
      if (post.firstImage.startsWith('http://') || post.firstImage.startsWith('https://')) {
        ogImageUrl = post.firstImage;
      } else if (post.firstImage.startsWith('/')) {
        ogImageUrl = `${seo.siteUrl}${post.firstImage}`;
      } else {
        // Relative path without leading slash, prepend site URL with /
        ogImageUrl = `${seo.siteUrl}/${post.firstImage}`;
      }
    } else {
      // Auto-generate OG image with post metadata
      const ogParams = new URLSearchParams({
        title: post.title,
        ...(post.category && { category: post.category }),
        ...(post.date && { date: post.date }),
        ...(post.tags?.length && { tags: post.tags.join(',') }),
      });
      ogImageUrl = `${seo.siteUrl}/og?${ogParams.toString()}`;
    }
    
    return {
      title: post.title,
      description: post.excerpt || post.title,
      keywords: post.tags || [],
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      openGraph: {
        type: 'article',
        locale: seo.openGraph.locale,
        url: postUrl,
        siteName: seo.openGraph.siteName,
        title: post.title,
        description: post.excerpt || post.title,
        ...(publishedTime && { publishedTime }),
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

  // Get adjacent posts for navigation
  const { previous: previousPost, next: nextPost } = getAdjacentPosts(slugString);
  
  // Generate full URL for sharing
  const postUrl = `${themeConfig.seo.siteUrl}/posts/${slugString}`;

  // Build OG image URL for JSON-LD
  let jsonLdImage: string | undefined;
  if (post.firstImage) {
    if (post.firstImage.startsWith('http://') || post.firstImage.startsWith('https://')) {
      jsonLdImage = post.firstImage;
    } else if (post.firstImage.startsWith('/')) {
      jsonLdImage = `${themeConfig.seo.siteUrl}${post.firstImage}`;
    } else {
      jsonLdImage = `${themeConfig.seo.siteUrl}/${post.firstImage}`;
    }
  }

  const baseUrl = themeConfig.seo.siteUrl.replace(/\/+$/, '');

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeConfig.colors.light.background.primary} ${themeConfig.colors.dark.background.primary}`}>
      {/* JSON-LD Structured Data */}
      <ArticleJsonLd
        title={post.title}
        description={post.excerpt || post.title}
        url={postUrl}
        datePublished={toMetadataDate(post.date) ?? undefined}
        dateModified={toMetadataDate(post.date) ?? undefined}
        tags={post.tags}
        image={jsonLdImage}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: baseUrl },
          ...(post.category ? [{ name: post.category, url: `${baseUrl}/?category=${encodeURIComponent(post.category)}` }] : []),
          { name: post.title, url: postUrl },
        ]}
      />

      {/* Reading Progress Bar */}
      <ReadingProgressBar readingTime={post.readingTime} />
      
      <main className="mx-auto px-6 py-16">
        <div className={`${themeConfig.spacing.container} mx-auto mb-12`}>
          <Link 
            href="/"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-300 transition-all group"
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
            <span className="font-medium">전체 글로</span>
          </Link>
        </div>

        {/* Content layout with ToC positioned absolutely to not affect content width */}
        <div className={`relative ${themeConfig.spacing.postWidth} mx-auto`}>
            {/* Main content area - always centered with same width */}
            <article>
          <header className={`mx-auto max-w-3xl pb-10 mb-10 ${themeConfig.colors.light.border.secondary} ${themeConfig.colors.dark.border.secondary} border-b`}>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <time
                dateTime={toMetadataDate(post.date) ?? post.date}
                className={`text-sm ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}
              >
                {formatDisplayDate(post.date)}
              </time>
              {post.readingTime && (
                <span className={`text-sm ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}>
                  · {post.readingTime}분
                </span>
              )}
              {post.category && (
                <span className="text-xs px-2 py-0.5 rounded-full border border-gray-200/80 bg-white/70 text-gray-600 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-300">
                  {post.category}
                </span>
              )}
            </div>
            <h1 className="break-words text-3xl sm:text-4xl md:text-5xl font-bold text-gray-950 dark:text-white mb-4 leading-tight tracking-tight">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className={`mt-5 max-w-2xl border-l-2 border-rose-200/70 pl-4 text-lg ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} leading-relaxed dark:border-rose-900/60`}>
                {post.excerpt}
              </p>
            )}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map((tag) => (
                  <span key={tag} className={`text-sm ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {post.toc && post.toc.length > 0 && (
            <details className="mb-8 rounded-lg border border-gray-200/80 bg-white/70 p-4 dark:border-gray-800 dark:bg-gray-900/50 xl:hidden">
              <summary className="cursor-pointer list-none text-sm font-semibold text-gray-700 dark:text-gray-200 [&::-webkit-details-marker]:hidden">
                목차 보기
              </summary>
              <TableOfContents items={post.toc} compact />
            </details>
          )}

          <div>
            <CodeBlockEnhancer />
            <MermaidRenderer />
            
            <div 
              className={`prose ${themeConfig.prose.size} dark:prose-invert max-w-none
                prose-headings:break-words prose-headings:font-semibold prose-headings:text-black dark:prose-headings:text-white prose-headings:scroll-mt-20
                prose-h1:${themeConfig.prose.h1} prose-h1:mb-6 prose-h1:mt-12
                prose-h2:${themeConfig.prose.h2} prose-h2:mb-5 prose-h2:mt-12 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-gray-800
                prose-h3:${themeConfig.prose.h3} prose-h3:mb-4 prose-h3:mt-10
                prose-h4:${themeConfig.prose.h4} prose-h4:mb-2 prose-h4:mt-6
                prose-p:${themeConfig.prose.paragraphColor.light} dark:prose-p:${themeConfig.prose.paragraphColor.dark} prose-p:leading-8 prose-p:mb-7
                prose-a:text-rose-600 dark:prose-a:text-rose-300 prose-a:font-medium prose-a:no-underline prose-a:border-b prose-a:border-rose-200 dark:prose-a:border-rose-900/70 hover:prose-a:border-rose-500 dark:hover:prose-a:border-rose-300 prose-a:transition-colors
                prose-strong:text-black dark:prose-strong:text-white prose-strong:font-bold
                prose-blockquote:border-l-2 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-700 prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400 prose-blockquote:pl-4 prose-blockquote:italic
                prose-hr:border-gray-200 dark:prose-hr:border-gray-800 prose-hr:my-8
                prose-ul:${themeConfig.prose.listColor.light} dark:prose-ul:${themeConfig.prose.listColor.dark} prose-ul:list-disc prose-ul:pl-6
                prose-ol:${themeConfig.prose.listColor.light} dark:prose-ol:${themeConfig.prose.listColor.dark} prose-ol:list-decimal prose-ol:pl-6
                prose-li:${themeConfig.prose.listColor.light} dark:prose-li:${themeConfig.prose.listColor.dark} prose-li:mb-2
                prose-img:rounded-lg prose-img:mx-auto prose-img:block`}
              dangerouslySetInnerHTML={{ __html: post.content || '' }}
            />
          </div>

          {/* Share Buttons */}
          <div className={`py-6 ${themeConfig.colors.light.border.secondary} ${themeConfig.colors.dark.border.secondary} border-t`}>
            <ShareButtons title={post.title} url={postUrl} />
          </div>

          {/* Post Navigation */}
          <PostNavigation 
            previousPost={previousPost ? { slug: previousPost.slug, title: previousPost.title, category: previousPost.category, readingTime: previousPost.readingTime } : null}
            nextPost={nextPost ? { slug: nextPost.slug, title: nextPost.title, category: nextPost.category, readingTime: nextPost.readingTime } : null}
          />

          {/* Comments Section */}
          <div className={`pt-8 mt-8 ${themeConfig.colors.light.border.secondary} ${themeConfig.colors.dark.border.secondary} border-t`}>
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
        className={`inline-flex items-center px-6 py-3 ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} hover:text-rose-600 dark:hover:text-rose-300 ${themeConfig.animations.transition}`}
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
        홈으로
      </Link>
    </div>
  </main>
</div>
  );
}
