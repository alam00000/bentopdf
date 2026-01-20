import { defineConfig, Plugin } from 'vitest/config';
import type { IncomingMessage, ServerResponse } from 'http';
import type { Connect } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import viteCompression from 'vite-plugin-compression';
import handlebars from 'vite-plugin-handlebars';
import { resolve } from 'path';
import fs from 'fs';
import { constants as zlibConstants } from 'zlib';
import type { OutputBundle } from 'rollup';

const SUPPORTED_LANGUAGES = [
  'en',
  'de',
  'es',
  'zh',
  'zh-TW',
  'vi',
  'it',
  'id',
  'tr',
  'fr',
  'pt',
] as const;
const LANG_REGEX = new RegExp(
  `^/(${SUPPORTED_LANGUAGES.join('|')})(?:/(.*))?$`
);

function loadPages(): Set<string> {
  const pagesDir = resolve(__dirname, 'src/pages');
  const pages = new Set<string>();

  if (fs.existsSync(pagesDir)) {
    for (const file of fs.readdirSync(pagesDir)) {
      if (file.endsWith('.html')) {
        pages.add(file.replace('.html', ''));
      }
    }
  }

  const rootPages = [
    'index',
    'about',
    'contact',
    'faq',
    'privacy',
    'terms',
    'licensing',
    'tools',
    '404',
    'pdf-converter',
    'pdf-editor',
    'pdf-security',
    'pdf-merge-split',
  ];
  rootPages.forEach((p) => pages.add(p));

  return pages;
}

const PAGES = loadPages();

function getBasePath(): string {
  return (process.env.BASE_URL || '/').replace(/\/$/, '');
}

function createLanguageMiddleware(isDev: boolean): Connect.NextHandleFunction {
  return (
    req: IncomingMessage,
    res: ServerResponse,
    next: Connect.NextFunction
  ): void => {
    if (!req.url) return next();

    const basePath = getBasePath();
    const [fullPathname, queryString] = req.url.split('?');

    let pathname = fullPathname;
    if (basePath && basePath !== '/' && pathname.startsWith(basePath)) {
      pathname = pathname.slice(basePath.length) || '/';
    }

    if (!pathname.startsWith('/')) {
      pathname = '/' + pathname;
    }

    const match = pathname.match(LANG_REGEX);

    if (match) {
      const lang = match[1];
      const rest = match[2] ?? '';

      if (rest === '' && !pathname.endsWith('/')) {
        const redirectUrl = basePath ? `${basePath}/${lang}/` : `/${lang}/`;
        res.statusCode = 302;
        res.setHeader(
          'Location',
          redirectUrl + (queryString ? `?${queryString}` : '')
        );
        res.end();
        return;
      }

      if (rest === '' || rest === '/') {
        if (isDev) {
          req.url = '/index.html' + (queryString ? `?${queryString}` : '');
        } else {
          const langIndexPath = resolve(__dirname, 'dist', lang, 'index.html');
          if (fs.existsSync(langIndexPath)) {
            req.url =
              `/${lang}/index.html` + (queryString ? `?${queryString}` : '');
          } else {
            req.url = '/index.html' + (queryString ? `?${queryString}` : '');
          }
        }
        return next();
      }

      const cleanPath = rest.replace(/\/$/, '').replace(/\.html$/, '');
      const pageName = cleanPath.split('/')[0];

      if (pageName && PAGES.has(pageName)) {
        if (isDev) {
          const srcPath = resolve(__dirname, 'src/pages', `${pageName}.html`);
          if (fs.existsSync(srcPath)) {
            req.url =
              `/src/pages/${pageName}.html` +
              (queryString ? `?${queryString}` : '');
          } else {
            req.url =
              `/${pageName}.html` + (queryString ? `?${queryString}` : '');
          }
        } else {
          const langPagePath = resolve(
            __dirname,
            'dist',
            lang,
            `${pageName}.html`
          );
          if (fs.existsSync(langPagePath)) {
            req.url =
              `/${lang}/${pageName}.html` +
              (queryString ? `?${queryString}` : '');
          } else {
            req.url =
              `/${pageName}.html` + (queryString ? `?${queryString}` : '');
          }
        }
      } else if (!cleanPath.includes('.')) {
        if (isDev) {
          req.url =
            `/${cleanPath}.html` + (queryString ? `?${queryString}` : '');
        } else {
          const langPagePath = resolve(
            __dirname,
            'dist',
            lang,
            `${cleanPath}.html`
          );
          if (fs.existsSync(langPagePath)) {
            req.url =
              `/${lang}/${cleanPath}.html` +
              (queryString ? `?${queryString}` : '');
          } else {
            req.url =
              `/${cleanPath}.html` + (queryString ? `?${queryString}` : '');
          }
        }
      }

      return next();
    }

    if (isDev && pathname.endsWith('.html') && !pathname.startsWith('/src/')) {
      const pageName = pathname.slice(1).replace('.html', '');
      if (PAGES.has(pageName)) {
        const srcPath = resolve(__dirname, 'src/pages', `${pageName}.html`);
        if (fs.existsSync(srcPath)) {
          req.url =
            `/src/pages/${pageName}.html` +
            (queryString ? `?${queryString}` : '');
          return next();
        }
      }
    }

    next();
  };
}

function languageRouterPlugin(): Plugin {
  return {
    name: 'language-router',
    configureServer(server) {
      server.middlewares.use(createLanguageMiddleware(true));
    },
    configurePreviewServer(server) {
      server.middlewares.use(createLanguageMiddleware(false));
    },
  };
}

function flattenPagesPlugin(): Plugin {
  return {
    name: 'flatten-pages',
    enforce: 'post',
    generateBundle(_: unknown, bundle: OutputBundle): void {
      for (const fileName of Object.keys(bundle)) {
        if (fileName.startsWith('src/pages/') && fileName.endsWith('.html')) {
          const newFileName = fileName.replace('src/pages/', '');
          bundle[newFileName] = bundle[fileName];
          bundle[newFileName].fileName = newFileName;
          delete bundle[fileName];
        }
      }
      if (process.env.SIMPLE_MODE === 'true' && bundle['simple-index.html']) {
        bundle['index.html'] = bundle['simple-index.html'];
        bundle['index.html'].fileName = 'index.html';
        delete bundle['simple-index.html'];
      }
    },
  };
}

function rewriteHtmlPathsPlugin(): Plugin {
  const baseUrl = process.env.BASE_URL || '/';
  const normalizedBase = baseUrl.replace(/\/?$/, '/');

  const escapedBase = normalizedBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return {
    name: 'rewrite-html-paths',
    enforce: 'post',
    generateBundle(_: unknown, bundle: OutputBundle): void {
      if (normalizedBase === '/') return;

      for (const fileName of Object.keys(bundle)) {
        if (fileName.endsWith('.html')) {
          const asset = bundle[fileName];
          if (asset.type === 'asset' && typeof asset.source === 'string') {
            const hrefRegex = new RegExp(
              `href="\\/(?!${escapedBase.slice(1)}|test\\/|http|\\/\\/)`,
              'g'
            );
            const srcRegex = new RegExp(
              `src="\\/(?!${escapedBase.slice(1)}|test\\/|http|\\/\\/)`,
              'g'
            );
            const contentRegex = new RegExp(
              `content="\\/(?!${escapedBase.slice(1)}|test\\/|http|\\/\\/)`,
              'g'
            );

            asset.source = asset.source
              .replace(hrefRegex, `href="${normalizedBase}`)
              .replace(srcRegex, `src="${normalizedBase}`)
              .replace(contentRegex, `content="${normalizedBase}`);
          }
        }
      }
    },
  };
}

export default defineConfig(() => {
  const USE_CDN = process.env.VITE_USE_CDN === 'true';

  if (USE_CDN) {
    console.log('[Vite] Using CDN for WASM files (with local fallback)');
  } else {
    console.log('[Vite] Using local WASM files only');
  }

  const staticCopyTargets = [
    {
      src: 'node_modules/@bentopdf/pymupdf-wasm/assets/*.wasm',
      dest: 'pymupdf-wasm',
    },
    {
      src: 'node_modules/@bentopdf/pymupdf-wasm/assets/*.js',
      dest: 'pymupdf-wasm',
    },
    {
      src: 'node_modules/@bentopdf/pymupdf-wasm/assets/*.whl',
      dest: 'pymupdf-wasm',
    },
    {
      src: 'node_modules/@bentopdf/pymupdf-wasm/assets/*.zip',
      dest: 'pymupdf-wasm',
    },
    {
      src: 'node_modules/@bentopdf/pymupdf-wasm/assets/*.json',
      dest: 'pymupdf-wasm',
    },
    {
      src: 'node_modules/@bentopdf/gs-wasm/assets/*.wasm',
      dest: 'ghostscript-wasm',
    },
    {
      src: 'node_modules/@bentopdf/gs-wasm/assets/*.js',
      dest: 'ghostscript-wasm',
    },
    {
      src: 'node_modules/embedpdf-snippet/dist/pdfium.wasm',
      dest: 'embedpdf',
    },
  ];

  return {
    base: (process.env.BASE_URL || '/').replace(/\/?$/, '/'),
    plugins: [
      handlebars({
        partialDirectory: resolve(__dirname, 'src/partials'),
        context: {
          baseUrl: (process.env.BASE_URL || '/').replace(/\/?$/, '/'),
          simpleMode: process.env.SIMPLE_MODE === 'true',
        },
      }),
      languageRouterPlugin(),
      flattenPagesPlugin(),
      rewriteHtmlPathsPlugin(),
      tailwindcss(),
      nodePolyfills({
        include: ['buffer', 'stream', 'util', 'zlib', 'process'],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
      }),
      viteStaticCopy({
        targets: staticCopyTargets,
      }),
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
        compressionOptions: {
          params: {
            [zlibConstants.BROTLI_PARAM_QUALITY]: 11,
            [zlibConstants.BROTLI_PARAM_MODE]: zlibConstants.BROTLI_MODE_TEXT,
          },
        },
        deleteOriginFile: false,
      }),
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024,
        compressionOptions: {
          level: 9,
        },
        deleteOriginFile: false,
      }),
    ],
    define: {
      __SIMPLE_MODE__: JSON.stringify(process.env.SIMPLE_MODE === 'true'),
    },
    resolve: {
      alias: {
        '@/types': resolve(__dirname, 'src/js/types/index.ts'),
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
          main:
            process.env.SIMPLE_MODE === 'true'
              ? resolve(__dirname, 'simple-index.html')
              : resolve(__dirname, 'index.html'),
          about: resolve(__dirname, 'about.html'),
          contact: resolve(__dirname, 'contact.html'),
          faq: resolve(__dirname, 'faq.html'),
          privacy: resolve(__dirname, 'privacy.html'),
          terms: resolve(__dirname, 'terms.html'),
          licensing: resolve(__dirname, 'licensing.html'),
          tools: resolve(__dirname, 'tools.html'),
          '404': resolve(__dirname, '404.html'),
          // Category Hub Pages
          'pdf-converter': resolve(__dirname, 'pdf-converter.html'),
          'pdf-editor': resolve(__dirname, 'pdf-editor.html'),
          'pdf-security': resolve(__dirname, 'pdf-security.html'),
          'pdf-merge-split': resolve(__dirname, 'pdf-merge-split.html'),
          // Tool Pages
          bookmark: resolve(__dirname, 'src/pages/bookmark.html'),
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
          'background-color': resolve(
            __dirname,
            'src/pages/background-color.html'
          ),
          'text-color': resolve(__dirname, 'src/pages/text-color.html'),
          'remove-annotations': resolve(
            __dirname,
            'src/pages/remove-annotations.html'
          ),
          'remove-blank-pages': resolve(
            __dirname,
            'src/pages/remove-blank-pages.html'
          ),
          'image-to-pdf': resolve(__dirname, 'src/pages/image-to-pdf.html'),
          'png-to-pdf': resolve(__dirname, 'src/pages/png-to-pdf.html'),
          'webp-to-pdf': resolve(__dirname, 'src/pages/webp-to-pdf.html'),
          'svg-to-pdf': resolve(__dirname, 'src/pages/svg-to-pdf.html'),
          'form-filler': resolve(__dirname, 'src/pages/form-filler.html'),
          'reverse-pages': resolve(__dirname, 'src/pages/reverse-pages.html'),
          'add-blank-page': resolve(__dirname, 'src/pages/add-blank-page.html'),
          'divide-pages': resolve(__dirname, 'src/pages/divide-pages.html'),
          'rotate-pdf': resolve(__dirname, 'src/pages/rotate-pdf.html'),
          'rotate-custom': resolve(__dirname, 'src/pages/rotate-custom.html'),
          'n-up-pdf': resolve(__dirname, 'src/pages/n-up-pdf.html'),
          'combine-single-page': resolve(
            __dirname,
            'src/pages/combine-single-page.html'
          ),
          'view-metadata': resolve(__dirname, 'src/pages/view-metadata.html'),
          'edit-metadata': resolve(__dirname, 'src/pages/edit-metadata.html'),
          'pdf-to-zip': resolve(__dirname, 'src/pages/pdf-to-zip.html'),
          'alternate-merge': resolve(
            __dirname,
            'src/pages/alternate-merge.html'
          ),
          'compare-pdfs': resolve(__dirname, 'src/pages/compare-pdfs.html'),
          'add-attachments': resolve(
            __dirname,
            'src/pages/add-attachments.html'
          ),
          'edit-attachments': resolve(
            __dirname,
            'src/pages/edit-attachments.html'
          ),
          'extract-attachments': resolve(
            __dirname,
            'src/pages/extract-attachments.html'
          ),
          'ocr-pdf': resolve(__dirname, 'src/pages/ocr-pdf.html'),
          'posterize-pdf': resolve(__dirname, 'src/pages/posterize-pdf.html'),
          'fix-page-size': resolve(__dirname, 'src/pages/fix-page-size.html'),
          'remove-metadata': resolve(
            __dirname,
            'src/pages/remove-metadata.html'
          ),
          'decrypt-pdf': resolve(__dirname, 'src/pages/decrypt-pdf.html'),
          'flatten-pdf': resolve(__dirname, 'src/pages/flatten-pdf.html'),
          'encrypt-pdf': resolve(__dirname, 'src/pages/encrypt-pdf.html'),
          'linearize-pdf': resolve(__dirname, 'src/pages/linearize-pdf.html'),
          'remove-restrictions': resolve(
            __dirname,
            'src/pages/remove-restrictions.html'
          ),
          'change-permissions': resolve(
            __dirname,
            'src/pages/change-permissions.html'
          ),
          'sanitize-pdf': resolve(__dirname, 'src/pages/sanitize-pdf.html'),
          'page-dimensions': resolve(
            __dirname,
            'src/pages/page-dimensions.html'
          ),
          'bmp-to-pdf': resolve(__dirname, 'src/pages/bmp-to-pdf.html'),
          'heic-to-pdf': resolve(__dirname, 'src/pages/heic-to-pdf.html'),
          'tiff-to-pdf': resolve(__dirname, 'src/pages/tiff-to-pdf.html'),
          'txt-to-pdf': resolve(__dirname, 'src/pages/txt-to-pdf.html'),
          'markdown-to-pdf': resolve(
            __dirname,
            'src/pages/markdown-to-pdf.html'
          ),
          'pdf-to-bmp': resolve(__dirname, 'src/pages/pdf-to-bmp.html'),
          'pdf-to-greyscale': resolve(
            __dirname,
            'src/pages/pdf-to-greyscale.html'
          ),
          'pdf-to-jpg': resolve(__dirname, 'src/pages/pdf-to-jpg.html'),
          'pdf-to-png': resolve(__dirname, 'src/pages/pdf-to-png.html'),
          'pdf-to-tiff': resolve(__dirname, 'src/pages/pdf-to-tiff.html'),
          'pdf-to-webp': resolve(__dirname, 'src/pages/pdf-to-webp.html'),
          'pdf-to-docx': resolve(__dirname, 'src/pages/pdf-to-docx.html'),
          'extract-images': resolve(__dirname, 'src/pages/extract-images.html'),
          'pdf-to-markdown': resolve(
            __dirname,
            'src/pages/pdf-to-markdown.html'
          ),
          'rasterize-pdf': resolve(__dirname, 'src/pages/rasterize-pdf.html'),
          'prepare-pdf-for-ai': resolve(
            __dirname,
            'src/pages/prepare-pdf-for-ai.html'
          ),
          'pdf-layers': resolve(__dirname, 'src/pages/pdf-layers.html'),
          'pdf-to-pdfa': resolve(__dirname, 'src/pages/pdf-to-pdfa.html'),
          'odt-to-pdf': resolve(__dirname, 'src/pages/odt-to-pdf.html'),
          'csv-to-pdf': resolve(__dirname, 'src/pages/csv-to-pdf.html'),
          'rtf-to-pdf': resolve(__dirname, 'src/pages/rtf-to-pdf.html'),
          'word-to-pdf': resolve(__dirname, 'src/pages/word-to-pdf.html'),
          'excel-to-pdf': resolve(__dirname, 'src/pages/excel-to-pdf.html'),
          'powerpoint-to-pdf': resolve(
            __dirname,
            'src/pages/powerpoint-to-pdf.html'
          ),
          'pdf-booklet': resolve(__dirname, 'src/pages/pdf-booklet.html'),
          'xps-to-pdf': resolve(__dirname, 'src/pages/xps-to-pdf.html'),
          'mobi-to-pdf': resolve(__dirname, 'src/pages/mobi-to-pdf.html'),
          'epub-to-pdf': resolve(__dirname, 'src/pages/epub-to-pdf.html'),
          'fb2-to-pdf': resolve(__dirname, 'src/pages/fb2-to-pdf.html'),
          'cbz-to-pdf': resolve(__dirname, 'src/pages/cbz-to-pdf.html'),
          'wpd-to-pdf': resolve(__dirname, 'src/pages/wpd-to-pdf.html'),
          'wps-to-pdf': resolve(__dirname, 'src/pages/wps-to-pdf.html'),
          'xml-to-pdf': resolve(__dirname, 'src/pages/xml-to-pdf.html'),
          'pages-to-pdf': resolve(__dirname, 'src/pages/pages-to-pdf.html'),
          'odg-to-pdf': resolve(__dirname, 'src/pages/odg-to-pdf.html'),
          'ods-to-pdf': resolve(__dirname, 'src/pages/ods-to-pdf.html'),
          'odp-to-pdf': resolve(__dirname, 'src/pages/odp-to-pdf.html'),
          'pub-to-pdf': resolve(__dirname, 'src/pages/pub-to-pdf.html'),
          'vsd-to-pdf': resolve(__dirname, 'src/pages/vsd-to-pdf.html'),
          'psd-to-pdf': resolve(__dirname, 'src/pages/psd-to-pdf.html'),
          'pdf-to-svg': resolve(__dirname, 'src/pages/pdf-to-svg.html'),
          'extract-tables': resolve(__dirname, 'src/pages/extract-tables.html'),
          'pdf-to-csv': resolve(__dirname, 'src/pages/pdf-to-csv.html'),
          'pdf-to-excel': resolve(__dirname, 'src/pages/pdf-to-excel.html'),
          'pdf-to-text': resolve(__dirname, 'src/pages/pdf-to-text.html'),
          'digital-sign-pdf': resolve(
            __dirname,
            'src/pages/digital-sign-pdf.html'
          ),
          'validate-signature-pdf': resolve(
            __dirname,
            'src/pages/validate-signature-pdf.html'
          ),
          'email-to-pdf': resolve(__dirname, 'src/pages/email-to-pdf.html'),
          'font-to-outline': resolve(
            __dirname,
            'src/pages/font-to-outline.html'
          ),
          'deskew-pdf': resolve(__dirname, 'src/pages/deskew-pdf.html'),
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/tests/setup.ts',
      coverage: {
        provider: 'v8' as const,
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
  };
});
