import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  preview: {
    port: 4173,
    host: '0.0.0.0',
    allowedHosts: ['client-production-afb0.up.railway.app'],
  },
});
