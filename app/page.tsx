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
  searchParams: Promise<{ category?: string | string[]; tag?: string | string[]; page?: string | string[] }>;
}) {
  const { category, tag, page } = await searchParams;
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
      <main className={`${themeConfig.spacing.container} mx-auto px-6 pt-8 sm:pt-12 pb-8`}>
        <header className="mb-4 text-center">
          <h1 className="site-brand mx-auto text-2xl font-bold text-black dark:text-white">
            <span>{themeConfig.site.title}</span>
          </h1>
          <p className={`mt-1 text-sm ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}>
            {themeConfig.site.tagline}
          </p>
        </header>

        <SocialLinks />

        <Navigation />

        <PostList 
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
