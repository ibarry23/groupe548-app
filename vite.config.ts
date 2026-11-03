import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import pkg from './package.json';

// `base: './'` keeps asset paths relative so the same build runs on the web,
// as an installed PWA, and inside the Capacitor iOS/Android shells.
export default defineConfig({
  plugins: [react()],
  base: './',
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  server: { port: 5173 },
  build: { target: 'es2020', sourcemap: false },
});
