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
      <div className="mb-8">
        <SearchBar onSearch={setSearchQuery} placeholder="Search..." />
      </div>

      {/* Active Filter */}
      {(selectedCategory || selectedTag) && (
        <div className="mb-6 flex items-center gap-2">
          <span className={`text-sm ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}>
            Filtering by:
          </span>
          {selectedCategory && (
            <div className="flex items-center gap-1.5">
              <CategoryBadge 
                category={selectedCategory} 
                index={allCategories.indexOf(selectedCategory)} 
                clickable={false}
              />
              <Link 
                href="/"
                className={`p-1 rounded ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary} hover:bg-stone-200 dark:hover:bg-stone-700 ${themeConfig.animations.transition}`}
              >
                <svg className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Link>
            </div>
          )}
          {selectedTag && (
            <div className="flex items-center gap-1.5">
              <TagBadge tag={selectedTag} clickable={false} />
              <Link 
                href="/"
                className={`p-1 rounded ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary} hover:bg-stone-200 dark:hover:bg-stone-700 ${themeConfig.animations.transition}`}
              >
                <svg className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Categories and Tags */}
      {(allCategories.length > 0 || allTags.length > 0) && (
        <div className="mb-10 space-y-4">
          {allCategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {allCategories.map((cat, index) => (
                <CategoryBadge key={cat} category={cat} index={index} />
              ))}
            </div>
          )}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-1">
        {filteredPosts.length === 0 ? (
          <div className={`text-center py-16 ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary}`}>
            {searchQuery ? (
              <div>
                <p className="mb-4">No posts found matching &quot;{searchQuery}&quot;</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className={`text-sm ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} underline underline-offset-4 ${themeConfig.animations.transition}`}
                >
                  Clear search
                </button>
              </div>
            ) : selectedCategory || selectedTag ? (
              <div>
                <p className="mb-4">{themeConfig.text.noPostsFound}</p>
                <Link 
                  href="/"
                  className={`text-sm ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} underline underline-offset-4 ${themeConfig.animations.transition}`}
                >
                  {themeConfig.text.viewAllPosts}
                </Link>
              </div>
            ) : (
              <div>
                <p className="mb-2">No posts yet.</p>
                <p className="text-sm">Add markdown files to the <code className="px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 rounded text-xs font-mono">posts/</code> directory.</p>
              </div>
            )}
          </div>
        ) : (
          filteredPosts.map((post) => (
            <article key={post.slug}>
              <Link href={`/posts/${post.slug}`} className="block group">
                <div className={`py-5 -mx-3 px-3 ${themeConfig.borderRadius.card} ${themeConfig.colors.light.background.cardHover} ${themeConfig.colors.dark.background.cardHover} ${themeConfig.animations.transition}`}>
                  <div className="flex items-baseline justify-between gap-4 mb-1">
                    <h2 className={`${themeConfig.typography.fontSize.body} font-medium ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary}`}>
                      {post.title}
                    </h2>
                    <time className={`text-xs ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary} shrink-0`}>
                      {format(new Date(post.date), 'MMM d, yyyy')}
                    </time>
                  </div>
                  {post.excerpt && (
                    <p className={`text-sm ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} line-clamp-1`}>
                      {post.excerpt}
                    </p>
                  )}
                  {(post.category || (post.tags && post.tags.length > 0)) && (
                    <div className="flex items-center gap-2 mt-2">
                      {post.category && (
                        <CategoryBadge 
                          category={post.category} 
                          index={allCategories.indexOf(post.category)} 
                          size="sm"
                          clickable={false}
                        />
                      )}
                      {post.tags && post.tags.slice(0, 2).map((tag) => (
                        <TagBadge key={tag} tag={tag} size="sm" clickable={false} />
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </article>
          ))
        )}
      </div>
    </>
  );
}
