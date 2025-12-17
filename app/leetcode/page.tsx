import { getSortedLeetCodeData } from '@/lib/leetcode';
import Link from 'next/link';
import { themeConfig } from '@/config/theme.config';
import { Navigation } from '@/components/Navigation';
import { format } from 'date-fns';

export default async function LeetCodePage() {
  const allItems = getSortedLeetCodeData();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeConfig.colors.light.background.primary} ${themeConfig.colors.dark.background.primary}`}>
      <main className={`${themeConfig.spacing.container} mx-auto px-6 ${themeConfig.spacing.section}`}>
        <header className="mb-8 text-center">
          <div className={`${themeConfig.typography.fontSize.title} ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} font-semibold`}>
            <h1> 
              LeetCode Solutions
            </h1>
          </div>
          <p className={`${themeConfig.typography.fontSize.body} ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} font-light`}>
            리트코드 문제 풀이 모음
          </p>
        </header>

        <Navigation />

        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {allItems.length === 0 ? (
              <p className={`text-center ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary}`}>
                No LeetCode posts yet.
              </p>
            ) : (
              allItems.map((item) => (
                <article
                  key={item.slug}
                  className={`${themeConfig.colors.light.background.card} ${themeConfig.colors.dark.background.card} rounded-lg p-6 ${themeConfig.colors.light.border.primary} ${themeConfig.colors.dark.border.primary} border hover:shadow-lg ${themeConfig.animations.transition}`}
                >
                  <Link href={`/leetcode/${item.slug}`}>
                    <h2 className={`text-2xl font-bold ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} mb-2 hover:underline`}>
                      {item.title}
                    </h2>
                  </Link>
                  
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <time className={`text-sm ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}>
                      {format(new Date(item.date), 'yyyy.MM.dd')}
                    </time>
                    {item.readingTime && (
                      <span className={`text-sm ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}>
                        · {item.readingTime} min read
                      </span>
                    )}
                  </div>

                  {item.excerpt && (
                    <p className={`${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} mb-4`}>
                      {item.excerpt}
                    </p>
                  )}

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary}`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
