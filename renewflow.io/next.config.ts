import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    // Allow build even with TS errors during initial migration
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
