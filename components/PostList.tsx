'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { CategoryBadge } from '@/components/CategoryBadge';
import { TagBadge } from '@/components/TagBadge';
import { SearchBar } from '@/components/SearchBar';
import { SocialLinks } from '@/components/SocialLinks';
import { themeConfig } from '@/config/theme.config';
import { PostData } from '@/lib/posts';

interface PostListProps {
  initialPosts: PostData[];
  allCategories: string[];
  allTags: string[];
  selectedCategory?: string;
  selectedTag?: string;
}

export function PostList({ 
  initialPosts, 
  allCategories, 
  allTags,
  selectedCategory,
  selectedTag 
}: PostListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter posts based on search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) {
      return initialPosts;
    }

    const query = searchQuery.toLowerCase();
    return initialPosts.filter(post => {
      const titleMatch = post.title.toLowerCase().includes(query);
      const excerptMatch = post.excerpt?.toLowerCase().includes(query);
      const categoryMatch = post.category?.toLowerCase().includes(query);
      const tagsMatch = post.tags?.some(tag => tag.toLowerCase().includes(query));
      
      return titleMatch || excerptMatch || categoryMatch || tagsMatch;
    });
  }, [initialPosts, searchQuery]);

  return (
    <>
      {/* Social Links */}
      <SocialLinks />

      {/* Search Bar */}
      <div className="mb-12">
        <SearchBar onSearch={setSearchQuery} placeholder="Search posts by title, excerpt, category, or tags..." />
      </div>

      {/* Filter Tags */}
      {(selectedCategory || selectedTag) && (
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <span className={`font-medium ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary}`}>
            {themeConfig.text.filter}
          </span>
          {selectedCategory && (
            <div className="flex items-center gap-2">
              <CategoryBadge 
                category={selectedCategory} 
                index={allCategories.indexOf(selectedCategory)} 
                clickable={false}
              />
              <Link 
                href="/"
                className={`text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ${themeConfig.animations.transition}`}
              >
                <svg className="w-5 h-5" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Link>
            </div>
          )}
          {selectedTag && (
            <div className="flex items-center gap-2">
              <TagBadge tag={selectedTag} clickable={false} />
              <Link 
                href="/"
                className={`text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ${themeConfig.animations.transition}`}
              >
                <svg className="w-5 h-5" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Categories and Tags Filter - Modern Layout */}
      {(allCategories.length > 0 || allTags.length > 0) && (
        <div className="mb-12">
          {/* Modern Card Container with Glassmorphism */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/60 to-gray-50/60 dark:from-gray-900/60 dark:to-gray-800/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-6 md:p-8">
            {/* Decorative gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-violet-500/5 to-fuchsia-500/5 dark:from-blue-400/10 dark:via-violet-400/10 dark:to-fuchsia-400/10 pointer-events-none"></div>
            
            {/* Content */}
            <div className="relative space-y-8">
              {/* Categories Section */}
              {allCategories.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 shadow-md">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className={`text-base font-bold tracking-wide ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary}`}>
                      {themeConfig.text.categories}
                    </h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-300/50 via-gray-200/30 to-transparent dark:from-gray-600/50 dark:via-gray-700/30"></div>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {allCategories.map((cat, index) => (
                      <CategoryBadge key={cat} category={cat} index={index} size="md" />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Tags Section */}
              {allTags.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500 to-gray-700 dark:from-gray-400 dark:to-gray-600 shadow-md">
                      <svg className="w-4 h-4 text-white" fill="none" strokeWidth="2.5" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <h3 className={`text-base font-bold tracking-wide ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary}`}>
                      {themeConfig.text.tags}
                    </h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-300/50 via-gray-200/30 to-transparent dark:from-gray-600/50 dark:via-gray-700/30"></div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <TagBadge key={tag} tag={tag} size="md" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              {searchQuery ? (
                <>
                  <p className={`${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} mb-6 ${themeConfig.typography.fontSize.body}`}>
                    No posts found matching &quot;{searchQuery}&quot;
                  </p>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className={`inline-flex items-center px-5 py-2.5 ${themeConfig.colors.light.accent.primary} ${themeConfig.colors.dark.accent.primary} ${themeConfig.borderRadius.button} font-medium ${themeConfig.animations.transition} hover:opacity-80`}
                  >
                    Clear Search
                  </button>
                </>
              ) : selectedCategory || selectedTag ? (
                <>
                  <p className={`${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} mb-6 ${themeConfig.typography.fontSize.body}`}>
                    {themeConfig.text.noPostsFound}
                  </p>
                  <Link 
                    href="/"
                    className={`inline-flex items-center px-5 py-2.5 ${themeConfig.colors.light.accent.primary} ${themeConfig.colors.dark.accent.primary} ${themeConfig.borderRadius.button} font-medium ${themeConfig.animations.transition} hover:opacity-80`}
                  >
                    {themeConfig.text.viewAllPosts}
                  </Link>
                </>
              ) : (
                <>
                  <p className={`${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} mb-6 ${themeConfig.typography.fontSize.body}`}>
                    No posts yet. Add markdown files to the <code className={`px-2 py-0.5 ${themeConfig.colors.light.code.background} ${themeConfig.colors.dark.code.background} ${themeConfig.colors.light.code.text} ${themeConfig.colors.dark.code.text} rounded font-mono text-sm`}>posts/</code> directory.
                  </p>
                  <p className={`text-sm ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}>
                    Example: <code className={`px-2 py-0.5 ${themeConfig.colors.light.code.background} ${themeConfig.colors.dark.code.background} ${themeConfig.colors.light.code.text} ${themeConfig.colors.dark.code.text} rounded font-mono text-xs`}>posts/my-first-post.md</code>
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <article key={post.slug} className="group">
              <Link href={`/posts/${post.slug}`}>
                <div className={`py-6 px-4 -mx-4 rounded-lg ${themeConfig.animations.transition} hover:bg-gray-50 dark:hover:bg-gray-900/50`}>
                  <div className="flex items-start gap-4">
                    {/* Left accent bar */}
                    <div className="hidden sm:block w-1 h-full min-h-[60px] rounded-full bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 group-hover:from-blue-400 group-hover:to-violet-500 transition-all duration-300"></div>
                    
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <time className={`text-sm font-medium ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}>
                          {format(new Date(post.date), 'yyyy.MM.dd')}
                        </time>
                        {post.readingTime && (
                          <span className={`text-sm ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}>
                            · {post.readingTime} min read
                          </span>
                        )}
                        {post.category && (
                          <span className={`text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} font-medium`}>
                            {post.category}
                          </span>
                        )}
                      </div>
                      <h2 className={`text-lg sm:text-xl font-semibold mb-2 ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} group-hover:text-blue-600 dark:group-hover:text-blue-400 ${themeConfig.animations.transition}`}>
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className={`${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} text-sm leading-relaxed mb-3 overflow-hidden`} style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {post.excerpt}
                        </p>
                      )}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          {post.tags.map((tag) => (
                            <span key={tag} className={`text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800/50 ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Arrow indicator */}
                    <div className="hidden sm:flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg className="w-5 h-5 text-gray-400 dark:text-gray-600" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))
        )}
      </div>
    </>
  );
}
