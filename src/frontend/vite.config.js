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
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          dfinity: ['@dfinity/agent', '@dfinity/identity', '@dfinity/auth-client'],
          ui: ['@heroicons/vue', '@fortawesome/fontawesome-free'],
          charts: ['chart.js', 'd3'],
          crypto: ['ethers', '@solana/web3.js', 'bip39'],
          utils: ['lodash-es', 'date-fns', 'uuid']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  esbuild: {
    supported: {
      'top-level-await': true,
    },
  },
  optimizeDeps: {
    exclude: [
      'brotli-wasm',
      'brotli-wasm/pkg.bundler/brotli_wasm_bg.wasm'
    ],
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
      globals: {
        Buffer: true,
        process: true,
      },
    }),
    environment('all', { prefix: 'CANISTER_' }),
    environment('all', { prefix: 'DFX_' })
  ],
  resolve: {
    alias: [
      { find: 'declarations', replacement: fileURLToPath(new URL('../declarations', import.meta.url)) },
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
    dedupe: ['@dfinity/agent'],
  }
});