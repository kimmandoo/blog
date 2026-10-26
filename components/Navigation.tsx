import Link from 'next/link';

export function Navigation() {
  return (
    <nav aria-label="주요 메뉴" className="site-nav">
      <Link href="/coding-test">
        PS 노트
      </Link>
    </nav>
  );
}
