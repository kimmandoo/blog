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
    <div className={`min-h-screen bg-gradient-to-br ${themeConfig.colors.light.background.primary} ${themeConfig.colors.dark.background.primary}`}>
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-pink-200/30 to-rose-200/30 dark:from-pink-900/20 dark:to-rose-900/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-full blur-3xl" />
      </div>

      <main className={`${themeConfig.spacing.container} mx-auto px-6 ${themeConfig.spacing.section} relative z-10`}>
        <header className="mb-20 text-center">
          <div className="inline-block mb-4">
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100/80 to-purple-100/80 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-full border border-indigo-200/50 dark:border-indigo-700/50 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Active Blog</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-indigo-800 to-purple-800 dark:from-white dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent">
            {themeConfig.site.title}
          </h1>
          <p className={`${themeConfig.typography.fontSize.body} ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} font-light max-w-md mx-auto`}>
            {themeConfig.site.tagline}
          </p>
          <div className="mt-6 flex justify-center">
            <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full" />
          </div>
        </header>

        <PostList 
          initialPosts={posts}
          allCategories={allCategories}
          allTags={allTags}
          selectedCategory={selectedCategory}
          selectedTag={selectedTag}
        />

        {/* Footer */}
        <footer className="mt-20 pt-12 border-t border-slate-200/50 dark:border-slate-700/50 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">✨</span>
            <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              {themeConfig.site.title}
            </span>
          </div>
          <p className={`text-sm ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}>
            Built with Next.js • Styled with Tailwind CSS
          </p>
          <p className={`text-xs ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary} mt-2`}>
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
