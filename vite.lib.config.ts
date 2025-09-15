import { defineConfig } from "vite";

export default defineConfig({
  base: "/",                       // served at root on Vercel
  build: {
    lib: {
      entry: "src/main.ts",        // your SDK-wrapped chart
      name: "KpiCard",
      formats: ["iife"],           // <-- classic script (NOT ESM)
      fileName: () => "kpi-card.js"
    },
    rollupOptions: {
      output: { inlineDynamicImports: true }  // single file
    }
  }
});
