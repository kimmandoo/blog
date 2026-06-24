'use client';

import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  inline?: boolean;
}

export function ThemeToggle({ inline = false }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const cycleTheme = () => {
    // Cycle: light -> dark -> system -> light
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const buttonClasses = inline
    ? "theme-toggle relative p-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
    : "theme-toggle fixed right-4 top-4 z-50 p-2.5 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-105 sm:right-6 sm:top-6 sm:p-3 transition-all duration-300";

  return (
    <button
      onClick={cycleTheme}
      className={buttonClasses}
      aria-label={`현재 테마: ${theme}. 클릭하면 변경됩니다.`}
      title={`테마: ${theme} (${resolvedTheme})`}
    >
      {/* Sun icon for light mode */}
      {resolvedTheme === 'light' && (
        <svg
          className="theme-toggle__icon w-5 h-5 text-yellow-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}
      {/* Moon icon for dark mode */}
      {resolvedTheme === 'dark' && (
        <svg
          className="theme-toggle__icon w-5 h-5 text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}
