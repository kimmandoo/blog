'use client';

import { useLanguage } from './LanguageProvider';
import { Locale, LOCALE_SHORT } from '@/lib/i18n';

const LOCALES: Locale[] = ['ko', 'en', 'ja'];

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${
            locale === l
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          title={l === 'ko' ? '한국어' : l === 'en' ? 'English' : '日本語'}
        >
          {LOCALE_SHORT[l]}
        </button>
      ))}
    </div>
  );
}
