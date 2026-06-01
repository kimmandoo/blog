import { themeConfig } from '@/config/theme.config';
import { getSortedPostsData } from '@/lib/posts';
import { generateRssFeed } from '@/lib/rss';

export const dynamic = 'force-static';
// Keep aligned with themeConfig.rss.cacheMaxAge; route config must be statically analyzable.
export const revalidate = 3600;

export async function GET() {
  if (!themeConfig.rss.enabled) {
    return new Response('RSS feed is disabled', { status: 404 });
  }

  const allPosts = getSortedPostsData();
  const posts = themeConfig.rss.maxItems > 0
    ? allPosts.slice(0, themeConfig.rss.maxItems)
    : allPosts;
  const rss = generateRssFeed(posts, '/rss');

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': `public, max-age=${themeConfig.rss.cacheMaxAge}, s-maxage=${themeConfig.rss.cacheMaxAge}`,
    },
  });
}
