import { defineConfig } from "eslint/config";
import eslint from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

// Downgrade only "error" rules to "warn"
const tsConfigsWarn = tseslint.configs.recommended.map((config) => {
  if (!config.rules) return config;

  const newRules = Object.fromEntries(
    Object.entries(config.rules).map(([rule, value]) => {
      // value can be: "error" | "warn" | "off" | [level, options]
      if (value === "error") {
        return [rule, "warn"];
      }

      if (Array.isArray(value) && value[0] === "error") {
        return [rule, ["warn", ...value.slice(1)]];
      }

      return [rule, value];
    }),
  );

  return {
    ...config,
    rules: newRules,
  };
});

export default defineConfig(eslint.configs.recommended, ...tsConfigsWarn, {
  plugins: {
    "react-hooks": reactHooks,
  },
  rules: {
    "react-hooks/exhaustive-deps": "warn",
  },
});
