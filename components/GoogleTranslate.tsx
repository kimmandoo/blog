'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate: {
        TranslateElement: new (
          options: { pageLanguage: string; includedLanguages: string; autoDisplay: boolean },
          elementId: string
        ) => void;
      };
    };
  }
}

export function GoogleTranslate() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (document.getElementById('google-translate-script')) return;

    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'ko',
            includedLanguages: 'ko,en,ja',
            autoDisplay: false,
          },
          'google_translate_element'
        );
        setLoaded(true);
      }
    };

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-105 transition-all duration-300">
      <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
      </svg>
      <div id="google_translate_element" className="google-translate-wrapper" />
      {!loaded && (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">번역</span>
      )}
    </div>
  );
}
