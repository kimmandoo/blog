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
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition duration-500"></div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg 
            className={`w-5 h-5 ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary} group-focus-within:text-indigo-500 transition-colors`}
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
          className={`w-full pl-12 pr-4 py-4 ${themeConfig.colors.light.background.card} ${themeConfig.colors.dark.background.card} ${themeConfig.colors.light.border.primary} ${themeConfig.colors.dark.border.primary} border-2 ${themeConfig.borderRadius.card} ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 ${themeConfig.animations.transition}`}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className={`absolute inset-y-0 right-0 pr-4 flex items-center ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary} hover:text-indigo-500 dark:hover:text-indigo-400 ${themeConfig.animations.transition}`}
          >
            <svg className="w-5 h-5" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
