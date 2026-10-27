import Link from 'next/link';
import { themeConfig } from '@/config/theme.config';
import { SocialLinks } from '@/components/SocialLinks';

export function ProfileSidebar() {
  const { site } = themeConfig;

  return (
    <aside className="profile-sidebar" aria-label="프로필 및 연결">
      <div className="profile-identity">
        <span className="profile-avatar" aria-hidden="true">{site.title.charAt(0)}</span>
        <div>
          <h2>{site.title}</h2>
          <p>{site.tagline}</p>
        </div>
      </div>
      <div className="profile-section">
        <h3>다른 곳에서도</h3>
        <SocialLinks />
      </div>
      <div className="profile-section">
        <h3>새 글 받아보기</h3>
        <Link className="profile-action" href="/feed.xml" aria-label="RSS 구독" title="RSS 구독">
          <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <circle cx="5" cy="19" r="1" fill="currentColor" />
            <path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" />
          </svg>
        </Link>
      </div>
    </aside>
  );
}
