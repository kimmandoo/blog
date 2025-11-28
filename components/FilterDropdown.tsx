'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { CategoryBadge } from '@/components/CategoryBadge';
import { TagBadge } from '@/components/TagBadge';
import { themeConfig } from '@/config/theme.config';

interface FilterDropdownProps {
  allCategories: string[];
  allTags: string[];
  selectedCategory?: string;
  selectedTag?: string;
}

export function FilterDropdown({ allCategories, allTags, selectedCategory, selectedTag }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const hasFilters = allCategories.length > 0 || allTags.length > 0;
  const hasActiveFilter = selectedCategory || selectedTag;

  if (!hasFilters) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${themeConfig.animations.transition}`}
        aria-label="Filter"
      >
        <svg 
          className={`w-5 h-5 ${hasActiveFilter ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
          fill="none" 
          strokeWidth="2" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className={`text-sm font-medium ${hasActiveFilter ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
          Filter
        </span>
        {hasActiveFilter && (
          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          {/* Active Filter */}
          {hasActiveFilter && (
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Filter</span>
                <Link 
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear
                </Link>
              </div>
              <div className="mt-2">
                {selectedCategory && (
                  <CategoryBadge 
                    category={selectedCategory} 
                    index={allCategories.indexOf(selectedCategory)} 
                    clickable={false}
                  />
                )}
                {selectedTag && (
                  <TagBadge tag={selectedTag} clickable={false} />
                )}
              </div>
            </div>
          )}

          {/* Categories */}
          {allCategories.length > 0 && (
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-violet-500 rounded-full"></div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                  {themeConfig.text.categories}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((cat, index) => (
                  <div key={cat} onClick={() => setIsOpen(false)}>
                    <CategoryBadge category={cat} index={index} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-gradient-to-b from-gray-400 to-gray-600 dark:from-gray-500 dark:to-gray-300 rounded-full"></div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                  {themeConfig.text.tags}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {allTags.map((tag) => (
                  <div key={tag} onClick={() => setIsOpen(false)}>
                    <TagBadge tag={tag} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
