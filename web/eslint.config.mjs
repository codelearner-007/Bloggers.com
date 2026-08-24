import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Every colour must come from a semantic theme token (bg-background,
      // text-muted-foreground, bg-primary, border-border, bg-destructive...).
      // A raw Tailwind palette class or a hex literal fails the build.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXAttribute[name.name='className'] Literal[value=/\\b(bg|text|border|ring|from|to|via|decoration|divide|outline|shadow)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d{2,3}\\b/]",
          message:
            "Use a semantic theme token (bg-background, text-muted-foreground, bg-primary, border-border, bg-destructive), not a raw Tailwind palette colour.",
        },
        {
          selector: "Literal[value=/#[0-9a-fA-F]{3,8}\\b/]",
          message: "No hex colour literals. Define a CSS variable in globals.css.",
        },
      ],
    },
  },
]);

export default eslintConfig;
