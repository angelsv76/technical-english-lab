import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// `vite build --mode sqlite` genera la versión local (dist-local) que sirve servidor/.
export default defineConfig(({mode}) => {
  const local = mode === 'sqlite';
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: local ? {'import.meta.env.VITE_BACKEND': JSON.stringify('local')} : {},
    build: {outDir: local ? 'dist-local' : 'dist'},
    server: local
      ? {proxy: {'/api': 'http://localhost:3000', '/fotos': 'http://localhost:3000', '/audio': 'http://localhost:3000'}}
      : {},
  };
});
