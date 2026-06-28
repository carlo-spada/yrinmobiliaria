import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";
import eslintPluginImport from "eslint-plugin-import";

export default tseslint.config(
  { ignores: ["dist", ".next", "next-env.d.ts"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: { "react-hooks": reactHooks, "@next/next": nextPlugin, import: eslintPluginImport },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Reglas oficiales de Next.js (App Router). Sustituyen a eslint-plugin-react-refresh,
      // un artefacto del antiguo build con Vite: su regla only-export-components es un falso
      // positivo en App Router, donde los page.tsx deben exportar generateMetadata/metadata
      // junto al componente por defecto.
      ...nextPlugin.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "import/order": [
        "warn",
        {
          groups: [["builtin", "external"], ["internal"], ["parent", "sibling", "index"]],
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },
);
