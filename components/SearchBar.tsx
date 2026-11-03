'use client';

import { useRef, useState } from 'react';

interface SearchBarProps {
  query: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  inputId?: string;
  statusId?: string;
  onSearchEnd?: () => void;
}

export function SearchBar({
  query,
  onSearch,
  placeholder = "제목, 요약, 태그로 검색",
  inputId = 'archive-search',
  statusId,
  onSearchEnd,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const composing = useRef(false);
  const [draft, setDraft] = useState({ source: query, value: query });
  if (draft.source !== query) {
    setDraft({ source: query, value: query });
  }

  const clearSearch = () => {
    setDraft({ source: query, value: '' });
    onSearch('');
    inputRef.current?.focus();
  };

  return (
    <form
      className="mandoo-search relative"
      role="search"
      onSubmit={event => {
        event.preventDefault();
        if (!composing.current) onSearchEnd?.();
      }}
    >
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <svg 
          className="mandoo-search__icon w-4 h-4"
          aria-hidden="true"
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
        id={inputId}
        type="search"
        aria-label="글 검색"
        aria-describedby={statusId}
        value={draft.value}
        onChange={event => {
          const value = event.target.value;
          setDraft({ source: query, value });
          if (!composing.current) onSearch(value);
        }}
        onCompositionStart={() => { composing.current = true; }}
        onCompositionEnd={event => {
          composing.current = false;
          const value = event.currentTarget.value;
          setDraft({ source: query, value });
          onSearch(value);
        }}
        onBlur={onSearchEnd}
        onKeyDown={event => {
          if (event.key === 'Escape' && !composing.current && !event.nativeEvent.isComposing && event.nativeEvent.keyCode !== 229) {
            event.preventDefault();
            clearSearch();
          }
        }}
        placeholder={placeholder}
        className="w-full pl-10 pr-12"
      />
      {draft.value && (
        <button
          type="button"
          onClick={clearSearch}
          aria-label="검색어 지우기"
          className="absolute inset-y-0 right-0 flex items-center"
        >
          <svg aria-hidden="true" className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </form>
  );
}
