import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  productionBrowserSourceMaps: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      // perfil de portas alternativas (npm run dev:3100): front 3100, API 3101
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3100',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3101',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '289a818c45e4.ngrok-free.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'web-production-9043c.up.railway.app',
        pathname: '/rails/active_storage/**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  /* config options here */
};

export default nextConfig;
