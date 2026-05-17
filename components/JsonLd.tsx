'use client';

import { themeConfig } from '@/config/theme.config';

const { seo, site } = themeConfig;
const baseUrl = seo.siteUrl.replace(/\/+$/, '');

type ArticleJsonLdProps = {
  title: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
  tags?: string[];
  image?: string;
};

export function ArticleJsonLd({
  title,
  description,
  url,
  datePublished,
  dateModified,
  author,
  tags,
  image,
}: ArticleJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified: dateModified || datePublished }),
    ...(image && {
      image: {
        '@type': 'ImageObject',
        url: image,
      },
    }),
    author: {
      '@type': 'Person',
      name: author || site.title,
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: site.title,
      url: baseUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    ...(tags && tags.length > 0 && { keywords: tags.join(', ') }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebSiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.title,
    description: site.description,
    url: baseUrl,
    publisher: {
      '@type': 'Organization',
      name: site.title,
      url: baseUrl,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/?category={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

type BreadcrumbItem = {
  name: string;
  url: string;
};

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
