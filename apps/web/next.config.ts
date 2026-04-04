import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  typedRoutes: true,
  reactCompiler: true,
  reactStrictMode: true,
  cacheComponents: true,
  experimental: { typedEnv: true, viewTransition: true },
};

export default nextConfig;
