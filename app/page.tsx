import type { Metadata } from 'next';
import { getSortedPostsData, getAllCategories, getAllTags } from '@/lib/posts';
import { PostList } from '@/components/PostList';
import { themeConfig } from '@/config/theme.config';
import { Navigation } from '@/components/Navigation';
import { SocialLinks } from '@/components/SocialLinks';
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
    <div className={`min-h-screen bg-gradient-to-br ${themeConfig.colors.light.background.primary} ${themeConfig.colors.dark.background.primary}`}>
      <WebSiteJsonLd />
      <main className="home-shell mx-auto max-w-4xl px-5 pb-16 pt-20 sm:px-8 sm:pt-16">
        <header className="home-header">
          <p className="mb-3 text-xs font-semibold tracking-widest text-rose-600 dark:text-rose-300">DEVELOPMENT JOURNAL</p>
          <h1 className="site-brand text-4xl font-bold text-gray-950 dark:text-white sm:text-5xl">
            <span>{themeConfig.site.title}</span>
          </h1>
          <p className={`mt-3 text-base ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary}`}>
            {themeConfig.site.tagline}
          </p>
          <div className="home-links mt-5 flex flex-wrap items-center justify-between gap-3">
            <SocialLinks />
            <Navigation />
          </div>
        </header>

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
    </div>
  );
}
