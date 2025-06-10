import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'localhost',
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  /* config options here */
};

export default nextConfig;
