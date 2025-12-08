import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: true, // Required for static export
  },
  productionBrowserSourceMaps: false,
};

export default nextConfig;
