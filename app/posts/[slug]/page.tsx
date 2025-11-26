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
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-black dark:via-gray-900 dark:to-black">
      <main className="max-w-4xl mx-auto px-6 py-16">
        <Link 
          href="/"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all mb-12 group"
        >
          <svg 
            className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" 
            fill="none" 
            strokeWidth="2" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
          </svg>
          <span className="font-medium">Back to all posts</span>
        </Link>

        <article className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <header className="px-8 md:px-12 pt-12 pb-8 border-b border-gray-100 dark:border-gray-800">
            <time className="text-sm font-medium text-gray-500 dark:text-gray-500 mb-4 block uppercase tracking-wider">
              {format(new Date(post.date), 'MMMM dd, yyyy')}
            </time>
            <h1 className="text-5xl md:text-6xl font-black text-black dark:text-white mb-4 leading-tight">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </header>

          <div className="px-8 md:px-12 py-12">
            <div 
              className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:text-black dark:prose-headings:text-white prose-headings:scroll-mt-16
                prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-12
                prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-10 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-gray-800
                prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-8
                prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-black dark:prose-a:text-white prose-a:font-medium prose-a:no-underline prose-a:border-b-2 prose-a:border-black dark:prose-a:border-white hover:prose-a:border-gray-400 dark:hover:prose-a:border-gray-600 prose-a:transition-colors
                prose-strong:text-black dark:prose-strong:text-white prose-strong:font-bold
                prose-code:text-black dark:prose-code:text-white prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded-lg prose-code:before:content-none prose-code:after:content-none prose-code:font-mono prose-code:text-sm
                prose-pre:bg-gradient-to-br prose-pre:from-gray-900 prose-pre:to-black dark:prose-pre:from-gray-950 dark:prose-pre:to-black prose-pre:border prose-pre:border-gray-800 dark:prose-pre:border-gray-700 prose-pre:rounded-2xl prose-pre:shadow-lg prose-pre:p-6
                prose-blockquote:border-l-4 prose-blockquote:border-black dark:prose-blockquote:border-white prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-900 prose-blockquote:py-4 prose-blockquote:rounded-r-xl
                prose-hr:border-gray-200 dark:prose-hr:border-gray-800 prose-hr:my-12
                prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-ul:list-disc prose-ul:pl-6
                prose-ol:text-gray-700 dark:prose-ol:text-gray-300 prose-ol:list-decimal prose-ol:pl-6
                prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:mb-2
                prose-img:rounded-2xl prose-img:shadow-lg"
              dangerouslySetInnerHTML={{ __html: post.content || '' }}
            />
          </div>
        </article>

        <div className="mt-12 text-center">
          <Link 
            href="/"
            className="inline-flex items-center px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold hover:scale-105 transition-transform shadow-lg hover:shadow-2xl"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              strokeWidth="2" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M19 12H5M5 12l7 7M5 12l7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
