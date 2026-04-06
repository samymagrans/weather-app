import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    /**
     * Proxy /api requests to the NestJS backend during development.
     * This avoids CORS issues without requiring the frontend to hardcode the backend URL.
     * In production, configure VITE_API_BASE_URL to point at the deployed backend.
     */
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        /**
         * Strip the /api prefix before forwarding to the backend,
         * because NestJS routes are registered without a global prefix.
         * e.g. /api/weather/current → /weather/current
         */
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
