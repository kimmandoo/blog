import { PostData } from './posts';
import { themeConfig } from '@/config/theme.config';

// Escape XML special characters to prevent XML injection
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateRssFeed(posts: PostData[]): string {
  const { site, seo } = themeConfig;
  const buildDate = new Date().toUTCString();
  
  // Extract language code from locale (e.g., 'ko_KR' -> 'ko')
  const language = seo.openGraph.locale.split('_')[0];

  const rssItems = posts
    .map((post) => {
      const postUrl = `${seo.siteUrl}/posts/${post.slug}`;
      const pubDate = new Date(post.date).toUTCString();

      const title = escapeXml(post.title);
      const description = escapeXml(post.excerpt || '');
      const escapedUrl = escapeXml(postUrl);
      const categories = post.tags?.map(tag => `    <category>${escapeXml(tag)}</category>`).join('\n') || '';

      return `  <item>
    <title>${title}</title>
    <link>${escapedUrl}</link>
    <guid>${escapedUrl}</guid>
    <pubDate>${pubDate}</pubDate>
    <description>${description}</description>
${categories}
  </item>`;
    })
    .join('\n');

  const escapedSiteUrl = escapeXml(seo.siteUrl);
  const escapedFeedUrl = escapeXml(`${seo.siteUrl}/feed.xml`);

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.title)}</title>
    <link>${escapedSiteUrl}</link>
    <description>${escapeXml(site.description)}</description>
    <language>${language}</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${escapedFeedUrl}" rel="self" type="application/rss+xml"/>
${rssItems}
  </channel>
</rss>`;
}
