import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize output with cache-busting hashes
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          // Map stack stays isolated from the main bundle
          'map-vendor': ['leaflet', 'react-leaflet', 'react-leaflet-cluster', 'leaflet.markercluster'],
          // Form/validation stack in its own chunk
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Auth stack (routing + http clients) kept together
          'auth-vendor': ['@supabase/supabase-js', '@tanstack/react-query'],
        },
        // Add hash to filenames for cache busting
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
      },
    },
    // Minification and optimization with esbuild (faster than terser)
    minify: 'esbuild',
    esbuild: {
      drop: ['console', 'debugger'], // Remove console.logs and debuggers in production
    },
    // Set chunk size warning limit
    chunkSizeWarningLimit: 600,
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/__tests__/setup.ts",
    globals: true,
  },
}));
