'use client';

import { useRef } from 'react';

interface SearchBarProps {
  query: string;
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ query, onSearch, placeholder = "제목, 내용, 태그로 검색" }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mandoo-search relative">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <svg 
          className="mandoo-search__icon w-4 h-4"
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
        type="search"
        aria-label="글 검색"
        value={query}
        onChange={(e) => onSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onSearch('');
        }}
        placeholder={placeholder}
        className="w-full pl-10 pr-12"
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            onSearch('');
            inputRef.current?.focus();
          }}
          aria-label="검색어 지우기"
          className="absolute inset-y-0 right-0 flex items-center"
        >
          <svg className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
