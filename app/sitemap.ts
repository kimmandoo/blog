import { MetadataRoute } from 'next';
import { getSortedPostsData, getSortedPostsDataByCategory } from '@/lib/posts';
import { parseDateValue } from '@/lib/date';
import { toAbsolutePageUrl as toAbsoluteUrl } from '@/lib/metadata';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getSortedPostsData();
  const codingTestPosts = getSortedPostsDataByCategory('PS');
  const now = new Date();

  const encodeSlugPath = (slug: string) =>
    slug
      .split('/')
      .filter(Boolean)
      .map((segment) => encodeURIComponent(segment))
      .join('/');

  const getLastModified = (items: { date?: string; updated?: string }[], fallback: Date = now) => {
    let latest: Date | null = null;
    for (const item of items) {
      const parsed = parseDateValue(item?.updated ?? item?.date);
      if (parsed && (!latest || parsed.getTime() > latest.getTime())) {
        latest = parsed;
      }
    }
    return latest ?? fallback;
  };
  const siteLastModified = getLastModified([...posts, ...codingTestPosts]);

  const postUrls = posts.map((post) => ({
    url: toAbsoluteUrl(`/posts/${encodeSlugPath(post.slug)}`),
    lastModified: parseDateValue(post.updated ?? post.date) ?? siteLastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const codingTestUrls = codingTestPosts.map((post) => ({
    url: toAbsoluteUrl(`/coding-test/${encodeSlugPath(post.slug)}`),
    lastModified: parseDateValue(post.updated ?? post.date) ?? siteLastModified,
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
  ];

  const deduped = new Map<string, MetadataRoute.Sitemap[number]>();

  for (const entry of [...staticUrls, ...postUrls, ...codingTestUrls]) {
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
