import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/BrainbLUr/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: 'index.html'
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
