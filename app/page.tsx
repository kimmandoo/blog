import { getSortedPostsData, getAllCategories, getAllTags } from '@/lib/posts';
import { PostList } from '@/components/PostList';
import { themeConfig } from '@/config/theme.config';

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
    if (selectedCategory && post.category !== selectedCategory) {
      return false;
    }
    if (selectedTag && (!post.tags || !post.tags.includes(selectedTag))) {
      return false;
    }
    return true;
  });

  return (
    <div className={`min-h-screen bg-gradient-to-b ${themeConfig.colors.light.background.primary} ${themeConfig.colors.dark.background.primary}`}>
      <main className={`${themeConfig.spacing.container} mx-auto px-5 ${themeConfig.spacing.section}`}>
        {/* Simple header */}
        <header className="mb-12">
          <h1 className={`${themeConfig.typography.fontSize.title} ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} font-medium tracking-tight`}>
            {themeConfig.site.title}
          </h1>
          <p className={`${themeConfig.typography.fontSize.small} ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary} mt-1`}>
            {themeConfig.site.tagline}
          </p>
        </header>

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
