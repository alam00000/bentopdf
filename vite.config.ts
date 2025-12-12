import { defineConfig, Plugin } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { resolve } from 'path';
import fs from 'fs';

function pagesRewritePlugin(): Plugin {
  return {
    name: 'pages-rewrite',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] || '';

        const langMatch = url.match(/^\/(en|de)(\/.*)?$/);
        if (langMatch) {
          const lang = langMatch[1];
          const restOfPath = langMatch[2] || '/';

          if (!langMatch[2]) {
            res.writeHead(302, { Location: `/${lang}/` });
            res.end();
            return;
          }
          if (restOfPath === '/') {
            req.url = '/index.html';
            return next();
          }
          const pagePath = restOfPath.slice(1);
          if (pagePath.endsWith('.html')) {
            const srcPath = resolve(__dirname, 'src/pages', pagePath);
            const rootPath = resolve(__dirname, pagePath);
            if (fs.existsSync(srcPath)) {
              req.url = `/src/pages/${pagePath}`;
            } else if (fs.existsSync(rootPath)) {
              req.url = `/${pagePath}`;
            }
          } else if (!pagePath.includes('.')) {
            const htmlPath = pagePath + '.html';
            const srcPath = resolve(__dirname, 'src/pages', htmlPath);
            const rootPath = resolve(__dirname, htmlPath);
            if (fs.existsSync(srcPath)) {
              req.url = `/src/pages/${htmlPath}`;
            } else if (fs.existsSync(rootPath)) {
              req.url = `/${htmlPath}`;
            }
          } else {
            req.url = restOfPath;
          }
          return next();
        }
        if (url.endsWith('.html') && !url.startsWith('/src/')) {
          const pageName = url.slice(1);
          const pagePath = resolve(__dirname, 'src/pages', pageName);
          if (fs.existsSync(pagePath)) {
            req.url = `/src/pages${url}`;
          }
        }
        next();
      });
    },
  };
}


function flattenPagesPlugin(): Plugin {
  return {
    name: 'flatten-pages',
    enforce: 'post',
    generateBundle(_, bundle) {
      for (const fileName of Object.keys(bundle)) {
        if (fileName.startsWith('src/pages/') && fileName.endsWith('.html')) {
          const newFileName = fileName.replace('src/pages/', '');
          bundle[newFileName] = bundle[fileName];
          bundle[newFileName].fileName = newFileName;
          delete bundle[fileName];
        }
      }
    },
  };
}

export default defineConfig(({ mode }) => ({
  base: process.env.BASE_URL || '/',
  plugins: [
    pagesRewritePlugin(),
    flattenPagesPlugin(),
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
        'merge-pdf': resolve(__dirname, 'src/pages/merge-pdf.html'),
        'split-pdf': resolve(__dirname, 'src/pages/split-pdf.html'),
        'compress-pdf': resolve(__dirname, 'src/pages/compress-pdf.html'),
        'edit-pdf': resolve(__dirname, 'src/pages/edit-pdf.html'),
        'jpg-to-pdf': resolve(__dirname, 'src/pages/jpg-to-pdf.html'),
        'sign-pdf': resolve(__dirname, 'src/pages/sign-pdf.html'),
        'crop-pdf': resolve(__dirname, 'src/pages/crop-pdf.html'),
        'extract-pages': resolve(__dirname, 'src/pages/extract-pages.html'),
        'delete-pages': resolve(__dirname, 'src/pages/delete-pages.html'),
        'organize-pdf': resolve(__dirname, 'src/pages/organize-pdf.html'),
        'page-numbers': resolve(__dirname, 'src/pages/page-numbers.html'),
        'add-watermark': resolve(__dirname, 'src/pages/add-watermark.html'),
        'header-footer': resolve(__dirname, 'src/pages/header-footer.html'),
        'invert-colors': resolve(__dirname, 'src/pages/invert-colors.html'),
        'background-color': resolve(__dirname, 'src/pages/background-color.html'),
        'text-color': resolve(__dirname, 'src/pages/text-color.html'),
        'remove-annotations': resolve(__dirname, 'src/pages/remove-annotations.html'),
        'remove-blank-pages': resolve(__dirname, 'src/pages/remove-blank-pages.html'),
        'image-to-pdf': resolve(__dirname, 'src/pages/image-to-pdf.html'),
        'png-to-pdf': resolve(__dirname, 'src/pages/png-to-pdf.html'),
        'webp-to-pdf': resolve(__dirname, 'src/pages/webp-to-pdf.html'),
        'svg-to-pdf': resolve(__dirname, 'src/pages/svg-to-pdf.html'),
        'form-filler': resolve(__dirname, 'src/pages/form-filler.html'),
        'reverse-pages': resolve(__dirname, 'src/pages/reverse-pages.html'),
        'add-blank-page': resolve(__dirname, 'src/pages/add-blank-page.html'),
        'divide-pages': resolve(__dirname, 'src/pages/divide-pages.html'),
        'rotate-pdf': resolve(__dirname, 'src/pages/rotate-pdf.html'),
        'n-up-pdf': resolve(__dirname, 'src/pages/n-up-pdf.html'),
        'combine-single-page': resolve(__dirname, 'src/pages/combine-single-page.html'),
        'view-metadata': resolve(__dirname, 'src/pages/view-metadata.html'),
        'edit-metadata': resolve(__dirname, 'src/pages/edit-metadata.html'),
        'pdf-to-zip': resolve(__dirname, 'src/pages/pdf-to-zip.html'),
        'alternate-merge': resolve(__dirname, 'src/pages/alternate-merge.html'),
        'compare-pdfs': resolve(__dirname, 'src/pages/compare-pdfs.html'),
        'add-attachments': resolve(__dirname, 'src/pages/add-attachments.html'),
        'edit-attachments': resolve(__dirname, 'src/pages/edit-attachments.html'),
        'extract-attachments': resolve(__dirname, 'src/pages/extract-attachments.html'),
        'ocr-pdf': resolve(__dirname, 'src/pages/ocr-pdf.html'),
        'posterize-pdf': resolve(__dirname, 'src/pages/posterize-pdf.html'),
        'fix-page-size': resolve(__dirname, 'src/pages/fix-page-size.html'),
        'remove-metadata': resolve(__dirname, 'src/pages/remove-metadata.html'),
        'decrypt-pdf': resolve(__dirname, 'src/pages/decrypt-pdf.html'),
        'flatten-pdf': resolve(__dirname, 'src/pages/flatten-pdf.html'),
        'encrypt-pdf': resolve(__dirname, 'src/pages/encrypt-pdf.html'),
        'linearize-pdf': resolve(__dirname, 'src/pages/linearize-pdf.html'),
        'remove-restrictions': resolve(__dirname, 'src/pages/remove-restrictions.html'),
        'change-permissions': resolve(__dirname, 'src/pages/change-permissions.html'),
        'sanitize-pdf': resolve(__dirname, 'src/pages/sanitize-pdf.html'),
        'page-dimensions': resolve(__dirname, 'src/pages/page-dimensions.html'),
        'bmp-to-pdf': resolve(__dirname, 'src/pages/bmp-to-pdf.html'),
        'heic-to-pdf': resolve(__dirname, 'src/pages/heic-to-pdf.html'),
        'tiff-to-pdf': resolve(__dirname, 'src/pages/tiff-to-pdf.html'),
        'txt-to-pdf': resolve(__dirname, 'src/pages/txt-to-pdf.html'),
        'pdf-to-bmp': resolve(__dirname, 'src/pages/pdf-to-bmp.html'),
        'pdf-to-greyscale': resolve(__dirname, 'src/pages/pdf-to-greyscale.html'),
        'pdf-to-jpg': resolve(__dirname, 'src/pages/pdf-to-jpg.html'),
        'pdf-to-png': resolve(__dirname, 'src/pages/pdf-to-png.html'),
        'pdf-to-tiff': resolve(__dirname, 'src/pages/pdf-to-tiff.html'),
        'pdf-to-webp': resolve(__dirname, 'src/pages/pdf-to-webp.html'),

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
