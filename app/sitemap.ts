import { MetadataRoute } from 'next';
import { getSortedAndroidCSData } from '@/lib/androidcs';
import { getSortedPSData } from '@/lib/ps';
import { getSortedPostsData } from '@/lib/posts';
import { themeConfig } from '@/config/theme.config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = themeConfig.seo.siteUrl;
  const posts = getSortedPostsData();
  const psPosts = getSortedPSData();
  const androidPosts = getSortedAndroidCSData();
  const now = new Date();
  const parseDate = (value?: string | Date) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };
  const getLastModified = (items: { date?: string }[]) => {
    let latest: Date | null = null;
    for (const item of items) {
      const parsed = parseDate(item?.date);
      if (parsed && (!latest || parsed.getTime() > latest.getTime())) {
        latest = parsed;
      }
    }
    return latest ?? now;
  };

  const postUrls = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: parseDate(post.date) ?? now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const psUrls = psPosts.map((post) => ({
    url: `${baseUrl}/ps/${post.slug}`,
    lastModified: parseDate(post.date) ?? now,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const androidUrls = androidPosts.map((post) => ({
    url: `${baseUrl}/androidcs/${post.slug}`,
    lastModified: parseDate(post.date) ?? now,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/ps`,
      lastModified: getLastModified(psPosts),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/androidcs`,
      lastModified: getLastModified(androidPosts),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    ...postUrls,
    ...psUrls,
    ...androidUrls,
  ];
}
