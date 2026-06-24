'use client';

import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  inline?: boolean;
}

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

export function ThemeToggle({ inline = false }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const containerClasses = inline
    ? 'theme-toggle inline-flex rounded-lg border border-gray-200 bg-white/80 p-1 shadow-sm dark:border-gray-700 dark:bg-gray-900/80'
    : 'theme-toggle fixed right-4 top-4 z-50 inline-flex rounded-full border border-gray-200 bg-white/90 p-1 shadow-lg backdrop-blur dark:border-gray-700 dark:bg-gray-900/90 sm:right-6 sm:top-6';

  return (
    <div className={containerClasses} role="group" aria-label={`Theme: ${theme}, resolved ${resolvedTheme}`}>
      {themeOptions.map((option) => {
        const isActive = theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            aria-label={option.label}
            aria-pressed={theme === option.value}
            title={option.label}
            className={`theme-toggle__option inline-flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${
              isActive
                ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-200 dark:bg-rose-300 dark:text-gray-950 dark:ring-rose-200/40'
                : 'text-gray-500 hover:-translate-y-0.5 hover:bg-rose-50 hover:text-rose-600 dark:text-gray-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-200'
            }`}
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
