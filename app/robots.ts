import { MetadataRoute } from 'next';
import { themeConfig } from '@/config/theme.config';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = themeConfig.seo.siteUrl.replace(/\/+$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /_next/ stays crawlable: search engines need its CSS and JS to render pages.
        disallow: ['/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
