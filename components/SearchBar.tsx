'use client';

import { useState, useEffect } from 'react';
import { themeConfig } from '@/config/theme.config';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = "Search posts..." }: SearchBarProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, onSearch]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <svg 
          className={`w-4 h-4 ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}
          fill="none" 
          strokeWidth="2" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-10 pr-4 py-2.5 text-sm ${themeConfig.colors.light.background.card} ${themeConfig.colors.dark.background.card} border border-gray-200 dark:border-gray-800 rounded-lg ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10 focus:border-transparent ${themeConfig.animations.transition}`}
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          className={`absolute inset-y-0 right-0 pr-3.5 flex items-center ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary} hover:text-black dark:hover:text-white ${themeConfig.animations.transition}`}
        >
          <svg className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
