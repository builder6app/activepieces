/// <reference types='vitest' />
import path from 'path';

import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import copy from 'rollup-plugin-copy'
import replace from '@rollup/plugin-replace';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/bui6lder-ui',

  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        secure: false,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        headers: {
          Host: '127.0.0.1:4700',
        },
        ws: true,
      },
    },
    port: 4700,
    host: '0.0.0.0',
  },

  preview: {
    port: 4800,
    host: 'localhost',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../react-ui/src'),
      '@activepieces/shared': path.resolve(
        __dirname,
        '../../packages/shared/src',
      ),
      'ee-embed-sdk': path.resolve(
        __dirname,
        '../../packages/ee/ui/embed-sdk/src',
      ),
      '@activepieces/ee-shared': path.resolve(
        __dirname,
        '../../packages/ee/shared/src',
      ),
      '@activepieces/pieces-framework': path.resolve(
        __dirname,
        '../../packages/pieces/community/framework/src',
      ),
    },
  },
  plugins: [
    react(),
    nxViteTsPaths(),
    checker({
      typescript: true,
    }),
    replace({
      preventAssignment: true,
      // 'API_URL': '"/api/automation"',
    }),
  ],
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  },

  build: {
    outDir: '../../dist/packages/builder6-ui',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      onLog(level, log, handler) {
        if (
          log.cause &&
          log.message.includes(`Can't resolve original location of error.`)
        ) {
          return;
        }
        handler(level, log);
      },
    },
  },
});
