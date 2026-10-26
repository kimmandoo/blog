import Link from 'next/link';

export function Navigation() {
  return (
    <nav aria-label="주요 메뉴" className="flex items-center">
      <Link
        href="/coding-test"
        className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-gray-200 bg-white/75 px-4 text-sm font-semibold text-gray-700 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-300 dark:hover:border-rose-700 dark:hover:text-rose-200"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400 transition-transform duration-200 group-hover:scale-125" aria-hidden="true" />
        PS 노트
        <svg className="h-3 w-3 text-rose-400 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" strokeWidth="2.5" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </Link>
    </nav>
  );
}
