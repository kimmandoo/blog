import type { Metadata } from 'next';
import { themeConfig } from '../config/theme.config.ts';
import { toMetadataDate } from './date.ts';
import type { PostData } from './posts.ts';

const baseSiteUrl = themeConfig.seo.siteUrl.replace(/\/+$/, '');

export function toAbsolutePageUrl(pathname: string) {
  const normalizedPath = pathname === '/' ? '/' : `/${pathname.replace(/^\/+/, '')}`;
  return new URL(normalizedPath, `${baseSiteUrl}/`).toString();
}

type PageMetadataOptions = {
  canonicalPath: string;
  description?: string;
  title?: string;
};

export function createPageMetadata({
  canonicalPath,
  description = themeConfig.site.description,
  title = themeConfig.site.title,
}: PageMetadataOptions): Metadata {
  const canonicalUrl = toAbsolutePageUrl(canonicalPath);
  const image = themeConfig.seo.openGraph.defaultImage;
  const imageUrl = image === '/og/index.png'
    ? getArticleImageUrl(canonicalPath)
    : /^https?:\/\//.test(image) ? image : toAbsolutePageUrl(image);

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      locale: themeConfig.seo.openGraph.locale,
      siteName: themeConfig.seo.openGraph.siteName,
      url: canonicalUrl,
      title,
      description,
      images: [{ url: imageUrl, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      site: themeConfig.seo.twitter.site || undefined,
      creator: themeConfig.seo.twitter.creator || undefined,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export function createHomePageMetadata(): Metadata {
  return createPageMetadata({
    canonicalPath: '/',
    description: themeConfig.site.description,
  });
}

export function createCodingTestPageMetadata(): Metadata {
  return createPageMetadata({
    title: 'PS',
    description: '코테 노트',
    canonicalPath: '/coding-test',
  });
}

type ArticleMetadataPost = Pick<PostData, 'title' | 'excerpt' | 'date' | 'updated' | 'tags'>;

export function getArticleImageUrl(canonicalPath: string) {
  const imagePath = canonicalPath === '/' ? '/index' : canonicalPath.replace(/\/+$/, '');
  return toAbsolutePageUrl(`/og${imagePath}.png`);
}

export function createArticleMetadata(post: ArticleMetadataPost, canonicalPath: string): Metadata {
  const description = post.excerpt || post.title;
  const imageUrl = getArticleImageUrl(canonicalPath);
  const publishedTime = toMetadataDate(post.date);
  const modifiedTime = toMetadataDate(post.updated);

  return {
    ...createPageMetadata({ title: post.title, description, canonicalPath }),
    keywords: post.tags || [],
    openGraph: {
      type: 'article',
      locale: themeConfig.seo.openGraph.locale,
      siteName: themeConfig.seo.openGraph.siteName,
      url: toAbsolutePageUrl(canonicalPath),
      title: post.title,
      description,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      authors: [themeConfig.site.author],
      tags: post.tags,
      images: [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: post.title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [imageUrl],
      site: themeConfig.seo.twitter.site || undefined,
      creator: themeConfig.seo.twitter.creator || undefined,
    },
  };
}
