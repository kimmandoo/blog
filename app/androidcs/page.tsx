import { getSortedAndroidCSData } from '@/lib/androidcs';
import Link from 'next/link';
import { themeConfig } from '@/config/theme.config';
import { AndroidCSSidebar } from '@/components/AndroidCSSidebar';
import { ThemeToggle } from '@/components/ThemeToggle';

export default async function AndroidCSPage() {
  const allItems = getSortedAndroidCSData();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* GitBook-style Top Bar - Simpler and cleaner */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="h-16 px-6 flex items-center justify-between max-w-screen-2xl mx-auto">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {themeConfig.site.title}
              </span>
            </Link>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <Link href="/androidcs" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              AndroidCS
            </Link>
          </div>
          
          {/* Right: Theme Toggle and Back to Blog */}
          <div className="flex items-center gap-3">
            <ThemeToggle inline />
            <Link 
              href="/" 
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors border border-gray-200 dark:border-gray-700"
            >
              Blog
            </Link>
          </div>
        </div>
      </div>

      {/* GitBook-style Layout */}
      <div className="flex max-w-screen-2xl mx-auto">
        {/* Left Sidebar - Navigation */}
        <AndroidCSSidebar items={allItems} />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h1 className={`text-4xl font-bold ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} mb-4`}>
                안드로이드 CS 지식
              </h1>
              <p className={`text-lg ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary}`}>
                안드로이드 개발에 필요한 CS 지식을 체계적으로 정리한 문서입니다.
              </p>
            </div>

            {allItems.length === 0 ? (
              <div className="text-center py-16 px-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <p className={`${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} mb-6`}>
                  아직 작성된 문서가 없습니다. <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-mono text-sm">android-cs/</code> 디렉토리에 마크다운 파일을 추가해주세요.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                <h2 className={`text-2xl font-semibold ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} mb-6`}>
                  📚 전체 문서
                </h2>
                <div className="grid gap-4">
                  {allItems.map((item) => (
                    <Link 
                      key={item.slug} 
                      href={`/androidcs/${item.slug}`}
                      className="group block p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-900"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-xl font-semibold ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>
                            {item.title}
                          </h3>
                          {item.excerpt && (
                            <p className={`text-sm ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} line-clamp-2`}>
                              {item.excerpt}
                            </p>
                          )}
                          {(item.category || (item.tags && item.tags.length > 0)) && (
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              {item.category && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                  {item.category}
                                </span>
                              )}
                              {item.tags && item.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5 text-blue-500" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
