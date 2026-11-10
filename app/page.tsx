import type { Metadata } from 'next';
import { getSortedPostsData, getAllTags } from '@/lib/posts';
import { PostList } from '@/components/PostList';
import { ProfileSidebar } from '@/components/ProfileSidebar';
import { WebSiteJsonLd } from '@/components/JsonLd';
import { createHomePageMetadata } from '@/lib/metadata';
import { PostGraph } from '@/components/PostGraph';
import { getPostGraph } from '@/lib/postGraph';
import { layoutPostGraph } from '@/lib/postGraphLayout';

export const metadata: Metadata = createHomePageMetadata();

export default async function Home() {
  const allPosts = getSortedPostsData();
  const categoryCounts = new Map<string, number>();
  for (const post of allPosts) {
    if (post.category) {
      categoryCounts.set(post.category, (categoryCounts.get(post.category) ?? 0) + 1);
    }
  }
  const categories = Array.from(categoryCounts, ([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const allTags = getAllTags(allPosts);
  const graph = getPostGraph();

  return (
    <div>
      <WebSiteJsonLd />
        <PostList 
          initialPosts={allPosts}
          categories={categories}
          totalPosts={allPosts.length}
          profile={<ProfileSidebar />}
          graph={<PostGraph graph={graph} positions={layoutPostGraph(graph)} />}
          allTags={allTags}
        />
    </div>
  );
}
