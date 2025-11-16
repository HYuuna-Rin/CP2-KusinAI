import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true, // fail if 5173 is occupied so you can free it instead of auto-shifting
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  build: {
    outDir: 'dist', // ensure matches capacitor.config.json
    sourcemap: false,
  },
});
