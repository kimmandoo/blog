import { getSortedAndroidCSData } from '@/lib/androidcs';
import Link from 'next/link';
import { themeConfig } from '@/config/theme.config';
import { AndroidCSSidebar } from '@/components/AndroidCSSidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AndroidCSList } from '@/components/AndroidCSList';
import { AndroidCSStats } from '@/components/AndroidCSStats';

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
              Android
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
                안드로이드
              </h1>
              <p className={`text-lg ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} mb-6`}>
                안드로이드 개발에 필요한 지식을 개인적으로 정리한 장소입니다.
              </p>

              {/* Statistics Dashboard */}
              <AndroidCSStats items={allItems} />
            </div>

            <AndroidCSList items={allItems} />
          </div>
        </main>
      </div>
    </div>
  );
}
