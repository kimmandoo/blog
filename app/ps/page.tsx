import { getSortedPSData } from '@/lib/ps';
import { PostList } from '@/components/PostList';
import { themeConfig } from '@/config/theme.config';
import { Navigation } from '@/components/Navigation';

export default async function PSPage() {
  const allItems = getSortedPSData();
  
  // Get all categories and tags from PS posts
  const allCategories = Array.from(new Set(allItems.map(item => item.category).filter((c): c is string => Boolean(c)))).sort();
  const allTags = Array.from(new Set(allItems.flatMap(item => item.tags || []))).sort();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeConfig.colors.light.background.primary} ${themeConfig.colors.dark.background.primary}`}>
      <main className={`${themeConfig.spacing.container} mx-auto px-6 pt-12 pb-8`}>
        <header className="mb-6 text-center">
          <h1 className={`text-2xl font-bold tracking-tight ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary}`}>
            Problem Solving
          </h1>
          <p className={`mt-1 text-sm ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}>
            알고리즘 문제 풀이 모음
          </p>
        </header>

        <Navigation />

        <PostList 
          initialPosts={allItems}
          allCategories={allCategories}
          allTags={allTags}
          basePath="/ps"
        />
      </main>
    </div>
  );
}
