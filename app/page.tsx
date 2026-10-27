import type { Metadata } from 'next';
import { connection } from 'next/server';
import { getSortedPostsData, getAllTags } from '@/lib/posts';
import { PostList } from '@/components/PostList';
import { ProfileSidebar } from '@/components/ProfileSidebar';
import { WebSiteJsonLd } from '@/components/JsonLd';
import { createHomePageMetadata } from '@/lib/metadata';
import { PostGraph } from '@/components/PostGraph';
import { getPostGraph } from '@/lib/postGraph';
import { layoutPostGraph } from '@/lib/postGraphLayout';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[]; tag?: string | string[]; page?: string | string[]; q?: string | string[] }>;
}): Promise<Metadata> {
  return createHomePageMetadata(await searchParams);
}

export default async function Home() {
  // Direct filter URLs still render their selected results and metadata on the server.
  await connection();
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
