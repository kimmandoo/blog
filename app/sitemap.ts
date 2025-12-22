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
  const getLastModified = (items: { date?: string }[]) => {
    const date = items[0]?.date;
    if (!date) return now;
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? now : parsed;
  };

  const postUrls = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const psUrls = psPosts.map((post) => ({
    url: `${baseUrl}/ps/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const androidUrls = androidPosts.map((post) => ({
    url: `${baseUrl}/androidcs/${post.slug}`,
    lastModified: new Date(post.date),
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
