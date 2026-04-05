import convexConfig from "@repo/eslint-config/convex";
import nextConfig from "@repo/eslint-config/next";
import { defineConfig, globalIgnores } from "eslint";

export default defineConfig(
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  nextConfig,
  convexConfig,
);
