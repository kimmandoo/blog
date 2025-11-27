'use client';

import Script from 'next/script';
import { themeConfig } from '@/config/theme.config';

export function GoogleAdsense() {
  const { enabled, clientId } = themeConfig.seo.googleAdsense;

  if (!enabled || !clientId) {
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
