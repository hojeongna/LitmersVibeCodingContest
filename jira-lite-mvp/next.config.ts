import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disabled cacheComponents due to issues with client-side data fetching hooks
  // causing prerender errors on dynamic routes
  cacheComponents: false,
};

export default nextConfig;
