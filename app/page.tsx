import type { Metadata } from 'next';
import { getSortedPostsData, getAllTags } from '@/lib/posts';
import { PostList } from '@/components/PostList';
import { ProfileSidebar } from '@/components/ProfileSidebar';
import { WebSiteJsonLd } from '@/components/JsonLd';
import { createHomePageMetadata, getSearchParamValue } from '@/lib/metadata';
import { parsePageParam } from '@/lib/pagination';
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

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[]; tag?: string | string[]; page?: string | string[]; q?: string | string[] }>;
}) {
  const { category, tag, page, q } = await searchParams;
  const searchQuery = getSearchParamValue(q) ?? '';
  const selectedCategory = getSearchParamValue(category);
  const selectedTag = getSearchParamValue(tag);
  const selectedPage = parsePageParam(page);
  const allPosts = getSortedPostsData();
  const categoryCounts = new Map<string, number>();
  for (const post of allPosts) {
    if (post.category) {
      categoryCounts.set(post.category, (categoryCounts.get(post.category) ?? 0) + 1);
    }
  }
  const categories = Array.from(categoryCounts, ([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const allTags = getAllTags();
  
  // Filter posts based on category or tag
  const posts = allPosts.filter(post => {
    if (selectedCategory && post.category !== selectedCategory) {
      return false;
    }
    if (selectedTag && (!post.tags || !post.tags.includes(selectedTag))) {
      return false;
    }
    return true;
  });
  const graph = getPostGraph();

  return (
    <div>
      <WebSiteJsonLd />
        <PostList 
          key={`${selectedCategory ?? ''}:${selectedTag ?? ''}:${selectedPage}:${searchQuery}`}
          initialSearchQuery={searchQuery}
          initialPosts={posts}
          categories={categories}
          totalPosts={allPosts.length}
          profile={<ProfileSidebar />}
          graph={<PostGraph graph={graph} positions={layoutPostGraph(graph)} />}
          allTags={allTags}
          selectedCategory={selectedCategory}
          selectedTag={selectedTag}
          currentPage={selectedPage}
        />
    </div>
  );
}
