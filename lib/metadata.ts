import type { Metadata } from 'next';
import { themeConfig } from '../config/theme.config.ts';
import { formatDisplayDate, toMetadataDate } from './date.ts';
import type { PostData } from './posts.ts';

type SearchParamValue = string | string[] | undefined;
type SearchParams = Record<string, SearchParamValue>;

const baseSiteUrl = themeConfig.seo.siteUrl.replace(/\/+$/, '');

export function getSearchParamValue(value: SearchParamValue) {
  const firstValue = Array.isArray(value) ? value[0] : value;
  const trimmedValue = firstValue?.trim();

  return trimmedValue ? trimmedValue : undefined;
}

export function hasActiveSearchFilter(searchParams: SearchParams, keys: string[]) {
  return keys.some((key) => getSearchParamValue(searchParams[key]));
}

export function toAbsolutePageUrl(pathname: string) {
  const normalizedPath = pathname === '/' ? '/' : `/${pathname.replace(/^\/+/, '')}`;
  return new URL(normalizedPath, `${baseSiteUrl}/`).toString();
}

type PageMetadataOptions = {
  canonicalPath: string;
  description?: string;
  noIndex?: boolean;
  title?: string;
};

export function createPageMetadata({
  canonicalPath,
  description = themeConfig.site.description,
  noIndex = false,
  title = themeConfig.site.title,
}: PageMetadataOptions): Metadata {
  const canonicalUrl = toAbsolutePageUrl(canonicalPath);
  const image = themeConfig.seo.openGraph.defaultImage;
  const imageUrl = image === '/og'
    ? toAbsolutePageUrl(`/og?${new URLSearchParams({ title, description, path: canonicalPath })}`)
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
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: true,
            googleBot: {
              index: false,
              follow: true,
              'max-video-preview': -1,
              'max-image-preview': 'large',
              'max-snippet': -1,
            },
          },
        }
      : {}),
  };
}

export function createHomePageMetadata(searchParams: SearchParams): Metadata {
  return createPageMetadata({
    canonicalPath: '/',
    description: themeConfig.site.description,
    noIndex: hasActiveSearchFilter(searchParams, ['q', 'category', 'tag', 'page']),
  });
}

export function createCodingTestPageMetadata(searchParams: SearchParams): Metadata {
  return createPageMetadata({
    title: 'PS',
    description: '코테 노트',
    canonicalPath: '/coding-test',
    noIndex: hasActiveSearchFilter(searchParams, ['language', 'tag']),
  });
}

type ArticleMetadataPost = Pick<PostData, 'title' | 'excerpt' | 'date' | 'category' | 'tags' | 'firstImage'>;

export function getArticleImageUrl(post: ArticleMetadataPost, canonicalPath: string) {
  const params = new URLSearchParams({
    title: post.title,
    site: new URL(baseSiteUrl).host,
    path: canonicalPath,
    ...(post.excerpt && { description: post.excerpt }),
    ...(post.category && { category: post.category }),
    ...(post.date && { date: formatDisplayDate(post.date) }),
    ...(post.tags?.length && { tags: post.tags.join(',') }),
  });
  return toAbsolutePageUrl(`/og?${params.toString()}`);
}

export function createArticleMetadata(post: ArticleMetadataPost, canonicalPath: string): Metadata {
  const description = post.excerpt || post.title;
  const imageUrl = getArticleImageUrl(post, canonicalPath);
  const publishedTime = toMetadataDate(post.date);

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
      authors: [themeConfig.site.title],
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
