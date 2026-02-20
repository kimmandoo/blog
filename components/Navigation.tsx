'use client';

import Link from 'next/link';

export function Navigation() {
  return (
    <div className="flex items-center justify-center gap-3 mb-6">
      <Link
        href="/androidcs"
        className="group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Android
        <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" fill="none" strokeWidth="2.5" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </Link>
      <Link
        href="/ps"
        className="group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 border border-gray-200 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        PS
        <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" fill="none" strokeWidth="2.5" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
