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

      {/* Categories and Tags Filter */}
      {(allCategories.length > 0 || allTags.length > 0) && (
        <div className={`mb-12 ${themeConfig.colors.light.background.card} ${themeConfig.colors.dark.background.card} ${themeConfig.borderRadius.card} ${themeConfig.spacing.card} shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 ${themeConfig.colors.light.border.primary} ${themeConfig.colors.dark.border.primary} border relative overflow-hidden`}>
          {/* Decorative gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          {allCategories.length > 0 && (
            <div className="mb-6 last:mb-0">
              <h3 className={`text-sm font-bold uppercase tracking-wider ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary} mb-3 flex items-center gap-2`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {themeConfig.text.categories}
              </h3>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((cat, index) => (
                  <CategoryBadge key={cat} category={cat} index={index} />
                ))}
              </div>
            </div>
          )}
          {allTags.length > 0 && (
            <div>
              <h3 className={`text-sm font-bold uppercase tracking-wider ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary} mb-3 flex items-center gap-2`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                {themeConfig.text.tags}
              </h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <TagBadge key={tag} tag={tag} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-8">
        {filteredPosts.length === 0 ? (
          <div className={`text-center py-20 ${themeConfig.colors.light.background.card} ${themeConfig.colors.dark.background.card} rounded-3xl shadow-lg ${themeConfig.colors.light.border.primary} ${themeConfig.colors.dark.border.primary} border`}>
            <div className="max-w-md mx-auto px-6">
              {searchQuery ? (
                <>
                  <p className={`${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} mb-6 ${themeConfig.typography.fontSize.body}`}>
                    No posts found matching &quot;{searchQuery}&quot;
                  </p>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className={`inline-flex items-center px-6 py-3 ${themeConfig.colors.light.accent.primary} ${themeConfig.colors.dark.accent.primary} ${themeConfig.borderRadius.button} font-bold ${themeConfig.animations.scale} ${themeConfig.animations.transition} ${themeConfig.shadows.button}`}
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
                    className={`inline-flex items-center px-6 py-3 ${themeConfig.colors.light.accent.primary} ${themeConfig.colors.dark.accent.primary} ${themeConfig.borderRadius.button} font-bold ${themeConfig.animations.scale} ${themeConfig.animations.transition} ${themeConfig.shadows.button}`}
                  >
                    {themeConfig.text.viewAllPosts}
                  </Link>
                </>
              ) : (
                <>
                  <p className={`${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} mb-6 ${themeConfig.typography.fontSize.body}`}>
                    No posts yet. Add markdown files to the <code className={`px-3 py-1 ${themeConfig.colors.light.code.background} ${themeConfig.colors.dark.code.background} ${themeConfig.colors.light.code.text} ${themeConfig.colors.dark.code.text} rounded-lg font-mono text-sm`}>posts/</code> directory.
                  </p>
                  <p className={`text-sm ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}>
                    Example: <code className={`px-3 py-1 ${themeConfig.colors.light.code.background} ${themeConfig.colors.dark.code.background} ${themeConfig.colors.light.code.text} ${themeConfig.colors.dark.code.text} rounded-lg font-mono text-xs`}>posts/my-first-post.md</code>
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          filteredPosts.map((post, index) => (
            <article key={post.slug} className="group" style={{ animationDelay: `${index * 100}ms` }}>
              <Link href={`/posts/${post.slug}`}>
                <div className={`relative ${themeConfig.colors.light.background.card} ${themeConfig.colors.dark.background.card} ${themeConfig.borderRadius.card} ${themeConfig.spacing.card} ${themeConfig.shadows.card} ${themeConfig.animations.transition} ${themeConfig.colors.light.border.primary} ${themeConfig.colors.dark.border.primary} border ${themeConfig.colors.light.background.cardHover} ${themeConfig.colors.dark.background.cardHover} ${themeConfig.animations.hover} overflow-hidden`}>
                  {/* Gradient accent line */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Post number indicator */}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 opacity-50 group-hover:opacity-100 transition-opacity">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <time className={`${themeConfig.typography.fontSize.small} font-medium ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary} uppercase tracking-wider flex items-center gap-2`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {format(new Date(post.date), 'MMMM dd, yyyy')}
                    </time>
                    {post.category && (
                      <CategoryBadge 
                        category={post.category} 
                        index={allCategories.indexOf(post.category)} 
                        size="sm"
                        clickable={false}
                      />
                    )}
                  </div>
                  <h2 className={`${themeConfig.typography.fontSize.heading} font-bold mb-4 ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 dark:group-hover:from-indigo-400 dark:group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent ${themeConfig.animations.transition}`}>
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className={`${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} leading-relaxed ${themeConfig.typography.fontSize.body} mb-4 line-clamp-2`}>
                      {post.excerpt}
                    </p>
                  )}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {post.tags.map((tag) => (
                        <TagBadge key={tag} tag={tag} clickable={false} />
                      ))}
                    </div>
                  )}
                  <div className={`mt-6 flex items-center font-semibold group-hover:translate-x-2 ${themeConfig.animations.transition}`}>
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Read more</span>
                    <svg className="w-5 h-5 ml-2 text-indigo-600 dark:text-indigo-400" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
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
