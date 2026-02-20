'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ROUTES = {
  HOME: '/',
  ANDROIDCS: '/androidcs',
  PS: '/ps',
} as const;

const NAV_ITEMS = [
  { path: ROUTES.HOME, label: 'Blog' },
  { path: ROUTES.ANDROIDCS, label: 'Android' },
  { path: ROUTES.PS, label: 'PS' },
];

export function Navigation() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    if (path === ROUTES.HOME) {
      return pathname === ROUTES.HOME;
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="mb-6">
      <div className="flex gap-1 justify-center p-1 bg-gray-100/80 dark:bg-gray-800/50 rounded-lg w-fit mx-auto">
        {NAV_ITEMS.map(({ path, label }) => (
          <Link
            key={path}
            href={path}
            className={`px-5 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              isActive(path)
                ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
