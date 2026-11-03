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
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((heading): heading is HTMLElement => heading !== null);
    let frame = 0;

    const updateActiveHeading = () => {
      frame = 0;
      let currentId = '';

      for (const heading of headings) {
        const margin = Number.parseFloat(getComputedStyle(heading).scrollMarginTop) || 0;
        if (heading.getBoundingClientRect().top > margin + 1) break;
        currentId = heading.id;
      }

      setActiveId(currentId);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveHeading);
    };

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('hashchange', scheduleUpdate);
    const observer = new ResizeObserver(scheduleUpdate);
    const content = document.getElementById('article-content');
    if (content) observer.observe(content);
    scheduleUpdate();

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('hashchange', scheduleUpdate);
      observer.disconnect();
    };
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  const baseLevel = Math.min(...items.map((item) => item.level));

  const links = (
    <ul className={compact ? 'space-y-1' : 'space-y-1.5 max-h-[calc(100vh-200px)] overflow-y-auto'}>
      {items.map((item) => {
        return (
          <li
            key={item.id}
            style={{ paddingLeft: `${Math.max(0, item.level - baseLevel) * 0.75}rem` }}
          >
            <a
              href={`#${encodeURIComponent(item.id)}`}
              aria-current={activeId === item.id ? 'location' : undefined}
              className="mandoo-toc-link block break-words py-2 text-sm font-medium leading-relaxed"
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
    <nav className="sticky top-24" aria-label="글 목차">
      <div className={`${themeConfig.colors.light.background.card} ${themeConfig.colors.dark.background.card} border ${themeConfig.colors.light.border.primary} ${themeConfig.colors.dark.border.primary} p-5`}>
        <h3 className={`text-xs font-semibold ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} mb-4 pb-2 border-b ${themeConfig.colors.light.border.secondary} ${themeConfig.colors.dark.border.secondary}`}>
          목차
        </h3>
        {links}
      </div>
    </nav>
  );
}
