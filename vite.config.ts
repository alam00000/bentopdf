import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [
    tailwindcss(),
    nodePolyfills({
      include: ['buffer', 'stream', 'util', 'zlib', 'process'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  define: {
    __SIMPLE_MODE__: JSON.stringify(process.env.SIMPLE_MODE === 'true'),
  },
  resolve: {
    alias: {
      stream: 'stream-browserify',
      zlib: 'browserify-zlib',
    },
  },
  optimizeDeps: {
    include: ['pdfkit', 'blob-stream'],
    exclude: ['coherentpdf'],
  },
  server: {
    host: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html'),
        faq: resolve(__dirname, 'faq.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms: resolve(__dirname, 'terms.html'),
        bookmark: resolve(__dirname, 'src/pages/bookmark.html'),
        licensing: resolve(__dirname, 'licensing.html'),
        'table-of-contents': resolve(
          __dirname,
          'src/pages/table-of-contents.html'
        ),
        'pdf-to-json': resolve(__dirname, 'src/pages/pdf-to-json.html'),
        'json-to-pdf': resolve(__dirname, 'src/pages/json-to-pdf.html'),
        'pdf-multi-tool': resolve(__dirname, 'src/pages/pdf-multi-tool.html'),
        'add-stamps': resolve(__dirname, 'src/pages/add-stamps.html'),
        'form-creator': resolve(__dirname, 'src/pages/form-creator.html'),
        'repair-pdf': resolve(__dirname, 'src/pages/repair-pdf.html'),
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '*.config.ts',
        '**/*.d.ts',
        'dist/',
      ],
    },
  },
}));
