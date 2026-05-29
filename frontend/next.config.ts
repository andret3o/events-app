import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["industriously-unchaffing-ben.ngrok-free.dev"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      new URL("https://res.cloudinary.com/dqck13qsw/image/upload/**"),
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  output: "standalone",
};

export default nextConfig;
