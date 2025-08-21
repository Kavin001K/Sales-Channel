import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    // Explicitly configure CSS processing to avoid Sass-related build errors
    modules: false,
    preprocessorOptions: {
      // Ensure CSS files are processed as regular CSS, not Sass
      css: {
        charset: false
      }
    }
  },
  build: {
    // Ensure proper CSS handling during build
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Ensure CSS files are properly named and processed
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'xlsx', 'sonner']
  },
  define: {
    global: 'globalThis'
  }
}));
