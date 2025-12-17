import Link from 'next/link';

interface PostNavigationProps {
  previousPost?: {
    slug: string;
    title: string;
  } | null;
  nextPost?: {
    slug: string;
    title: string;
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
            className="group flex flex-col p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {previousPost.title}
            </span>
          </Link>
        )}
      </div>

      {/* Next Post */}
      <div className="text-right">
        {nextPost && (
          <Link 
            href={`${basePath}/${nextPost.slug}`}
            className="group flex flex-col p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all items-end"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
              Next
              <svg className="w-3 h-3" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 text-right">
              {nextPost.title}
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
