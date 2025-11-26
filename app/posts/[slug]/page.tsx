import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostData, getAllPostSlugs } from '@/lib/posts';
import { format } from 'date-fns';

export async function generateStaticParams() {
  const posts = getAllPostSlugs();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const post = await getPostData(slug);
    return {
      title: post.title,
      description: post.excerpt || post.title,
    };
  } catch {
    return {
      title: 'Post Not Found',
    };
  }
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let post;
  try {
    post = await getPostData(slug);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <main className="max-w-3xl mx-auto px-6 py-16">
        <Link 
          href="/"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-12"
        >
          <svg 
            className="w-4 h-4 mr-2" 
            fill="none" 
            strokeWidth="2" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
          </svg>
          Back to all posts
        </Link>

        <article>
          <header className="mb-12">
            <time className="text-sm text-gray-500 dark:text-gray-500 mb-4 block">
              {format(new Date(post.date), 'MMMM dd, yyyy')}
            </time>
            <h1 className="text-5xl font-bold text-black dark:text-white mb-6">
              {post.title}
            </h1>
          </header>

          <div 
            className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:text-black dark:prose-headings:text-white
              prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
              prose-a:text-black dark:prose-a:text-white prose-a:underline hover:prose-a:text-gray-600 dark:hover:prose-a:text-gray-400
              prose-strong:text-black dark:prose-strong:text-white
              prose-code:text-black dark:prose-code:text-white prose-code:bg-gray-100 dark:prose-code:bg-gray-900 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-800
              prose-blockquote:border-l-black dark:prose-blockquote:border-l-white prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
              prose-hr:border-gray-200 dark:prose-hr:border-gray-800
              prose-ul:text-gray-700 dark:prose-ul:text-gray-300
              prose-ol:text-gray-700 dark:prose-ol:text-gray-300
              prose-li:text-gray-700 dark:prose-li:text-gray-300"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />
        </article>
      </main>
    </div>
  );
}
