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
          <h2 className={`${themeConfig.typography.fontSize.heading} ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} font-semibold mb-6`}>
            문제 풀이 사이트
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {themeConfig.problemSolvingSites.map((site) => (
              <a
                key={site.name}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${themeConfig.colors.light.background.card} ${themeConfig.colors.dark.background.card} ${themeConfig.colors.light.background.cardHover} ${themeConfig.colors.dark.background.cardHover} border ${themeConfig.colors.light.border.primary} ${themeConfig.colors.dark.border.primary} ${themeConfig.spacing.card} ${themeConfig.borderRadius.card} ${themeConfig.animations.transition} hover:shadow-lg`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{site.icon}</span>
                  <div className="flex-1">
                    <h3 className={`${themeConfig.typography.fontSize.subheading} ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} font-semibold mb-1`}>
                      {site.name}
                    </h3>
                    <p className={`${themeConfig.typography.fontSize.small} ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary}`}>
                      {site.description}
                    </p>
                  </div>
                  <svg 
                    className={`w-5 h-5 ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
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
