'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { themeConfig } from '@/config/theme.config';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SocialLinks } from '@/components/SocialLinks';

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
        <div className="header-actions" role="group" aria-label="소셜 링크 및 화면 설정">
          <SocialLinks />
          <Link className="header-action" href="/feed.xml" aria-label="RSS 구독" title="RSS 구독">
            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <circle cx="5" cy="19" r="1" fill="currentColor" />
              <path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" />
            </svg>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
