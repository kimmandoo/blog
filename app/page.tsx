import { getSortedPostsData, getAllCategories, getAllTags } from '@/lib/posts';
import { PostList } from '@/components/PostList';
import { themeConfig } from '@/config/theme.config';
import { Navigation } from '@/components/Navigation';
import { SocialLinks } from '@/components/SocialLinks';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string }>;
}) {
  const { category: selectedCategory, tag: selectedTag } = await searchParams;
  const allPosts = getSortedPostsData();
  const allCategories = getAllCategories();
  const allTags = getAllTags();
  
  // Filter posts based on category or tag
  const posts = allPosts.filter(post => {
    // Exclude PS posts from main blog
    if (post.category === 'PS') {
      return false;
    }
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
      <main className={`${themeConfig.spacing.container} mx-auto px-6 pt-12 pb-8`}>
        <header className="mb-4 text-center">
          <h1 className={`text-2xl font-bold tracking-tight ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary}`}>
            {themeConfig.site.title}
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
        />
      </main>
    </div>
  );
}
