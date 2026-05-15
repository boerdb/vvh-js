import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
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
