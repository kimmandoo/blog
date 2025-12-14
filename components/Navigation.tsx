'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { themeConfig } from '@/config/theme.config';

export function Navigation() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="mb-8">
      <div className="flex gap-6 justify-center">
        <Link 
          href="/"
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isActive('/') && !pathname.startsWith('/androidcs')
              ? `${themeConfig.colors.light.accent.primary} ${themeConfig.colors.dark.accent.primary}`
              : `${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} hover:${themeConfig.colors.light.text.primary} hover:${themeConfig.colors.dark.text.primary}`
          }`}
        >
          Blog
        </Link>
        <Link 
          href="/androidcs"
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isActive('/androidcs')
              ? `${themeConfig.colors.light.accent.primary} ${themeConfig.colors.dark.accent.primary}`
              : `${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} hover:${themeConfig.colors.light.text.primary} hover:${themeConfig.colors.dark.text.primary}`
          }`}
        >
          AndroidCS
        </Link>
      </div>
    </nav>
  );
}
