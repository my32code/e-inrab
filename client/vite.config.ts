import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
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
    define: {
      // Définit VITE_API_URL pour qu'il soit accessible via import.meta.env
      'import.meta.env.VITE_API_URL': JSON.stringify(
        mode === 'production'
          ? 'https://serveur-production-59e9.up.railway.app'
          : 'http://localhost:3001'
      ),
    },
  };
});
