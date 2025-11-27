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
}

export function TableOfContents({ items }: TOCProps) {
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

    // Observe all headings
    const headings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
    headings.forEach((heading) => observer.observe(heading));

    return () => {
      headings.forEach((heading) => observer.unobserve(heading));
    };
  }, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav>
      <div className={`${themeConfig.colors.light.background.card} ${themeConfig.colors.dark.background.card} ${themeConfig.borderRadius.card} ${themeConfig.colors.light.border.primary} ${themeConfig.colors.dark.border.primary} border p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 relative overflow-hidden`}>
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <h3 className={`text-sm font-bold uppercase tracking-wider ${themeConfig.colors.light.text.tertiary} ${themeConfig.colors.dark.text.tertiary} mb-4 flex items-center gap-2`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          Table of Contents
        </h3>
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              style={{ paddingLeft: `${(item.level - 1) * 0.75}rem` }}
            >
              <a
                href={`#${item.id}`}
                className={`block text-sm ${themeConfig.animations.transition} ${
                  activeId === item.id
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                    : `${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} hover:text-indigo-600 dark:hover:text-indigo-400`
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(item.id);
                  if (element) {
                    const offset = 80;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.scrollY - offset;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    });
                  }
                }}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
