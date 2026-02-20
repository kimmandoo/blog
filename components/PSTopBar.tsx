'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { themeConfig } from '@/config/theme.config';

export function PSTopBar() {
  return (
    <div className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
      <div className="h-16 px-6 flex items-center justify-between max-w-screen-2xl mx-auto">
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
  );
}
