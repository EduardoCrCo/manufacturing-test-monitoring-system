import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Base URL for GitHub Pages deployment
  base: "/manufacturing_test_monitoring_system/",

  // Build configuration for production
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    sourcemap: false, // Disable for production (faster builds)
    rollupOptions: {
      output: {
        // Optimize chunk splitting for better caching
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },

  // Development server configuration
  server: {
    port: 5173,
    host: true,
    open: true, // Auto-open browser in development
  },

  // Preview server (for testing production build locally)
  preview: {
    port: 4173,
    host: true,
  },
});
