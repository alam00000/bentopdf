#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
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

function uniq(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

const DEFAULT_WASM_ORIGINS = {
  pymupdf: 'https://cdn.jsdelivr.net',
  gs: 'https://cdn.jsdelivr.net',
  cpdf: 'https://cdn.jsdelivr.net',
};
const DEFAULT_CORS_PROXY_ORIGIN =
  'https://bentopdf-cors-proxy.bentopdf.workers.dev';

const wasmOrigins = [
  originOf(process.env.VITE_WASM_PYMUPDF_URL) || DEFAULT_WASM_ORIGINS.pymupdf,
  originOf(process.env.VITE_WASM_GS_URL) || DEFAULT_WASM_ORIGINS.gs,
  originOf(process.env.VITE_WASM_CPDF_URL) || DEFAULT_WASM_ORIGINS.cpdf,
];

const tesseractOrigins = uniq([
  originOf(process.env.VITE_TESSERACT_WORKER_URL),
  originOf(process.env.VITE_TESSERACT_CORE_URL),
  originOf(process.env.VITE_TESSERACT_LANG_URL),
]);

const corsProxyOrigin =
  originOf(process.env.VITE_CORS_PROXY_URL) || DEFAULT_CORS_PROXY_ORIGIN;

const ocrFontOrigin = originOf(process.env.VITE_OCR_FONT_BASE_URL);

const scriptOrigins = uniq([...wasmOrigins, ...tesseractOrigins]);
const connectOrigins = uniq([
  ...wasmOrigins,
  ...tesseractOrigins,
  corsProxyOrigin,
]);
const fontOrigins = uniq([ocrFontOrigin].filter(Boolean));

const directives = [
  `default-src 'self'`,
  `script-src 'self' 'wasm-unsafe-eval' 'unsafe-eval' blob: ${scriptOrigins.join(' ')}`.trim(),
  `worker-src 'self' blob:`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `img-src 'self' data: blob: https:`,
  `font-src 'self' data: https://fonts.gstatic.com ${fontOrigins.join(' ')}`.trim(),
  `connect-src 'self' blob: https://api.github.com https://fonts.gstatic.com ${connectOrigins.join(' ')}`.trim(),
  `object-src 'none'`,
  `base-uri 'self'`,
  `frame-src 'self' blob:`,
  `frame-ancestors 'self'`,
  `form-action 'self'`,
];

const docsDirectives = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' ${scriptOrigins.join(' ')}`.trim(),
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `img-src 'self' data: blob: https:`,
  `font-src 'self' data: https://fonts.gstatic.com ${fontOrigins.join(' ')}`.trim(),
  `connect-src 'self' https://api.github.com https://fonts.gstatic.com ${connectOrigins.join(' ')}`.trim(),
  `object-src 'none'`,
  `base-uri 'self'`,
  `frame-ancestors 'self'`,
  `form-action 'self'`,
];

const csp = directives.join('; ');
const docsCsp = docsDirectives.join('; ');

const commonHeaders = `add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), camera=(), microphone=(), payment=(), usb=(), interest-cohort=()" always;
add_header Cross-Origin-Opener-Policy "same-origin" always;
add_header Cross-Origin-Embedder-Policy "credentialless" always;
add_header Cross-Origin-Resource-Policy "cross-origin" always;
`;

const contents = `add_header Content-Security-Policy "${csp}" always;
${commonHeaders}`;

const docsContents = `add_header Content-Security-Policy "${docsCsp}" always;
${commonHeaders}`;

const outPath = join(repoRoot, 'security-headers.conf');
const docsOutPath = join(repoRoot, 'security-headers-docs.conf');
writeFileSync(outPath, contents);
writeFileSync(docsOutPath, docsContents);
console.log(
  `[security-headers] wrote ${outPath} with ${scriptOrigins.length} script-src / ${connectOrigins.length} connect-src origin(s)`
);
console.log(`[security-headers] wrote ${docsOutPath} (docs CSP)`);
