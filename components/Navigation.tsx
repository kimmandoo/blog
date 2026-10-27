'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { themeConfig } from '@/config/theme.config';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Navigation() {
  const pathname = usePathname();
  const isPs = pathname.startsWith('/coding-test');

  return (
    <header id="top" className="site-header">
      <div className="site-header-inner">
        <Link className="site-brand" href="/">{themeConfig.site.title}</Link>
        <nav aria-label="주요 메뉴" className="site-nav">
          <Link href="/" aria-current={!isPs ? 'page' : undefined}>글</Link>
          <Link href="/coding-test" aria-current={isPs ? 'page' : undefined}>PS</Link>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
