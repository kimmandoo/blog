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
  basePath?: string; // Optional base path, defaults to '/posts'
}

export function PostList({ 
  initialPosts, 
  allCategories, 
  allTags,
  selectedCategory,
  selectedTag,
  basePath = '/posts'
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
      <div className="mb-6">
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
                href={basePath === '/posts' ? '/' : basePath}
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
                href={basePath === '/posts' ? '/' : basePath}
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

      {/* Categories and Tags Filter - Ultra Minimal Layout */}
      {(allCategories.length > 0 || allTags.length > 0) && (
        <div className="mb-8 space-y-4">
          {/* Categories Section */}
          {allCategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-medium uppercase tracking-wide ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary} mr-1`}>
                {themeConfig.text.categories}
              </span>
              {allCategories.map((cat, index) => (
                <CategoryBadge key={cat} category={cat} index={index} size="sm" basePath={basePath === '/posts' ? '/' : basePath} />
              ))}
            </div>
          )}
          
          {/* Tags Section */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              <span className={`text-xs font-medium uppercase tracking-wide ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary} mr-2`}>
                {themeConfig.text.tags}
              </span>
              {allTags.map((tag) => (
                <TagBadge key={tag} tag={tag} size="sm" basePath={basePath === '/posts' ? '/' : basePath} />
              ))}
            </div>
          )}
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
                    href={basePath === '/posts' ? '/' : basePath}
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
              <Link href={`${basePath}/${post.slug}`}>
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
