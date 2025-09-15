// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
  base: "/",                    // Vercel serves at the root
  build: {
    lib: {
      entry: "src/main.ts",     // your SDK-wrapped chart code
      name: "KpiCard",
      formats: ["iife"],        // classic script (NOT ESM)
      fileName: () => "kpi-card.js"
    },
    rollupOptions: {
      output: { inlineDynamicImports: true } // force a single file
    }
  }
});
