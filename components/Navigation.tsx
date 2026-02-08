'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { themeConfig } from '@/config/theme.config';

const ROUTES = {
  HOME: '/',
  ANDROIDCS: '/androidcs',
  BLOCKCHAIN: '/blockchain',
  PS: '/ps',
} as const;

export function Navigation() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    if (path === ROUTES.HOME) {
      return pathname === ROUTES.HOME;
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="mb-8">
      <div className="flex gap-6 justify-center">
        <Link 
          href={ROUTES.HOME}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isActive(ROUTES.HOME) && !pathname.startsWith(ROUTES.ANDROIDCS) && !pathname.startsWith(ROUTES.BLOCKCHAIN) && !pathname.startsWith(ROUTES.PS)
              ? `${themeConfig.colors.light.accent.primary} ${themeConfig.colors.dark.accent.primary}`
              : `${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} hover:bg-gray-100 dark:hover:bg-gray-800`
          }`}
        >
          Blog
        </Link>
        <Link 
          href={ROUTES.ANDROIDCS}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isActive(ROUTES.ANDROIDCS)
              ? `${themeConfig.colors.light.accent.primary} ${themeConfig.colors.dark.accent.primary}`
              : `${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} hover:bg-gray-100 dark:hover:bg-gray-800`
          }`}
        >
          Android
        </Link>
        <Link 
          href={ROUTES.BLOCKCHAIN}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isActive(ROUTES.BLOCKCHAIN)
              ? `${themeConfig.colors.light.accent.primary} ${themeConfig.colors.dark.accent.primary}`
              : `${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} hover:bg-gray-100 dark:hover:bg-gray-800`
          }`}
        >
          Blockchain
        </Link>
        <Link 
          href={ROUTES.PS}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isActive(ROUTES.PS)
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
