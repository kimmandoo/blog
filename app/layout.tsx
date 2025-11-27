import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import { themeConfig } from "@/config/theme.config";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { GoogleAdsense } from "@/components/GoogleAdsense";

const { seo, site } = themeConfig;

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
        url: seo.openGraph.defaultImage,
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
    images: [seo.openGraph.defaultImage],
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
  },
  verification: {
    google: seo.googleSearchConsole.enabled ? seo.googleSearchConsole.verificationCode : undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <GoogleAnalytics />
        <GoogleAdsense />
        {children}
      </body>
    </html>
  );
}
