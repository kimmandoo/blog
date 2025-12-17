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
      <main className={`${themeConfig.spacing.container} mx-auto px-6 ${themeConfig.spacing.section}`}>
        <header className="mb-8 text-center">
          <div className={`${themeConfig.typography.fontSize.title} ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} font-semibold`}>
            <h1> 
              Problem Solving
            </h1>
          </div>
          <p className={`${themeConfig.typography.fontSize.body} ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} font-light`}>
            알고리즘 문제 풀이 모음
          </p>
        </header>

        <Navigation />

        {/* Problem Solving Sites Section */}
        <div className="mb-12">
          <h2 className={`${themeConfig.typography.fontSize.heading} ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} font-semibold mb-4`}>
            문제 풀이 사이트
          </h2>
          <ul className={`space-y-2 ${themeConfig.typography.fontSize.body}`}>
            {themeConfig.problemSolvingSites.map((site) => (
              <li key={site.name}>
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} hover:underline inline-flex items-center gap-2`}
                >
                  <span>{site.icon}</span>
                  <span>{site.name}</span>
                  <svg 
                    className="w-3 h-3 opacity-50" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>

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
