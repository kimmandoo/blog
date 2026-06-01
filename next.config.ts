import type { NextConfig } from "next";

const nextCommand = process.argv.find((arg) => ["dev", "build", "start"].includes(arg));

const nextConfig: NextConfig = {
  distDir: nextCommand === "dev"
    ? ".next-dev"
    : ".next",

  async headers() {
    return [
      {
        source: "/sitemap.xml",
        headers: [
          { key: "Content-Type", value: "application/xml; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400" },
          { key: "X-Robots-Tag", value: "noindex" },  // sitemap itself should not be indexed
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=86400, s-maxage=86400" },
        ],
      },
      {
        source: "/feed.xml",
        headers: [
          { key: "Content-Type", value: "application/rss+xml; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/rss",
        headers: [
          { key: "Content-Type", value: "application/rss+xml; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
};

export default nextConfig;
