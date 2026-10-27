#!/usr/bin/env node
import { existsSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

function originOf(urlStr) {
  if (!urlStr) return null;
  try {
    const u = new URL(urlStr);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

const JSDELIVR_HOST = 'cdn.jsdelivr.net';

export const DOCS_INLINE_SCRIPT_HASHES = [
  'sha256-DQUgNM9X0iH2019NkUxeBvnBoEoRKkHBc/I0iLqPNPA=',
  'sha256-La1r0VSk0Po4KFI0duEKhmPu+u0I416JW3oONqtdf4M=',
];

function toScriptSource(url) {
  const origin = originOf(url);
  if (!origin) return null;
  const { host, pathname } = new URL(url);
  if (host !== JSDELIVR_HOST) return origin;
  const directory = /\.m?js$/.test(pathname)
    ? pathname.replace(/[^/]*$/, '')
    : pathname.replace(/\/?$/, '/');
  return `${origin}${directory.replace(/;/g, '%3B').replace(/,/g, '%2C')}`;
}

function uniq(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

const DEFAULT_WASM_URLS = {
  pymupdf: 'https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/',
  gs: 'https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/',
  cpdf: 'https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/',
};

const tesseractPackage = createRequire(import.meta.url)(
  'tesseract.js/package.json'
);
const DEFAULT_TESSERACT_WORKER_URL = `https://cdn.jsdelivr.net/npm/tesseract.js@v${tesseractPackage.version}/dist/worker.min.js`;
const DEFAULT_TESSERACT_CORE_URL = `https://cdn.jsdelivr.net/npm/tesseract.js-core@v${tesseractPackage.dependencies['tesseract.js-core'].substring(1)}/`;

const DEFAULT_CORS_PROXY_ORIGIN =
  'https://bentopdf-cors-proxy.bentopdf.workers.dev';
const DEFAULT_OCR_FONT_CDN_ORIGIN = 'https://rawcdn.githack.com';

const COMMON_HEADERS = [
  ['X-Frame-Options', 'SAMEORIGIN'],
  ['X-Content-Type-Options', 'nosniff'],
  ['X-XSS-Protection', '1; mode=block'],
  ['Referrer-Policy', 'strict-origin-when-cross-origin'],
  [
    'Permissions-Policy',
    'geolocation=(), camera=(), microphone=(), payment=(), usb=(), interest-cohort=()',
  ],
  ['Cross-Origin-Opener-Policy', 'same-origin'],
  ['Cross-Origin-Embedder-Policy', 'credentialless'],
  ['Cross-Origin-Resource-Policy', 'cross-origin'],
];

function urlOrDefault(value, fallback) {
  return originOf(value) ? value : fallback;
}

export function buildSecurityHeaders(env = process.env) {
  const wasmUrls = [
    urlOrDefault(env.VITE_WASM_PYMUPDF_URL, DEFAULT_WASM_URLS.pymupdf),
    urlOrDefault(env.VITE_WASM_GS_URL, DEFAULT_WASM_URLS.gs),
    urlOrDefault(env.VITE_WASM_CPDF_URL, DEFAULT_WASM_URLS.cpdf),
  ];
  const wasmOrigins = wasmUrls.map(originOf);

  const tesseractOrigins = uniq([
    originOf(env.VITE_TESSERACT_WORKER_URL),
    originOf(env.VITE_TESSERACT_CORE_URL),
    originOf(env.VITE_TESSERACT_LANG_URL),
  ]);

  const corsProxyOrigin =
    originOf(env.VITE_CORS_PROXY_URL) || DEFAULT_CORS_PROXY_ORIGIN;

  const ocrFontOrigin =
    originOf(env.VITE_OCR_FONT_BASE_URL) || DEFAULT_OCR_FONT_CDN_ORIGIN;

  const scriptSources = uniq([
    ...wasmUrls.map(toScriptSource),
    toScriptSource(
      urlOrDefault(env.VITE_TESSERACT_WORKER_URL, DEFAULT_TESSERACT_WORKER_URL)
    ),
    toScriptSource(
      urlOrDefault(env.VITE_TESSERACT_CORE_URL, DEFAULT_TESSERACT_CORE_URL)
    ),
  ]);
  const connectOrigins = uniq([
    ...wasmOrigins,
    ...tesseractOrigins,
    corsProxyOrigin,
    ocrFontOrigin,
  ]);
  const fontOrigins = uniq([ocrFontOrigin]);

  const githubStarsDisabled =
    env.DISABLE_GITHUB_STARS === 'true' || env.SIMPLE_MODE === 'true';
  const githubApiSource = githubStarsDisabled ? '' : ' https://api.github.com';

  const directives = [
    `default-src 'self'`,
    `script-src 'self' 'wasm-unsafe-eval' 'unsafe-eval' blob: ${scriptSources.join(' ')}`.trim(),
    `worker-src 'self' blob:`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `img-src 'self' data: blob: https:`,
    `font-src 'self' data: https://fonts.gstatic.com ${fontOrigins.join(' ')}`.trim(),
    `connect-src 'self' blob:${githubApiSource} https://fonts.gstatic.com ${connectOrigins.join(' ')}`.trim(),
    `object-src 'none'`,
    `base-uri 'self'`,
    `frame-src 'self' blob:`,
    `frame-ancestors 'self'`,
    `form-action 'self'`,
  ];

  const docsDirectives = [
    `default-src 'self'`,
    `script-src 'self' ${DOCS_INLINE_SCRIPT_HASHES.map((hash) => `'${hash}'`).join(' ')}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `img-src 'self' data: blob: https:`,
    `font-src 'self' data: https://fonts.gstatic.com ${fontOrigins.join(' ')}`.trim(),
    `connect-src 'self'${githubApiSource} https://fonts.gstatic.com ${connectOrigins.join(' ')}`.trim(),
    `object-src 'none'`,
    `base-uri 'self'`,
    `frame-ancestors 'self'`,
    `form-action 'self'`,
  ];

  const csp = directives.join('; ');
  const docsCsp = docsDirectives.join('; ');

  const nginxHeaders = (policy) =>
    [['Content-Security-Policy', policy], ...COMMON_HEADERS]
      .map(([name, value]) => `add_header ${name} "${value}" always;\n`)
      .join('');

  const staticHeaders = [
    '/*',
    `  Content-Security-Policy: ${csp}`,
    ...COMMON_HEADERS.map(([name, value]) => `  ${name}: ${value}`),
    '',
    ...['/docs', '/docs/*'].flatMap((docsPath) => [
      docsPath,
      '  ! Content-Security-Policy',
      `  Content-Security-Policy: ${docsCsp}`,
      '',
    ]),
  ].join('\n');

  return {
    csp,
    docsCsp,
    scriptSources,
    connectOrigins,
    nginx: nginxHeaders(csp),
    nginxDocs: nginxHeaders(docsCsp),
    staticHeaders,
  };
}

function main() {
  const headers = buildSecurityHeaders();
  const outPath = join(repoRoot, 'security-headers.conf');
  const docsOutPath = join(repoRoot, 'security-headers-docs.conf');
  writeFileSync(outPath, headers.nginx);
  writeFileSync(docsOutPath, headers.nginxDocs);
  console.log(
    `[security-headers] wrote ${outPath} with ${headers.scriptSources.length} script-src / ${headers.connectOrigins.length} connect-src source(s)`
  );
  console.log(`[security-headers] wrote ${docsOutPath} (docs CSP)`);
  const distDir = join(repoRoot, 'dist');
  const customHeaders = join(repoRoot, 'public', '_headers');
  if (existsSync(customHeaders)) {
    console.log(
      `[security-headers] kept your own ${customHeaders} for static hosts`
    );
  } else if (existsSync(distDir)) {
    const distOutPath = join(distDir, '_headers');
    writeFileSync(distOutPath, headers.staticHeaders);
    console.log(`[security-headers] wrote ${distOutPath}`);
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main();
}
