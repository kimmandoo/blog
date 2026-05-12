import type { Metadata } from 'next';
import { themeConfig } from '../config/theme.config.ts';

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
  title?: Metadata['title'];
};

export function createPageMetadata({
  canonicalPath,
  description,
  noIndex = false,
  title,
}: PageMetadataOptions): Metadata {
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: {
      canonical: toAbsolutePageUrl(canonicalPath),
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
    noIndex: hasActiveSearchFilter(searchParams, ['category', 'tag', 'page']),
  });
}

export function createCodingTestPageMetadata(searchParams: SearchParams): Metadata {
  return createPageMetadata({
    title: 'PS Thread',
    description: 'PS',
    canonicalPath: '/coding-test',
    noIndex: Boolean(getSearchParamValue(searchParams.tag)),
  });
}

export function createAndroidCsPageMetadata(): Metadata {
  return createPageMetadata({
    title: 'Android CS',
    canonicalPath: '/androidcs',
  });
}
