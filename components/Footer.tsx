'use client';

import { themeConfig } from '@/config/theme.config';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Footer() {
  return (
    <footer className="site-footer">
      <p>© {new Date().getFullYear()} {themeConfig.site.title}</p>
      <ThemeToggle />
    </footer>
  );
}
