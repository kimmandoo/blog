import { MetadataRoute } from 'next';
import { themeConfig } from '@/config/theme.config';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = themeConfig.seo.siteUrl;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
