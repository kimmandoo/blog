'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { themeConfig } from '@/config/theme.config';

const ROUTES = {
  HOME: '/',
  ANDROIDCS: '/androidcs',
  PS: '/?category=PS',
} as const;

export function Navigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');

  const isAndroidActive = pathname.startsWith(ROUTES.ANDROIDCS);
  const isPSActive = pathname === ROUTES.HOME && activeCategory === 'PS';
  const isBlogActive = pathname === ROUTES.HOME && !isPSActive;

  return (
    <nav className="mb-8">
      <div className="flex gap-6 justify-center">
        <Link 
          href={ROUTES.HOME}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isBlogActive
              ? `${themeConfig.colors.light.accent.primary} ${themeConfig.colors.dark.accent.primary}`
              : `${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} hover:bg-gray-100 dark:hover:bg-gray-800`
          }`}
        >
          Blog
        </Link>
        <Link 
          href={ROUTES.ANDROIDCS}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isAndroidActive
              ? `${themeConfig.colors.light.accent.primary} ${themeConfig.colors.dark.accent.primary}`
              : `${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} hover:bg-gray-100 dark:hover:bg-gray-800`
          }`}
        >
          Android
        </Link>
        <Link 
          href={ROUTES.PS}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isPSActive
              ? `${themeConfig.colors.light.accent.primary} ${themeConfig.colors.dark.accent.primary}`
              : `${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} hover:bg-gray-100 dark:hover:bg-gray-800`
          }`}
        >
          PS
        </Link>
      </div>
    </nav>
  );
}
