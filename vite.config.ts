import { defineConfig } from 'vitest/config';
import type { IncomingMessage, ServerResponse } from 'http';
import http from 'http';
import https from 'https';
import type { Connect, Plugin } from 'vite';
// import basicSsl from '@vitejs/plugin-basic-ssl';
import tailwindcss from '@tailwindcss/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import viteCompression from 'vite-plugin-compression';
import handlebars from 'vite-plugin-handlebars';
import { resolve } from 'path';
import fs from 'fs';
import { constants as zlibConstants } from 'zlib';
import { createHash } from 'crypto';

function engineVersion(): string {
  try {
    const dir = resolve(__dirname, 'node_modules/bentopdf-pdfium');
    const h = createHash('sha256');
    for (const f of ['editcore.js', 'editcore.wasm']) {
      h.update(fs.readFileSync(resolve(dir, f)));
    }
    return h.digest('hex').slice(0, 12);
  } catch {
    return 'dev';
  }
}

const SUPPORTED_LANGUAGES = [
  'en',
  'ar',
  'be',
  'da',
  'ru',
  'de',
  'es',
  'fr',
  'id',
  'it',
  'nl',
  'pt',
  'sv',
  'tr',
  'vi',
  'zh',
  'zh-TW',
  'ko',
  'ja',
  'uk',
  'sk',
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

function buildCorsProxyAllowedHosts(): Set<string> {
  const hosts = new Set<string>([
    'cdn.jsdelivr.net',
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'bentopdf-cors-proxy.bentopdf.workers.dev',
    'timestamp.digicert.com',
    'timestamp.sectigo.com',
    'ts.ssl.com',
    'freetsa.org',
    'tsa.mesign.com',
  ]);

  const envHostSources = [
    process.env.VITE_CORS_PROXY_URL,
    process.env.VITE_WASM_PYMUPDF_URL,
    process.env.VITE_WASM_GS_URL,
    process.env.VITE_WASM_CPDF_URL,
    process.env.VITE_TESSERACT_WORKER_URL,
    process.env.VITE_TESSERACT_CORE_URL,
    process.env.VITE_TESSERACT_LANG_URL,
    process.env.VITE_OCR_FONT_BASE_URL,
  ];
  for (const raw of envHostSources) {
    if (!raw) continue;
    try {
      hosts.add(new URL(raw).hostname);
    } catch {
      console.warn(
        `[vite] Ignoring malformed VITE_* URL in dev CORS proxy allowlist: ${raw}`
      );
    }
  }

  const extra = process.env.VITE_DEV_CORS_PROXY_EXTRA_HOSTS;
  if (extra) {
    for (const host of extra.split(',').map((s) => s.trim())) {
      if (host) hosts.add(host);
    }
  }

  return hosts;
}

const CORS_PROXY_ALLOWED_HOSTS = buildCorsProxyAllowedHosts();

function createCorsProxyMiddleware(): Connect.NextHandleFunction {
  return (
    req: IncomingMessage,
    res: ServerResponse,
    next: Connect.NextFunction
  ): void => {
    if (!req.url?.startsWith('/cors-proxy')) return next();

    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.statusCode = 204;
      res.end();
      return;
    }

    const parsed = new URL(req.url, 'http://localhost');
    const targetUrl = parsed.searchParams.get('url');
    if (!targetUrl) {
      res.statusCode = 400;
      res.end('Missing url parameter');
      return;
    }

    let targetHost: string;
    let targetProtocol: string;
    try {
      const parsedTarget = new URL(targetUrl);
      targetHost = parsedTarget.hostname;
      targetProtocol = parsedTarget.protocol;
    } catch {
      res.statusCode = 400;
      res.end('Invalid url parameter');
      return;
    }

    if (targetProtocol !== 'https:' && targetProtocol !== 'http:') {
      res.statusCode = 400;
      res.end('Unsupported protocol');
      return;
    }

    if (!CORS_PROXY_ALLOWED_HOSTS.has(targetHost)) {
      console.warn(`[CORS Proxy] Blocked disallowed host: ${targetHost}`);
      res.statusCode = 403;
      res.end(`Host not allowed: ${targetHost}`);
      return;
    }

    console.log(`[CORS Proxy] ${req.method} ${targetUrl}`);

    const bodyChunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => bodyChunks.push(chunk));
    req.on('end', () => {
      const body = Buffer.concat(bodyChunks);
      const target = new URL(targetUrl);
      const transport = target.protocol === 'https:' ? https : http;

      const headers: Record<string, string> = {};
      if (req.headers['content-type']) {
        headers['Content-Type'] = req.headers['content-type'] as string;
      }
      if (body.length > 0) {
        headers['Content-Length'] = String(body.length);
      }

      const proxyReq = transport.request(
        targetUrl,
        { method: req.method || 'GET', headers },
        (proxyRes) => {
          console.log(
            `[CORS Proxy] Response: ${proxyRes.statusCode} from ${targetUrl}`
          );
          res.setHeader(
            'Access-Control-Allow-Origin',
            req.headers.origin || '*'
          );
          res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.statusCode = proxyRes.statusCode || 200;
          proxyRes.pipe(res);
        }
      );

      proxyReq.on('error', (err) => {
        const msg = String(err.message).replace(/[\r\n]+/g, ' ');
        console.error('[CORS Proxy] Error:', msg);
        res.statusCode = 502;
        res.end(`Proxy error: ${msg}`);
      });

      if (body.length > 0) {
        proxyReq.write(body);
      }
      proxyReq.end();
    });
  };
}

function languageRouterPlugin(): Plugin {
  return {
    name: 'language-router',
    configureServer(server) {
      server.middlewares.use(createCorsProxyMiddleware());
      server.middlewares.use(createLanguageMiddleware(true));
    },
    configurePreviewServer(server) {
      server.middlewares.use(createCorsProxyMiddleware());
      server.middlewares.use(createLanguageMiddleware(false));
    },
  };
}

function flattenPagesPlugin(): Plugin {
  return {
    name: 'flatten-pages',
    enforce: 'post',
    writeBundle(options, bundle) {
      const outDir = options.dir;
      if (!outDir) return;

      const moves: Array<{ from: string; to: string }> = [];

      for (const fileName of Object.keys(bundle)) {
        if (fileName.startsWith('src/pages/') && fileName.endsWith('.html')) {
          moves.push({
            from: fileName,
            to: fileName.replace('src/pages/', ''),
          });
        }
      }

      if (process.env.SIMPLE_MODE === 'true' && bundle['simple-index.html']) {
        moves.push({ from: 'simple-index.html', to: 'index.html' });
      }

      for (const { from, to } of moves) {
        const oldPath = resolve(outDir, from);
        const newPath = resolve(outDir, to);
        if (!fs.existsSync(oldPath)) continue;
        fs.mkdirSync(resolve(newPath, '..'), { recursive: true });
        if (fs.existsSync(newPath)) fs.rmSync(newPath, { force: true });
        fs.renameSync(oldPath, newPath);
      }

      const pagesDir = resolve(outDir, 'src/pages');
      if (fs.existsSync(pagesDir) && fs.readdirSync(pagesDir).length === 0) {
        fs.rmdirSync(pagesDir);
      }
      const srcDir = resolve(outDir, 'src');
      if (fs.existsSync(srcDir) && fs.readdirSync(srcDir).length === 0) {
        fs.rmdirSync(srcDir);
      }
    },
  };
}

function swPrecachePlugin(): Plugin {
  const workerAssetPattern = /^assets\/pdf\.worker(\.min)?-[\w-]+\.m?js$/;
  const placeholderPattern = /const PRECACHE_ASSETS = \[[\s\S]*?\];/;

  return {
    name: 'sw-precache',
    apply: 'build',
    enforce: 'post',
    writeBundle(options, bundle) {
      const outDir = options.dir;
      if (!outDir) return;

      const workerAssets = Object.keys(bundle)
        .filter((fileName) => workerAssetPattern.test(fileName))
        .sort();

      if (workerAssets.length === 0) {
        throw new Error(
          '[sw-precache] no PDF.js worker asset found in bundle — service worker would precache nothing'
        );
      }

      const swPath = resolve(outDir, 'sw.js');
      if (!fs.existsSync(swPath)) {
        throw new Error(`[sw-precache] ${swPath} not found in build output`);
      }

      const source = fs.readFileSync(swPath, 'utf8');
      if (!placeholderPattern.test(source)) {
        throw new Error(
          '[sw-precache] could not find "const PRECACHE_ASSETS = [...]" in sw.js'
        );
      }

      const list = workerAssets.map((asset) => `  '${asset}',`).join('\n');
      fs.writeFileSync(
        swPath,
        source.replace(
          placeholderPattern,
          `const PRECACHE_ASSETS = [\n${list}\n];`
        )
      );

      console.log(
        `[sw-precache] precaching ${workerAssets.length} asset(s): ${workerAssets.join(', ')}`
      );
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
    writeBundle(options, bundle) {
      if (normalizedBase === '/') return;
      const outDir = options.dir;
      if (!outDir) return;

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

      for (const fileName of Object.keys(bundle)) {
        if (!fileName.endsWith('.html')) continue;
        const diskPath = resolve(outDir, fileName);
        if (!fs.existsSync(diskPath)) continue;
        const source = fs.readFileSync(diskPath, 'utf8');
        const updated = source
          .replace(hrefRegex, `href="${normalizedBase}`)
          .replace(srcRegex, `src="${normalizedBase}`)
          .replace(contentRegex, `content="${normalizedBase}`);
        if (updated !== source) {
          fs.writeFileSync(diskPath, updated);
        }
      }
    },
  };
}

/**
 * Native (Capacitor) builds have no web server in front of them: the WebView
 * serves the bundled `dist/` directory as-is. The site's own extensionless
 * links (`href="/merge-pdf"`) rely on an nginx/.htaccess rewrite that simply
 * does not exist inside the app, so we resolve them to real files at build
 * time. Only links that map to an emitted page are touched.
 */
function nativeLinkRewritePlugin(): Plugin {
  return {
    name: 'native-link-rewrite',
    enforce: 'post',
    writeBundle(options) {
      const outDir = options.dir;
      if (!outDir) return;

      const pages = new Set<string>();
      for (const file of fs.readdirSync(outDir)) {
        if (file.endsWith('.html')) pages.add(file.slice(0, -'.html'.length));
      }

      let rewritten = 0;
      for (const file of fs.readdirSync(outDir)) {
        if (!file.endsWith('.html')) continue;
        const diskPath = resolve(outDir, file);
        const source = fs.readFileSync(diskPath, 'utf8');
        const updated = source.replace(
          /href="\/([a-z0-9-]+)"/gi,
          (match, page: string) =>
            pages.has(page) ? `href="/${page}.html"` : match
        );
        if (updated !== source) {
          fs.writeFileSync(diskPath, updated);
          rewritten += 1;
        }
      }
      console.log(
        `[Vite] native-link-rewrite: resolved extensionless links in ${rewritten} page(s)`
      );
    },
  };
}

/**
 * Strips weight from the native app bundle that no feature depends on.
 *
 * Everything here is either a build artefact (source maps), a format variant
 * no target WebView will ever request (ttf/woff/svg fonts alongside woff2),
 * something only a web crawler sees (Open Graph images), a localisation for a
 * language the app cannot be switched to, or a byte-identical duplicate.
 *
 * The one substantive change is LibreOffice: it ships pre-gzipped, so the
 * APK/IPA cannot compress it further, and it alone accounts for roughly 70%
 * of the install. `scripts/prepare-native-wasm.mjs` recompresses it to brotli
 * (74 MB -> 47 MB) and this swaps the payloads in.
 */
function nativeSlimPlugin(): Plugin {
  const removed: Array<[string, number]> = [];

  const sizeOf = (target: string): number => {
    const stat = fs.statSync(target);
    if (!stat.isDirectory()) return stat.size;
    let total = 0;
    for (const entry of fs.readdirSync(target)) {
      total += sizeOf(resolve(target, entry));
    }
    return total;
  };

  const drop = (target: string, label: string): void => {
    if (!fs.existsSync(target)) return;
    const bytes = sizeOf(target);
    fs.rmSync(target, { recursive: true, force: true });
    const existing = removed.find(([name]) => name === label);
    if (existing) existing[1] += bytes;
    else removed.push([label, bytes]);
  };

  const walk = function* (dir: string): Generator<string> {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = resolve(dir, entry.name);
      if (entry.isDirectory()) yield* walk(full);
      else yield full;
    }
  };

  /** Swap the gzipped LibreOffice payloads for the brotli ones. */
  const useBrotliLibreOffice = (outDir: string): void => {
    const cacheDir = resolve(__dirname, '.native-cache/libreoffice-wasm');
    const targetDir = resolve(outDir, 'libreoffice-wasm');
    const payloads = ['soffice.wasm', 'soffice.data'];

    const missing = payloads.filter(
      (name) => !fs.existsSync(resolve(cacheDir, `${name}.br`))
    );
    if (missing.length) {
      throw new Error(
        `[native-slim] Missing brotli payloads: ${missing.join(', ')}.\n` +
          'Run `node scripts/prepare-native-wasm.mjs` (npm run native:build does this for you).'
      );
    }

    for (const name of payloads) {
      fs.copyFileSync(
        resolve(cacheDir, `${name}.br`),
        resolve(targetDir, `${name}.br`)
      );
      drop(resolve(targetDir, `${name}.gz`), 'LibreOffice gzip -> brotli');
    }
  };

  /**
   * Every @font-face lists woff2 first, then woff/ttf/svg for browsers that
   * predate it. Android 7+ and iOS 15+ - Capacitor's own floors - have
   * supported woff2 for a decade, so the fallbacks are dead bytes.
   */
  const dropLegacyFontFormats = (outDir: string): void => {
    const legacy =
      /url\([^)#]*\.(?:woff|ttf|otf|eot|svg)(?:#[^)]*)?\)\s*format\("(?:woff|truetype|opentype|embedded-opentype|svg)"\),?\s*/g;

    // Some pages get their Tailwind injected through a JS chunk, so the same
    // @font-face lists show up there too.
    for (const file of walk(outDir)) {
      if (!/\.(css|js|mjs)$/.test(file)) continue;
      const source = fs.readFileSync(file, 'utf8');
      // Anchored on a src list that still offers woff2, so a face is never
      // left without a source, and nothing outside @font-face is touched.
      const updated = source.replace(
        /src:([^;}]*\.woff2[^;}]*)/g,
        (match, list: string) => `src:${list.replace(legacy, '')}`
      );
      if (updated !== source) fs.writeFileSync(file, updated);
    }

    // Now remove any font file nothing references any more.
    const referenced = new Set<string>();
    for (const file of walk(outDir)) {
      if (!/\.(css|js|mjs|html)$/.test(file)) continue;
      const source = fs.readFileSync(file, 'utf8');
      for (const match of source.matchAll(
        /[\w.-]+\.(?:woff2|woff|ttf|otf|eot)/g
      )) {
        referenced.add(match[0]);
      }
    }

    for (const file of walk(outDir)) {
      const name = file.split('/').pop() ?? '';
      const isFont = /\.(?:woff|ttf|otf|eot)$/.test(name);
      const isSvgFont = name.startsWith('Phosphor-') && name.endsWith('.svg');
      if ((isFont || isSvgFont) && !referenced.has(name)) {
        drop(file, 'legacy font formats');
      }
    }
  };

  /** Trims viewer localisations to the languages the app can switch to. */
  const trimViewerLocales = (outDir: string): void => {
    const supported = new Set<string>(
      SUPPORTED_LANGUAGES.map((lang) => lang.split('-')[0].toLowerCase())
    );

    for (const localeDir of [
      resolve(outDir, 'pdfjs-viewer/locale'),
      resolve(outDir, 'pdfjs-annotation-viewer/web/locale'),
    ]) {
      if (!fs.existsSync(localeDir)) continue;

      const keep = (tag: string): boolean =>
        supported.has(tag.split('-')[0].toLowerCase());

      for (const entry of fs.readdirSync(localeDir, { withFileTypes: true })) {
        if (!entry.isDirectory() || keep(entry.name)) continue;
        drop(resolve(localeDir, entry.name), 'unreachable viewer locales');
      }

      // The index must agree with what is on disk, or the viewer will request
      // a .ftl that is no longer there.
      const index = resolve(localeDir, 'locale.json');
      if (!fs.existsSync(index)) continue;
      const entries = JSON.parse(fs.readFileSync(index, 'utf8')) as Record<
        string,
        string
      >;
      fs.writeFileSync(
        index,
        JSON.stringify(
          Object.fromEntries(
            Object.entries(entries).filter(([tag]) => keep(tag))
          )
        )
      );
    }
  };

  /**
   * The two vendored PDF.js copies ship byte-identical character maps. Point
   * the annotation viewer at the other copy's set and drop the duplicate.
   */
  const dedupeCmaps = (outDir: string): void => {
    const viewerCmaps = resolve(outDir, 'pdfjs-viewer/cmaps');
    const duplicate = resolve(outDir, 'pdfjs-annotation-viewer/web/cmaps');
    const viewerJs = resolve(outDir, 'pdfjs-annotation-viewer/web/viewer.mjs');
    if (
      !fs.existsSync(viewerCmaps) ||
      !fs.existsSync(duplicate) ||
      !fs.existsSync(viewerJs)
    ) {
      return;
    }

    // Only safe while the two sets really are the same bytes.
    const names = fs.readdirSync(duplicate);
    const identical =
      names.length === fs.readdirSync(viewerCmaps).length &&
      names.every((name) => {
        const a = resolve(duplicate, name);
        const b = resolve(viewerCmaps, name);
        return (
          fs.existsSync(b) && fs.readFileSync(a).equals(fs.readFileSync(b))
        );
      });
    if (!identical) {
      console.log(
        '[Vite] native-slim: PDF.js cmaps differ between viewers - keeping both'
      );
      return;
    }

    const source = fs.readFileSync(viewerJs, 'utf8');
    const updated = source.replace(
      '"../web/cmaps/"',
      '"../../pdfjs-viewer/cmaps/"'
    );
    if (updated === source) {
      console.log(
        '[Vite] native-slim: could not repoint the annotation viewer cMapUrl - keeping both'
      );
      return;
    }
    fs.writeFileSync(viewerJs, updated);
    drop(duplicate, 'duplicate PDF.js cmaps');
  };

  return {
    name: 'native-slim',
    enforce: 'post',
    writeBundle(options) {
      const outDir = options.dir;
      if (!outDir) return;

      useBrotliLibreOffice(outDir);

      for (const file of walk(outDir)) {
        if (file.endsWith('.map')) drop(file, 'source maps');
      }

      dropLegacyFontFormats(outDir);

      // Open Graph cards exist for link previews; nothing in the app renders
      // them.
      const images = resolve(outDir, 'images');
      if (fs.existsSync(images)) {
        for (const name of fs.readdirSync(images)) {
          if (name.startsWith('og-')) {
            drop(resolve(images, name), 'Open Graph preview images');
          }
        }
      }

      trimViewerLocales(outDir);
      dedupeCmaps(outDir);

      const mb = (bytes: number): string =>
        `${(bytes / 1048576).toFixed(1)} MB`;
      const total = removed.reduce((sum, [, bytes]) => sum + bytes, 0);
      console.log('[Vite] native-slim removed:');
      for (const [label, bytes] of removed.sort((a, b) => b[1] - a[1])) {
        console.log(`         ${mb(bytes).padStart(9)}  ${label}`);
      }
      console.log(`         ${mb(total).padStart(9)}  total`);
    },
  };
}

export default defineConfig(() => {
  const USE_CDN = process.env.VITE_USE_CDN === 'true';

  // Native (Capacitor) builds are packaged into the Android/iOS app bundle and
  // served from the WebView's own local origin. They never hit a CDN, never
  // need a service worker, and gain nothing from pre-compressed .br/.gz copies
  // (those would just double the size of the installed app).
  const IS_NATIVE = process.env.BUILD_TARGET === 'native';

  if (IS_NATIVE) {
    console.log('[Vite] Building for the native (Capacitor) app shell');
  } else if (USE_CDN) {
    console.log('[Vite] Using CDN for WASM files (with local fallback)');
  } else {
    console.log('[Vite] Using local WASM files only');
  }

  return {
    base: (process.env.BASE_URL || '/').replace(/\/?$/, '/'),
    worker: {
      format: 'es' as const,
    },
    plugins: [
      // basicSsl(),
      handlebars({
        partialDirectory: resolve(__dirname, 'src/partials'),
        context: {
          baseUrl: (process.env.BASE_URL || '/').replace(/\/?$/, '/'),
          simpleMode: process.env.SIMPLE_MODE === 'true',
          brandName: process.env.VITE_BRAND_NAME || '',
          brandLogo: process.env.VITE_BRAND_LOGO || '',
          footerText: process.env.VITE_FOOTER_TEXT || '',
          appVersion: process.env.npm_package_version || 'Unknown',
        },
      }),
      languageRouterPlugin(),
      flattenPagesPlugin(),
      rewriteHtmlPathsPlugin(),
      // The service worker only exists to make the *web* build installable and
      // offline-capable. Inside the native shell every asset is already on
      // disk, a stale SW cache would just fight app updates, and the links it
      // would cache need resolving to real files instead.
      ...(IS_NATIVE
        ? [nativeLinkRewritePlugin(), nativeSlimPlugin()]
        : [swPrecachePlugin()]),
      tailwindcss(),
      nodePolyfills({
        include: ['buffer', 'stream', 'util', 'zlib', 'process'],
        globals: {
          Buffer: true,
          global: false,
          process: true,
        },
      }),
      ...(IS_NATIVE
        ? []
        : [
            viteCompression({
              algorithm: 'brotliCompress',
              ext: '.br',
              threshold: 1024,
              filter: /\.(js|mjs|json|css|html|wasm|svg)$/i,
              compressionOptions: {
                params: {
                  [zlibConstants.BROTLI_PARAM_QUALITY]: 11,
                  [zlibConstants.BROTLI_PARAM_MODE]:
                    zlibConstants.BROTLI_MODE_GENERIC,
                },
              },
              deleteOriginFile: false,
            }),
            viteCompression({
              algorithm: 'gzip',
              ext: '.gz',
              threshold: 1024,
              filter: /\.(js|mjs|json|css|html|wasm|svg)$/i,
              compressionOptions: {
                level: 9,
              },
              deleteOriginFile: false,
            }),
          ]),
    ],
    define: {
      __NATIVE_APP__: JSON.stringify(IS_NATIVE),
      __SIMPLE_MODE__: JSON.stringify(process.env.SIMPLE_MODE === 'true'),
      __DISABLE_GITHUB_STARS__: JSON.stringify(
        process.env.DISABLE_GITHUB_STARS === 'true'
      ),
      __BRAND_NAME__: JSON.stringify(process.env.VITE_BRAND_NAME || ''),
      __DISABLED_TOOLS__: JSON.stringify(
        (process.env.DISABLE_TOOLS || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      ),
      __ENGINE_VERSION__: JSON.stringify(engineVersion()),
    },
    resolve: {
      alias: {
        '@/types': resolve(__dirname, 'src/js/types/index.ts'),
        '@': resolve(__dirname, 'src'),
        stream: 'stream-browserify',
        zlib: 'browserify-zlib',
      },
    },
    optimizeDeps: {
      include: ['pdfkit', 'blob-stream'],
      exclude: ['coherentpdf', 'wasm-vips', 'bentopdf-pdfium'],
    },
    server: {
      host: process.env.VITE_DEV_HOST || 'localhost',
      watch: {
        ignored: ['!**/node_modules/bentopdf-pdfium/**'],
      },
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
          'office-viewer': resolve(__dirname, 'src/pages/office-viewer.html'),
          'office-editor': resolve(__dirname, 'src/pages/office-editor.html'),
          'add-stamps': resolve(__dirname, 'src/pages/add-stamps.html'),
          'form-creator': resolve(__dirname, 'src/pages/form-creator.html'),
          'repair-pdf': resolve(__dirname, 'src/pages/repair-pdf.html'),
          'merge-pdf': resolve(__dirname, 'src/pages/merge-pdf.html'),
          'split-pdf': resolve(__dirname, 'src/pages/split-pdf.html'),
          'compress-pdf': resolve(__dirname, 'src/pages/compress-pdf.html'),
          'edit-pdf': resolve(__dirname, 'src/pages/edit-pdf.html'),
          'edit-pdf-text': resolve(__dirname, 'src/pages/edit-pdf-text.html'),
          'jpg-to-pdf': resolve(__dirname, 'src/pages/jpg-to-pdf.html'),
          'sign-pdf': resolve(__dirname, 'src/pages/sign-pdf.html'),
          'crop-pdf': resolve(__dirname, 'src/pages/crop-pdf.html'),
          'extract-pages': resolve(__dirname, 'src/pages/extract-pages.html'),
          'delete-pages': resolve(__dirname, 'src/pages/delete-pages.html'),
          'organize-pdf': resolve(__dirname, 'src/pages/organize-pdf.html'),
          'overlay-pdf': resolve(__dirname, 'src/pages/overlay-pdf.html'),
          'page-numbers': resolve(__dirname, 'src/pages/page-numbers.html'),
          'add-page-labels': resolve(
            __dirname,
            'src/pages/add-page-labels.html'
          ),
          'add-watermark': resolve(__dirname, 'src/pages/add-watermark.html'),
          'header-footer': resolve(__dirname, 'src/pages/header-footer.html'),
          'invert-colors': resolve(__dirname, 'src/pages/invert-colors.html'),
          'scanner-effect': resolve(__dirname, 'src/pages/scanner-effect.html'),
          'pdf-workflow': resolve(__dirname, 'src/pages/pdf-workflow.html'),
          'adjust-colors': resolve(__dirname, 'src/pages/adjust-colors.html'),
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
          'duplex-collate': resolve(__dirname, 'src/pages/duplex-collate.html'),
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
          'pdf-to-cbz': resolve(__dirname, 'src/pages/pdf-to-cbz.html'),
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
          'timestamp-pdf': resolve(__dirname, 'src/pages/timestamp-pdf.html'),
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
          'wasm-settings': resolve(__dirname, 'src/pages/wasm-settings.html'),
          'bates-numbering': resolve(
            __dirname,
            'src/pages/bates-numbering.html'
          ),
        },
        output: {
          assetFileNames: (assetInfo) => {
            const name = assetInfo.names?.[0] ?? '';
            if (name.endsWith('.mjs')) {
              return 'assets/[name]-[hash].js';
            }
            return 'assets/[name]-[hash][extname]';
          },
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
