import { getSortedRustData } from '@/lib/rust';
import { PostList } from '@/components/PostList';
import { themeConfig } from '@/config/theme.config';
import { Navigation } from '@/components/Navigation';

export default async function RustPage() {
  const allItems = getSortedRustData();

  const allCategories = Array.from(new Set(allItems.map(item => item.category).filter((c): c is string => Boolean(c)))).sort();
  const allTags = Array.from(new Set(allItems.flatMap(item => item.tags || []))).sort();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeConfig.colors.light.background.primary} ${themeConfig.colors.dark.background.primary}`}>
      <main className={`${themeConfig.spacing.container} mx-auto px-6 ${themeConfig.spacing.section}`}>
        <header className="mb-8 text-center">
          <div className={`${themeConfig.typography.fontSize.title} ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} font-semibold`}>
            <h1>
              Rust A to Z
            </h1>
          </div>
          <p className={`${themeConfig.typography.fontSize.body} ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} font-light`}>
            The Rust Programming Language 공식 책의 흐름을 기준으로, 챕터별로 다시 쓴 학습 노트
          </p>
        </header>

        <Navigation />

        <PostList
          initialPosts={allItems}
          allCategories={allCategories}
          allTags={allTags}
          basePath="/rust"
        />
      </main>
    </div>
  );
}
