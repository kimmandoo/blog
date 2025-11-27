'use client';

import Script from 'next/script';
import { themeConfig } from '@/config/theme.config';

export function GoogleAnalytics() {
  const { enabled, measurementId } = themeConfig.seo.googleAnalytics;

  if (!enabled || !measurementId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
