import { MetadataRoute } from 'next';
import { getSortedPostsData } from '@/lib/posts';
import { themeConfig } from '@/config/theme.config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = themeConfig.seo.siteUrl;
  const posts = getSortedPostsData();

  const postUrls = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...postUrls,
  ];
}
