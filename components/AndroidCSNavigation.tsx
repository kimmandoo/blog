'use client';

import Link from 'next/link';
import { AndroidCSData } from '@/lib/androidcs';

interface AndroidCSNavigationProps {
  allItems: AndroidCSData[];
  currentSlug: string;
}

export function AndroidCSNavigation({ allItems, currentSlug }: AndroidCSNavigationProps) {
  const currentIndex = allItems.findIndex(item => item.slug === currentSlug);
  const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null;
  const nextItem = currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;

  if (!prevItem && !nextItem) {
    return null;
  }

  return (
    <nav className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 pt-12 border-t border-gray-200 dark:border-gray-800">
      {prevItem ? (
        <Link
          href={`/androidcs/${prevItem.slug}`}
          className="group flex flex-col gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            <span>이전 문서</span>
          </div>
          <div className="text-base font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {prevItem.title}
          </div>
          {prevItem.category && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {prevItem.category}
            </div>
          )}
        </Link>
      ) : (
        <div className="hidden md:block" aria-hidden="true"></div>
      )}

      {nextItem ? (
        <Link
          href={`/androidcs/${nextItem.slug}`}
          className="group flex flex-col gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all text-right md:text-right"
        >
          <div className="flex items-center justify-end gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>다음 문서</span>
            <svg className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div className="text-base font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {nextItem.title}
          </div>
          {nextItem.category && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {nextItem.category}
            </div>
          )}
        </Link>
      ) : (
        <div className="hidden md:block" aria-hidden="true"></div>
      )}
    </nav>
  );
}
