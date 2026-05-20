import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Telefoon/tablet op hetzelfde Wi‑Fi: site via http://<lan-ip>:3000
  allowedDevOrigins: [
    "192.168.1.120",
    ...(process.env.ALLOWED_DEV_ORIGINS?.split(",").map((s) => s.trim()) ??
      []),
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.vvh-harlingen.nl",
      },
      {
        protocol: "https",
        hostname: "**.vvh-harlingen.nl",
      },
    ],
  },
};

export default withSerwist(nextConfig);
