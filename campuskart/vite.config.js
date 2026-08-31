import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: false,
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      'socket.io-client': '/src/vendor/socket.io.esm.min.js',
    },
  },
});
