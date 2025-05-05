import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3001' // Proxy vers le backend
    }
  },
  plugins: [react()]
});
