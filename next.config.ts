import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: [".monkeycode-ai.live"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "masom.com" },
      { protocol: "https", hostname: "www.masom.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      // YouTube video thumbnails for the homepage Live & Recent Streams section.
      { protocol: "https", hostname: "i.ytimg.com" },
      // Pexels background photo for the homepage newsletter section.
      { protocol: "https", hostname: "images.pexels.com" },
      // NOTE: external banner images (arbitrary https hosts) are intentionally
      // NOT added here — they render via a plain responsive <img> in the hero
      // slider, so no per-domain remotePatterns entry is needed.
    ],
  },
};

export default nextConfig;
