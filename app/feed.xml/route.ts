import { getSortedPostsData } from '@/lib/posts';
import { generateRssFeed } from '@/lib/rss';
import { themeConfig } from '@/config/theme.config';

export async function GET() {
  // Check if RSS is enabled
  if (!themeConfig.rss.enabled) {
    return new Response('RSS feed is disabled', { status: 404 });
  }

  const allPosts = getSortedPostsData();
  
  // Limit posts if configured
  const posts = themeConfig.rss.maxItems > 0 
    ? allPosts.slice(0, themeConfig.rss.maxItems)
    : allPosts;
  
  const rss = generateRssFeed(posts);

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, max-age=${themeConfig.rss.cacheMaxAge}, s-maxage=${themeConfig.rss.cacheMaxAge}`,
    },
  });
}
