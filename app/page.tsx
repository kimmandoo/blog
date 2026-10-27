import type { Metadata } from 'next';
import { getSortedPostsData, getAllCategories, getAllTags } from '@/lib/posts';
import { PostList } from '@/components/PostList';
import { ProfileSidebar } from '@/components/ProfileSidebar';
import { WebSiteJsonLd } from '@/components/JsonLd';
import { createHomePageMetadata, getSearchParamValue } from '@/lib/metadata';
import { parsePageParam } from '@/lib/pagination';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[]; tag?: string | string[]; page?: string | string[] }>;
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
  const allCategories = getAllCategories();
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

  return (
    <div className="archive-layout">
      <WebSiteJsonLd />
      <main className="archive-shell">
        <h1 className="sr-only">글 목록</h1>
        <PostList 
          key={`${selectedCategory ?? ''}:${selectedTag ?? ''}:${selectedPage}:${searchQuery}`}
          initialSearchQuery={searchQuery}
          initialPosts={posts}
          allCategories={allCategories}
          allTags={allTags}
          selectedCategory={selectedCategory}
          selectedTag={selectedTag}
          currentPage={selectedPage}
        />
      </main>
      <ProfileSidebar />
    </div>
  );
}
