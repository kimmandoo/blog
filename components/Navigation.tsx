import Link from 'next/link';

export function Navigation() {
  return (
    <div className="flex items-center justify-center mb-7">
      <Link
        href="/coding-test"
        className="group inline-flex h-8 items-center gap-1.5 rounded-full border border-rose-200/80 bg-white/75 px-3 text-xs font-semibold text-gray-700 shadow-sm shadow-rose-100/60 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/60 dark:bg-gray-900/60 dark:text-gray-300 dark:shadow-none dark:hover:border-rose-700 dark:hover:bg-rose-950/30 dark:hover:text-rose-200"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400 transition-transform duration-200 group-hover:scale-125" aria-hidden="true" />
        PS
        <svg className="h-3 w-3 text-rose-400 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" strokeWidth="2.5" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </Link>
    </div>
  );
}
