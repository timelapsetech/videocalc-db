import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@repo-data': path.resolve(__dirname, 'data'),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: false
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});