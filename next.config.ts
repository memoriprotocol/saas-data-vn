import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.tiktokcdn.com" },
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.ggpht.com" },
      { protocol: "https", hostname: "**.shopee.vn" },
    ],
  },
  // Keep Turbopack from scanning generated artifact folders that other
  // tools write to concurrently (file locks crash the CSS pipeline).
  outputFileTracingExcludes: {
    "*": ["./kalodata-analysis/**", "./.rea-chrome-profile/**"],
  },
};

export default nextConfig;
