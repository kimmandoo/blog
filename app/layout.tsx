import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import { themeConfig } from "@/config/theme.config";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { GoogleAdsense } from "@/components/GoogleAdsense";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

import { Footer } from "@/components/Footer";

const { seo, site } = themeConfig;
const ogImageUrl = `${seo.siteUrl}${seo.openGraph.defaultImage}`;

export const metadata: Metadata = {
  metadataBase: new URL(seo.siteUrl),
  title: {
    default: site.title,
    template: `%s | ${site.title}`,
  },
  description: site.description,
  keywords: ['blog', 'developer', 'programming', 'tech'],
  authors: [{ name: site.title }],
  creator: site.title,
  openGraph: {
    type: seo.openGraph.type as 'website',
    locale: seo.openGraph.locale,
    url: seo.siteUrl,
    siteName: seo.openGraph.siteName,
    title: site.title,
    description: site.description,
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: site.title,
      },
    ],
  },
  twitter: {
    card: seo.twitter.card as 'summary_large_image',
    title: site.title,
    description: site.description,
    images: [ogImageUrl],
    site: seo.twitter.site || undefined,
    creator: seo.twitter.creator || undefined,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: seo.siteUrl,
    types: {
      'application/rss+xml': `${seo.siteUrl}/feed.xml`,
    },
  },
  verification: {
    google: seo.googleSearchConsole.enabled && seo.googleSearchConsole.verificationCode 
      ? seo.googleSearchConsole.verificationCode 
      : undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <GoogleAnalytics />
          <GoogleAdsense />
          <ThemeToggle />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
