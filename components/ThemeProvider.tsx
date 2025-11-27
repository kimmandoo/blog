'use client';

import { createContext, useContext, useEffect, useCallback, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Track mounted state using useSyncExternalStore
let isMounted = false;
const mountedListeners = new Set<() => void>();

function getMountedSnapshot() {
  return isMounted;
}

function getMountedServerSnapshot() {
  return false;
}

function subscribeMounted(callback: () => void) {
  mountedListeners.add(callback);
  // Set mounted after subscription
  if (!isMounted && typeof window !== 'undefined') {
    isMounted = true;
    mountedListeners.forEach(cb => cb());
  }
  return () => {
    mountedListeners.delete(callback);
  };
}

// Theme store
let currentTheme: Theme = 'light';
const themeListeners = new Set<() => void>();

function getThemeSnapshot() {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') {
    currentTheme = stored;
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    currentTheme = 'dark';
  }
  return currentTheme;
}

function getThemeServerSnapshot(): Theme {
  return 'light';
}

function subscribeTheme(callback: () => void) {
  themeListeners.add(callback);
  const handleStorage = () => callback();
  window.addEventListener('storage', handleStorage);
  return () => {
    themeListeners.delete(callback);
    window.removeEventListener('storage', handleStorage);
  };
}

function setTheme(newTheme: Theme) {
  currentTheme = newTheme;
  localStorage.setItem('theme', newTheme);
  themeListeners.forEach(cb => cb());
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(subscribeMounted, getMountedSnapshot, getMountedServerSnapshot);
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);

  // Apply theme changes to DOM
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, mounted]);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [theme]);

  // Prevent flash of wrong theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
