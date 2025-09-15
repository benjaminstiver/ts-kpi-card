import { defineConfig } from "vite";

export default defineConfig({
  // Vercel serves at the root, so base = "/"
  base: "/",
  build: {
    // Make a STABLE filename so the TS URL never changes.
    rollupOptions: {
      output: {
        entryFileNames: "kpi-card.js",
        chunkFileNames: "kpi-card-[name].js",
        assetFileNames: "kpi-card-[name][extname]"
      }
    }
  }
});
