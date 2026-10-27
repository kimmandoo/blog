import Link from 'next/link';
import { SocialLinks } from '@/components/SocialLinks';

export function ProfileSidebar() {

  return (
    <aside className="profile-sidebar" aria-label="프로필 및 연결">
      <div className="profile-identity">
        <div>
          <h2>kimmandoo</h2>
          <p>잘 살아보기</p>
        </div>
      </div>
      <div className="profile-section">
        <SocialLinks />
      </div>
      <div className="profile-section">
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
