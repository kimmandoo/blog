'use client';

import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  inline?: boolean;
}

const themeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
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
            aria-pressed={theme === option.value}
            className={`theme-toggle__option inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-rose-600 text-white shadow-sm dark:bg-rose-300 dark:text-gray-950'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
            }`}
          >
            <span className={`theme-toggle__icon h-1.5 w-1.5 rounded-full ${isActive ? 'bg-current' : 'bg-gray-300 dark:bg-gray-600'}`} aria-hidden="true" />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
