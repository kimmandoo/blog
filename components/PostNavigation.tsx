import Link from 'next/link';

interface PostNavigationProps {
  previousPost?: {
    slug: string;
    title: string;
    category?: string;
    readingTime?: number;
  } | null;
  nextPost?: {
    slug: string;
    title: string;
    category?: string;
    readingTime?: number;
  } | null;
  basePath?: string; // Optional base path, defaults to '/posts'
}

export function PostNavigation({ previousPost, nextPost, basePath = '/posts' }: PostNavigationProps) {
  if (!previousPost && !nextPost) return null;

  return (
    <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
      {/* Previous Post */}
      <div className={previousPost ? '' : 'sm:col-start-2'}>
        {previousPost && (
          <Link 
            href={`${basePath}/${previousPost.slug}`}
            className="group flex flex-col py-4 border-t border-[var(--border)]"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" />
              </svg>
              이전 글
            </span>
            <span className="text-sm font-medium group-hover:underline underline-offset-4 line-clamp-2">
              {previousPost.title}
            </span>
            {(previousPost.category || previousPost.readingTime) && (
              <span className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                {previousPost.category && <span>{previousPost.category}</span>}
                {previousPost.readingTime && <span>· {previousPost.readingTime}분</span>}
              </span>
            )}
          </Link>
        )}
      </div>

      {/* Next Post */}
      <div className="text-right">
        {nextPost && (
          <Link 
            href={`${basePath}/${nextPost.slug}`}
            className="group flex flex-col py-4 border-t border-[var(--border)] items-end"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
              다음 글
              <svg className="w-3 h-3" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </span>
            <span className="text-sm font-medium group-hover:underline underline-offset-4 line-clamp-2 text-right">
              {nextPost.title}
            </span>
            {(nextPost.category || nextPost.readingTime) && (
              <span className="mt-2 flex flex-wrap items-center justify-end gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                {nextPost.category && <span>{nextPost.category}</span>}
                {nextPost.readingTime && <span>· {nextPost.readingTime}분</span>}
              </span>
            )}
          </Link>
        )}
      </div>
    </nav>
  );
}
