'use client';

import { useEffect, useState } from 'react';
import { themeConfig } from '@/config/theme.config';

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TOCProps {
  items: TOCItem[];
  compact?: boolean;
}

export function TableOfContents({ items, compact = false }: TOCProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' }
    );

    const headings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
    headings.forEach((heading) => observer.observe(heading));

    return () => {
      headings.forEach((heading) => observer.unobserve(heading));
    };
  }, []);

  if (items.length === 0) {
    return null;
  }

  const links = (
    <ul className={compact ? 'space-y-1' : 'space-y-1.5 max-h-[calc(100vh-200px)] overflow-y-auto'}>
      {items.map((item) => {
        const isActive = activeId === item.id;

        return (
          <li
            key={item.id}
            style={{ paddingLeft: `${(item.level - 1) * 0.75}rem` }}
          >
            <a
              href={`#${item.id}`}
              aria-current={activeId === item.id ? 'location' : undefined}
              className={`mandoo-toc-link block py-1 text-sm leading-relaxed ${themeConfig.animations.transition} ${
                isActive
                  ? `mandoo-toc-link--active ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} font-semibold border-l-2 border-rose-500 dark:border-rose-300 pl-3 -ml-3`
                  : `${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} hover:text-rose-600 dark:hover:text-rose-300 hover:translate-x-1`
              }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveId(item.id);

                const element = document.getElementById(item.id);
                if (element) {
                  const offset = 80;
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.scrollY - offset;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth',
                  });
                }
              }}
            >
              {item.text}
            </a>
          </li>
        );
      })}
    </ul>
  );

  if (compact) {
    return (
      <nav className="mandoo-details-panel mt-4 space-y-1 border-t border-gray-200/70 pt-3 dark:border-gray-800/70" aria-label="글 목차">
        {links}
      </nav>
    );
  }

  return (
    <nav className="sticky top-24">
      <div className={`${themeConfig.colors.light.background.card} ${themeConfig.colors.dark.background.card} border ${themeConfig.colors.light.border.primary} ${themeConfig.colors.dark.border.primary} p-5`}>
        <h3 className={`text-xs font-semibold ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} mb-4 pb-2 border-b ${themeConfig.colors.light.border.secondary} ${themeConfig.colors.dark.border.secondary}`}>
          목차
        </h3>
        {links}
      </div>
    </nav>
  );
}
