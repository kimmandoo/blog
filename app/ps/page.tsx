import { getSortedPSData } from '@/lib/ps';
import Link from 'next/link';
import { themeConfig } from '@/config/theme.config';
import { PSSidebar } from '@/components/PSSidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PSList } from '@/components/PSList';
import { PSStats } from '@/components/PSStats';

export default async function PSPage() {
  const allItems = getSortedPSData();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Top Bar */}
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
            <Link href="/ps" className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
              PS
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

      {/* Layout */}
      <div className="flex max-w-screen-2xl mx-auto">
        {/* Left Sidebar */}
        <PSSidebar items={allItems} />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h1 className={`text-4xl font-bold ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} mb-4`}>
                Problem Solving
              </h1>
              <p className={`text-lg ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} mb-6`}>
                알고리즘 문제 풀이 모음
              </p>

              {/* Statistics Dashboard */}
              <PSStats items={allItems} />
            </div>

            <PSList items={allItems} />
          </div>
        </main>
      </div>
    </div>
  );
}
