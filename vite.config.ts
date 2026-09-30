import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  // `vite build` and `vite preview` both default to production mode, so they agree on the Pages sub-path
  base: mode === 'production' ? '/movie-db-webapp/' : '/',
  plugins: [react()],
}));
