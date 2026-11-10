import type { Metadata } from 'next';
import { themeConfig } from '../config/theme.config.ts';
import { toMetadataDate } from './date.ts';
import type { PostData } from './posts.ts';

const baseSiteUrl = themeConfig.seo.siteUrl.replace(/\/+$/, '');

// Pages are exported as <route>/index.html, so page URLs end with a slash; files (.png, .xml) do not.
export function toAbsolutePageUrl(pathname: string) {
  const trimmedPath = pathname.replace(/^\/+|\/+$/g, '');
  const isFile = /\.[a-z0-9]+$/i.test(trimmedPath);
  const normalizedPath = !trimmedPath ? '/' : `/${trimmedPath}${isFile ? '' : '/'}`;
  return new URL(normalizedPath, `${baseSiteUrl}/`).toString();
}

type PageMetadataOptions = {
  canonicalPath: string;
  description?: string;
  title?: string;
};

// Share cards are prerendered PNGs at /og/<page path>.png (the home page uses /og/home.png).
export function getOgImageUrl(canonicalPath: string) {
  const segments = canonicalPath.split('/').filter(Boolean);
  return toAbsolutePageUrl(`/og/${segments.length ? segments.join('/') : 'home'}.png`);
}

export function createPageMetadata({
  canonicalPath,
  description = themeConfig.site.description,
  title = themeConfig.site.title,
}: PageMetadataOptions): Metadata {
  const canonicalUrl = toAbsolutePageUrl(canonicalPath);
  const image = themeConfig.seo.openGraph.defaultImage;
  const imageUrl = image.startsWith('/og/')
    ? getOgImageUrl(canonicalPath)
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

// Filtered archive URLs (?q=, ?tag=, ...) are the same static file, so they share the root canonical.
export function createHomePageMetadata(): Metadata {
  return createPageMetadata({
    canonicalPath: '/',
    description: themeConfig.site.description,
  });
}

export const CODING_TEST_PAGE = { title: 'PS', description: '코테 노트' };

export function createCodingTestPageMetadata(): Metadata {
  return createPageMetadata({
    ...CODING_TEST_PAGE,
    canonicalPath: '/coding-test',
  });
}

type ArticleMetadataPost = Pick<PostData, 'title' | 'excerpt' | 'date' | 'updated' | 'category' | 'tags' | 'firstImage'>;

export function createArticleMetadata(post: ArticleMetadataPost, canonicalPath: string): Metadata {
  const description = post.excerpt || post.title;
  const imageUrl = getOgImageUrl(canonicalPath);
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
