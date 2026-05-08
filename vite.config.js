import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      // '@/foo' → '<root>/src/foo'
      // This makes every import like @/api/apiClient, @/lib/..., @/components/... work correctly.
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
