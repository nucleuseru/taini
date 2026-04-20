import convexConfig from "@repo/eslint-config/convex";
import nextConfig from "@repo/eslint-config/next";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig(
  globalIgnores(["out/**", "build/**", ".next/**", "next-env.d.ts"]),
  convexConfig,
  nextConfig,
);
