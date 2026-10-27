'use client';

import { themeConfig } from '@/config/theme.config';
import { SocialLinks } from '@/components/SocialLinks';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p>© {new Date().getFullYear()} {themeConfig.site.title}</p>
        <SocialLinks />
        <a href="#top" className="back-to-top" aria-label="맨 위로" title="맨 위로">
          <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 12 6-6 6 6M12 6v13" />
          </svg>
        </a>
      </div>
    </footer>
  );
}
