import { MetadataRoute } from 'next';
import { getSortedAndroidCSData } from '@/lib/androidcs';
import { getSortedPostsData, getSortedPostsDataByCategory } from '@/lib/posts';
import { themeConfig } from '@/config/theme.config';
import { parseDateValue } from '@/lib/date';

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = themeConfig.seo.siteUrl.replace(/\/+$/, '');
  const posts = getSortedPostsData();
  const codingTestPosts = getSortedPostsDataByCategory('PS');
  const androidPosts = getSortedAndroidCSData();
  const now = new Date();

  const toAbsoluteUrl = (pathname: string) => {
    const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    return new URL(normalizedPath, `${baseUrl}/`).toString();
  };

  const encodeSlugPath = (slug: string) =>
    slug
      .split('/')
      .filter(Boolean)
      .map((segment) => encodeURIComponent(segment))
      .join('/');

  const getLastModified = (items: { date?: string }[], fallback: Date = now) => {
    let latest: Date | null = null;
    for (const item of items) {
      const parsed = parseDateValue(item?.date);
      if (parsed && (!latest || parsed.getTime() > latest.getTime())) {
        latest = parsed;
      }
    }
    return latest ?? fallback;
  };
  const siteLastModified = getLastModified([...posts, ...androidPosts, ...codingTestPosts]);

  const postUrls = posts.map((post) => ({
    url: toAbsoluteUrl(`/posts/${encodeSlugPath(post.slug)}`),
    lastModified: parseDateValue(post.date) ?? siteLastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const androidUrls = androidPosts.map((post) => ({
    url: toAbsoluteUrl(`/androidcs/${encodeSlugPath(post.slug)}`),
    lastModified: parseDateValue(post.date) ?? siteLastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const codingTestUrls = codingTestPosts.map((post) => ({
    url: toAbsoluteUrl(`/coding-test/${encodeSlugPath(post.slug)}`),
    lastModified: parseDateValue(post.date) ?? siteLastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: toAbsoluteUrl('/'),
      lastModified: siteLastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: toAbsoluteUrl('/coding-test'),
      lastModified: getLastModified(codingTestPosts, siteLastModified),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: toAbsoluteUrl('/androidcs'),
      lastModified: getLastModified(androidPosts, siteLastModified),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ];

  if (themeConfig.rss.enabled) {
    staticUrls.push({
      url: toAbsoluteUrl('/feed.xml'),
      lastModified: getLastModified(posts, siteLastModified),
      changeFrequency: 'daily',
      priority: 0.4,
    });
  }

  const deduped = new Map<string, MetadataRoute.Sitemap[number]>();

  for (const entry of [...staticUrls, ...postUrls, ...androidUrls, ...codingTestUrls]) {
    const existing = deduped.get(entry.url);
    if (!existing) {
      deduped.set(entry.url, entry);
      continue;
    }

    const existingTime = existing.lastModified ? new Date(existing.lastModified).getTime() : 0;
    const nextTime = entry.lastModified ? new Date(entry.lastModified).getTime() : 0;

    deduped.set(entry.url, {
      ...existing,
      ...entry,
      lastModified: nextTime > existingTime ? entry.lastModified : existing.lastModified,
      priority: Math.max(existing.priority ?? 0, entry.priority ?? 0),
    });
  }

  return Array.from(deduped.values());
}
