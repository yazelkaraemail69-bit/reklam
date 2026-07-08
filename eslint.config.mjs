import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    // Ayrı bir Next.js projesi (kendi package.json/tsconfig/eslint'i var);
    // bu repoda sadece dijital-kartvizit-menu/ altında barındırılıyor.
    "dijital-kartvizit-menu/**",
  ]),
]);

export default eslintConfig;
