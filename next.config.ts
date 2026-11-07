import type { NextConfig } from "next";

const nextCommand = process.argv.find((arg) => ["dev", "build", "start"].includes(arg));

const nextConfig: NextConfig = {
  output: "export",
  distDir: nextCommand === "dev"
    ? ".next-dev"
    : ".next",
};

export default nextConfig;
