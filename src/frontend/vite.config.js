import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vite';
import environment from 'vite-plugin-environment';
import vue from '@vitejs/plugin-vue';
import dotenv from 'dotenv';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

dotenv.config({ path: '../../.env' });

export default defineConfig({
  build: {
    emptyOutDir: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://ic0.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [
    vue(),
    nodePolyfills({
      // Polyfill specific Node.js globals and modules
      globals: {
        Buffer: true, // Enable Buffer polyfill
        process: true, // Enable process polyfill
      },
    }),
    environment('all', { prefix: 'CANISTER_' }),
    environment('all', { prefix: 'DFX_' }),
  ],
  resolve: {
    alias: [
      { find: 'declarations', replacement: fileURLToPath(new URL('../declarations', import.meta.url)) },
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
    dedupe: ['@dfinity/agent'],
  }
});
