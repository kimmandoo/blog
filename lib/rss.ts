import { PostData } from './posts';
import { themeConfig } from '@/config/theme.config';
import { parseDateValue } from './date';

/**
 * Escapes XML special characters to prevent XML injection attacks
 * @param str - The string to escape
 * @returns The escaped string safe for use in XML
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getRssDescription(post: PostData): string {
  return post.excerpt?.trim() || post.title;
}

function getLatestPostDate(posts: PostData[]): Date {
  return posts.reduce((latest, post) => {
    const parsed = parseDateValue(post.date);
    if (!parsed) {
      return latest;
    }

    return parsed.getTime() > latest.getTime() ? parsed : latest;
  }, parseDateValue(posts[0]?.date) ?? new Date());
}

/**
 * Generates an RSS 2.0 feed from blog posts
 * 
 * The feed includes:
 * - Channel metadata (title, description, language)
 * - Post items with title, link, publication date, description, and tags
 * - Autodiscovery link for RSS readers
 * 
 * All content is properly escaped to prevent XML injection.
 * 
 * @param posts - Array of post data to include in the feed
 * @returns RSS 2.0 XML string
 * 
 * @example
 * ```typescript
 * const posts = getSortedPostsData();
 * const rss = generateRssFeed(posts);
 * ```
 */
export function generateRssFeed(posts: PostData[]): string {
  const { site, seo } = themeConfig;
  const buildDate = getLatestPostDate(posts).toUTCString();
  
  // Extract language code from locale (e.g., 'ko_KR' -> 'ko')
  const language = seo.openGraph.locale.split('_')[0];

  // Generate RSS items for each post
  const rssItems = posts
    .map((post) => {
      const postUrl = `${seo.siteUrl}/posts/${post.slug}`;
      const pubDate = (parseDateValue(post.date) ?? new Date()).toUTCString();

      const title = escapeXml(post.title);
      const description = escapeXml(getRssDescription(post));
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

  // Generate complete RSS feed
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
