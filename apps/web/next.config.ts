import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  cacheComponents: true,
  typescript: { ignoreBuildErrors: true },
  experimental: { typedEnv: true, viewTransition: true },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "aware-dalmatian-976.eu-west-1.convex.cloud",
      },
      {
        protocol: "https",
        hostname: "colorful-bloodhound-520.eu-west-1.convex.cloud",
      },
    ],
  },
};

export default nextConfig;
