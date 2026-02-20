'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Locale, translations, TranslationKey } from '@/lib/i18n';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'ko',
  setLocale: () => {},
  t: (key) => translations.ko[key],
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ko');

  useEffect(() => {
    const saved = localStorage.getItem('blog-locale') as Locale | null;
    if (saved && (saved === 'ko' || saved === 'en' || saved === 'ja')) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('blog-locale', newLocale);
  }, []);

  const t = useCallback((key: TranslationKey) => {
    return translations[locale][key];
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
