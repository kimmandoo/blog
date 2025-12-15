'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AndroidCSData } from '@/lib/androidcs';
import { useState } from 'react';

interface AndroidCSSidebarProps {
  items: AndroidCSData[];
  currentSlug?: string;
}

export function AndroidCSSidebar({ items, currentSlug }: AndroidCSSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || '기타';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, AndroidCSData[]>);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="lg:hidden fixed bottom-4 left-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
          {isCollapsed ? (
            <path d="M4 6h16M4 12h16M4 18h16" />
          ) : (
            <path d="M6 18L18 6M6 6l12 12" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:sticky top-[64px] left-0 h-[calc(100vh-64px)] 
          w-72 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800
          overflow-y-auto transition-transform duration-300 z-40
          ${isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
        `}
      >
        <div className="p-6">
          <div className="mb-6">
            <Link 
              href="/androidcs"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                pathname === '/androidcs'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <svg className="w-5 h-5" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>홈</span>
            </Link>
          </div>

          {/* Navigation by Category */}
          <nav className="space-y-6">
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <div key={category}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 px-3">
                  {category}
                </h3>
                <ul className="space-y-1">
                  {categoryItems.map((item) => {
                    const itemPath = `/androidcs/${item.slug}`;
                    const isActive = pathname === itemPath || currentSlug === item.slug;
                    
                    return (
                      <li key={item.slug}>
                        <Link
                          href={itemPath}
                          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="truncate">{item.title}</span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
}
