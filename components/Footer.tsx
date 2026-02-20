'use client';

import { themeConfig } from '@/config/theme.config';

export function Footer() {
  return (
    <footer className={`border-t ${themeConfig.colors.light.border.primary} ${themeConfig.colors.dark.border.primary} mt-16`}>
      <div className={`${themeConfig.spacing.container} mx-auto px-6 py-8`}>
        <div className="flex flex-col items-center gap-2">
          <p className={`text-sm ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary}`}>
            © {new Date().getFullYear()} {themeConfig.site.title}
          </p>
        </div>
      </div>
    </footer>
  );
}
