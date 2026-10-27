import type { Metadata } from "next";
import { IBM_Plex_Sans_KR, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { themeConfig } from "@/config/theme.config";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { GoogleAdsense } from "@/components/GoogleAdsense";
import { ThemeProvider } from "@/components/ThemeProvider";

import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { toAbsolutePageUrl } from "@/lib/metadata";

const bodyFont = IBM_Plex_Sans_KR({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  preload: false,
});
const editorialFont = Noto_Serif_KR({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-editorial",
  display: "swap",
  preload: false,
});

const { seo, site } = themeConfig;
const ogImageUrl = seo.openGraph.defaultImage.startsWith("http://") || seo.openGraph.defaultImage.startsWith("https://")
  ? seo.openGraph.defaultImage
  : toAbsolutePageUrl(seo.openGraph.defaultImage);

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
      <body className={`${bodyFont.variable} ${editorialFont.variable} antialiased`}>
        <ThemeProvider>
          <GoogleAnalytics />
          <GoogleAdsense />
          <Navigation />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
