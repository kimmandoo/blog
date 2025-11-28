'use client';

import { useState, useEffect, useRef } from 'react';
import { themeConfig } from '@/config/theme.config';

interface SearchModalProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchModal({ onSearch, placeholder = "Search posts..." }: SearchModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, onSearch]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Handle Cmd/Ctrl + K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Search Icon Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${themeConfig.animations.transition}`}
        aria-label="Search"
      >
        <svg 
          className="w-5 h-5 text-gray-600 dark:text-gray-400"
          fill="none" 
          strokeWidth="2" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="w-full max-w-xl mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg 
                  className="w-5 h-5 text-gray-400"
                  fill="none" 
                  strokeWidth="2" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-12 pr-12 py-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none text-lg"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 rounded">
                  ESC
                </kbd>
              </div>
            </div>

            {/* Search hint */}
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500">
              Search by title, excerpt, category, or tags
            </div>
          </div>
        </div>
      )}
    </>
  );
}
