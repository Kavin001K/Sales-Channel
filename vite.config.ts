import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  server: {
    port: 8080
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "..", "shared"),
      "@assets": path.resolve(__dirname, "..", "attached_assets"),
    },
    // Prevent Node.js modules from being bundled for the browser
    browserField: true,
  },
  root: ".",
  build: {
    outDir: path.resolve(__dirname, "..", "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core dependencies
          vendor: ['react', 'react-dom', 'react-router-dom'],

          // UI components
          ui: [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            'sonner'
          ],

          // Charts
          charts: ['recharts'],

          // PDF generation (lazy loaded, but chunked separately)
          pdf: ['@react-pdf/renderer'],

          // Animations
          animations: ['framer-motion'],

          // Forms
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],

          // Table
          table: ['@tanstack/react-table'],
        },
      },
      external: [],
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB for larger chunks
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['pg'],
  },
  define: {
    'process.env': {},
  },
});
