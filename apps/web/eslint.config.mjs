import eslintConfig from "@repo/eslint-config/next";
import { defineConfig, globalIgnores } from "eslint";

export default defineConfig(
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  eslintConfig,
);
