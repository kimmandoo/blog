import { MetadataRoute } from 'next';
import { themeConfig } from '@/config/theme.config';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = themeConfig.seo.siteUrl.replace(/\/+$/, '');

  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
