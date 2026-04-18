import eslintConfig from "@repo/eslint-config/convex";
import { defineConfig } from "eslint/config";

export default defineConfig(eslintConfig, {
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["*/_generated/server"],
            importNames: ["mutation", "internalMutation"],
            message: "Use functions.ts for mutation",
          },
        ],
      },
    ],
  },
});
