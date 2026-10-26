'use client';

import { useTheme } from './ThemeProvider';

const themeOptions = [
  {
    value: 'light',
    label: 'Light',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 2.75v2.5M12 18.75v2.5M4.45 4.45l1.8 1.8M17.75 17.75l1.8 1.8M2.75 12h2.5M18.75 12h2.5M4.45 19.55l1.8-1.8M17.75 6.25l1.8-1.8" />
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.2 14.4A7.7 7.7 0 0 1 9.6 3.8 8.2 8.2 0 1 0 20.2 14.4Z" />
        <path d="M17.7 4.2l.35.8.8.35-.8.35-.35.8-.35-.8-.8-.35.8-.35.35-.8Z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    value: 'system',
    label: 'System',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="6" width="14" height="10" rx="3" />
        <path d="M9 19h6M12 16v3" />
        <path d="M17.7 3.7l.35.8.8.35-.8.35-.35.8-.35-.8-.8-.35.8-.35.35-.8Z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
] as const;

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div className="theme-toggle" role="group" aria-label={`Theme: ${theme}, resolved ${resolvedTheme}`}>
      {themeOptions.map((option) => {
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            aria-label={option.label}
            aria-pressed={theme === option.value}
            title={option.label}
            className="theme-toggle__button"
          >
            <span className="theme-toggle__icon inline-flex h-4 w-4 items-center justify-center" aria-hidden="true">
              {option.icon}
            </span>
          </button>
        );
      })}
    </div>
  );
}
