import { getSortedAndroidCSData } from '@/lib/androidcs';
import Link from 'next/link';
import { format } from 'date-fns';
import { themeConfig } from '@/config/theme.config';
import { Navigation } from '@/components/Navigation';

export default async function AndroidCSPage() {
  const allItems = getSortedAndroidCSData();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeConfig.colors.light.background.primary} ${themeConfig.colors.dark.background.primary}`}>
      <main className={`${themeConfig.spacing.container} mx-auto px-6 ${themeConfig.spacing.section}`}>
        <header className="mb-8 text-center">
          <div className={`${themeConfig.typography.fontSize.title} ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} font-semibold`}>
            <h1> 
              {themeConfig.site.title} 
            </h1>
          </div>
          <p className={`${themeConfig.typography.fontSize.body} ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} font-light`}>
            {themeConfig.site.tagline}
          </p>
        </header>

        <Navigation />

        <div className="mb-8">
          <h2 className={`text-2xl font-bold ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} mb-4`}>
            안드로이드 CS 지식
          </h2>
          <p className={`${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary}`}>
            안드로이드 개발에 필요한 CS 지식을 위키 형식으로 정리했습니다.
          </p>
        </div>

        {/* Wiki-style list */}
        <div className="space-y-2">
          {allItems.length === 0 ? (
            <div className="text-center py-16">
              <p className={`${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} mb-6`}>
                아직 작성된 문서가 없습니다. <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-mono text-sm">android-cs/</code> 디렉토리에 마크다운 파일을 추가해주세요.
              </p>
            </div>
          ) : (
            allItems.map((item) => (
              <Link 
                key={item.slug} 
                href={`/androidcs/${item.slug}`}
                className={`block p-4 rounded-lg border ${themeConfig.colors.light.border.primary} ${themeConfig.colors.dark.border.primary} hover:${themeConfig.colors.light.border.secondary} hover:${themeConfig.colors.dark.border.secondary} ${themeConfig.animations.transition} hover:bg-gray-50 dark:hover:bg-gray-900/50`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} mb-1`}>
                      {item.title}
                    </h3>
                    {item.excerpt && (
                      <p className={`text-sm ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary}`}>
                        {item.excerpt}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {item.category && (
                        <span className={`text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}>
                          {item.category}
                        </span>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag) => (
                            <span key={tag} className={`text-xs ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <time className={`text-xs ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}>
                      {format(new Date(item.date), 'yyyy.MM.dd')}
                    </time>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
