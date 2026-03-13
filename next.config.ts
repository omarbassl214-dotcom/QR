import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/qr',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
