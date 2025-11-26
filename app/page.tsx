import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';
import { format } from 'date-fns';

export default function Home() {
  const posts = getSortedPostsData();

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <main className="max-w-3xl mx-auto px-6 py-16">
        <header className="mb-16">
          <h1 className="text-5xl font-bold mb-4 text-black dark:text-white">
            Blog
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Minimal, modern thoughts and writings
          </p>
        </header>

        <div className="space-y-12">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-500 mb-4">
                No posts yet. Add markdown files to the <code className="px-2 py-1 bg-gray-100 dark:bg-gray-900 rounded">posts/</code> directory.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-600">
                Example: <code className="px-2 py-1 bg-gray-100 dark:bg-gray-900 rounded text-xs">posts/my-first-post.md</code>
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.slug} className="group">
                <Link href={`/posts/${post.slug}`}>
                  <div className="border-b border-gray-200 dark:border-gray-800 pb-8 transition-all hover:border-gray-400 dark:hover:border-gray-600">
                    <time className="text-sm text-gray-500 dark:text-gray-500 mb-2 block">
                      {format(new Date(post.date), 'MMMM dd, yyyy')}
                    </time>
                    <h2 className="text-2xl font-semibold mb-3 text-black dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
