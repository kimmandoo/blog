'use client';

import Link from 'next/link';
import { BlockchainData } from '@/lib/blockchain';

interface BlockchainNavigationProps {
  allItems: BlockchainData[];
  currentSlug: string;
}

export function BlockchainNavigation({ allItems, currentSlug }: BlockchainNavigationProps) {
  const currentIndex = allItems.findIndex(item => item.slug === currentSlug);
  const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null;
  const nextItem = currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;

  if (!prevItem && !nextItem) {
    return null;
  }

  return (
    <nav className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 pt-12 border-t border-gray-800">
      {prevItem ? (
        <Link 
          href={`/blockchain/${prevItem.slug}`}
          className="group p-5 rounded-xl border border-gray-700/50 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 bg-gray-900/60"
        >
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <svg className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            <span>이전 문서</span>
          </div>
          <div className="text-base font-medium text-gray-200 group-hover:text-purple-400 transition-colors">
            {prevItem.title}
          </div>
          {prevItem.category && (
            <div className="text-xs text-gray-600 mt-1">{prevItem.category}</div>
          )}
        </Link>
      ) : (
        <div className="hidden md:block"></div>
      )}
      
      {nextItem ? (
        <Link 
          href={`/blockchain/${nextItem.slug}`}
          className="group p-5 rounded-xl border border-gray-700/50 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 bg-gray-900/60 text-right"
        >
          <div className="flex items-center justify-end gap-2 text-sm text-gray-500 mb-2">
            <span>다음 문서</span>
            <svg className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div className="text-base font-medium text-gray-200 group-hover:text-purple-400 transition-colors">
            {nextItem.title}
          </div>
          {nextItem.category && (
            <div className="text-xs text-gray-600 mt-1">{nextItem.category}</div>
          )}
        </Link>
      ) : (
        <div className="hidden md:block"></div>
      )}
    </nav>
  );
}
