import type { NextConfig } from "next";

const nextCommand = process.argv.find((arg) => ["dev", "build", "start"].includes(arg));

// GitHub Pages serves plain files, so the whole site is exported to `out/` at build time.
// trailingSlash emits `<route>/index.html`: every route also gets a same-named directory
// (segment prefetch files), and GitHub Pages resolves a directory before `<route>.html`.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  distDir: nextCommand === "dev"
    ? ".next-dev"
    : ".next",
};

export default nextConfig;
