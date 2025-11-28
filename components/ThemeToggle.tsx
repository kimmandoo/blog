'use client';

import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
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

  return (
    <button
      onClick={cycleTheme}
      className="fixed top-4 right-4 z-50 p-2 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors duration-200"
      aria-label={`Current theme: ${theme}. Click to switch.`}
      title={`Theme: ${theme} (${resolvedTheme})`}
    >
      {/* Sun icon for light mode */}
      {resolvedTheme === 'light' && (
        <svg
          className="w-4 h-4 text-stone-600"
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
          className="w-4 h-4 text-stone-300"
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
      {/* System indicator */}
      {theme === 'system' && (
        <span className="absolute -bottom-0.5 -right-0.5 text-[8px] bg-stone-500 text-white px-1 rounded text-center leading-tight">
          auto
        </span>
      )}
    </button>
  );
}
