import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';
import { format } from 'date-fns';

export default function Home() {
  const posts = getSortedPostsData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-black dark:via-gray-900 dark:to-black">
      <main className="max-w-4xl mx-auto px-6 py-20">
        <header className="mb-20 text-center">
          <div className="inline-block mb-6">
            <h1 className="text-6xl font-black mb-2 bg-gradient-to-r from-black via-gray-700 to-black dark:from-white dark:via-gray-300 dark:to-white bg-clip-text text-transparent">
              Blog
            </h1>
            <div className="h-1 bg-gradient-to-r from-transparent via-black to-transparent dark:via-white"></div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-light">
            Minimal, modern thoughts and writings
          </p>
        </header>

        <div className="space-y-8">
          {posts.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800">
              <div className="max-w-md mx-auto px-6">
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                  No posts yet. Add markdown files to the <code className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono text-sm">posts/</code> directory.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Example: <code className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono text-xs">posts/my-first-post.md</code>
                </p>
              </div>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.slug} className="group">
                <Link href={`/posts/${post.slug}`}>
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:-translate-y-1">
                    <time className="text-sm font-medium text-gray-500 dark:text-gray-500 mb-3 block uppercase tracking-wider">
                      {format(new Date(post.date), 'MMMM dd, yyyy')}
                    </time>
                    <h2 className="text-3xl font-bold mb-4 text-black dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-6 flex items-center text-black dark:text-white font-medium group-hover:translate-x-2 transition-transform duration-300">
                      <span>Read more</span>
                      <svg className="w-5 h-5 ml-2" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
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
