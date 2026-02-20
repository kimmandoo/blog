'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PSData } from '@/lib/ps';
import { useState } from 'react';

interface PSSidebarProps {
  items: PSData[];
  currentSlug?: string;
}

export function PSSidebar({ items, currentSlug }: PSSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  
  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || '기타';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, PSData[]>);

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="lg:hidden fixed bottom-4 left-4 z-50 p-3 bg-emerald-600 text-white rounded-full shadow-lg"
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
              href="/ps"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                pathname === '/ps'
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-medium'
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
          <nav className="space-y-4">
            {Object.entries(groupedItems).map(([category, categoryItems]) => {
              const isCategoryCollapsed = collapsedCategories[category];
              
              return (
                <div key={category}>
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-2">
                      <span>{category}</span>
                      <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                        {categoryItems.length}
                      </span>
                    </div>
                    <svg 
                      className={`w-4 h-4 transition-transform ${isCategoryCollapsed ? '' : 'rotate-180'}`}
                      fill="none" 
                      strokeWidth="2" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {!isCategoryCollapsed && (
                    <ul className="space-y-1 mt-2">
                      {categoryItems.map((item) => {
                        const itemPath = `/ps/${item.slug}`;
                        const isActive = pathname === itemPath || currentSlug === item.slug;
                        
                        return (
                          <li key={item.slug}>
                            <Link
                              href={itemPath}
                              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                                isActive
                                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-medium'
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
                  )}
                </div>
              );
            })}
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
