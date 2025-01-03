/// <reference types='vitest' />
import path from 'path';

import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import copy from 'rollup-plugin-copy'

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/react-umd',

  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        secure: false,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        headers: {
          Host: '127.0.0.1:4200',
        },
        ws: true,
      },
    },
    port: 4200,
    host: '0.0.0.0',
  },

  preview: {
    port: 4500,
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
    copy({
      targets: [
        {
          src: 'index.html',
          dest: 'dist'
        }
      ]
    })
  ],

  define: {
    'process.env.NODE_ENV': JSON.stringify('production'), // or 'development'
  },
  build: {
    outDir: './dist',
    emptyOutDir: false,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: './src/index.ts', // 入口文件
      name: 'Activepieces', // UMD 模块名称
      fileName: (format) => `index.${format}.js`,
      formats: ['umd'], // 输出格式
    },
    rollupOptions: {
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@builder6/react': 'Builder6React',
        },
      },
      "external": ["react", "react-dom", "@builder6/react"],
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
