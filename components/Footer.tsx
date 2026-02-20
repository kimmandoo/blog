'use client';

import { themeConfig } from '@/config/theme.config';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 dark:border-gray-800/50">
      <div className={`${themeConfig.spacing.container} mx-auto px-6 py-6`}>
        <p className="text-center text-xs text-gray-400 dark:text-gray-600">
          © {new Date().getFullYear()} {themeConfig.site.title}
        </p>
      </div>
    </footer>
  );
}
