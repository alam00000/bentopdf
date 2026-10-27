import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  buildSecurityHeaders,
  DOCS_INLINE_SCRIPT_HASHES,
} from '../../scripts/generate-security-headers.mjs';
import { WasmProvider } from '../js/utils/wasm-provider';

const ROOT = path.resolve(__dirname, '../..');
const read = (file: string) => fs.readFileSync(path.join(ROOT, file), 'utf8');

const defaults = buildSecurityHeaders({});

function directive(policy: string, name: string): string[] {
  const found = policy
    .split(';')
    .map((d) => d.trim().split(/\s+/))
    .find(([n]) => n === name);
  return found ? found.slice(1) : [];
}

function allowedBy(sources: string[], url: string): boolean {
  return sources.some((source) =>
    source.endsWith('/')
      ? url.startsWith(source)
      : new URL(url).origin === source
  );
}

function headerRuleCsp(file: string, source: string): string | undefined {
  const config = JSON.parse(read(file)) as {
    headers: Array<{
      source: string;
      headers: Array<{ key: string; value: string }>;
    }>;
  };
  return config.headers
    .find((rule) => rule.source === source)
    ?.headers.find((h) => h.key === 'Content-Security-Policy')?.value;
}

describe('CSP script-src', () => {
  const scriptSrc = directive(defaults.csp, 'script-src');

  it('allows jsDelivr only through version-pinned package prefixes', () => {
    const jsdelivr = scriptSrc.filter((s) => s.includes('cdn.jsdelivr.net'));
    expect(jsdelivr.length).toBeGreaterThan(0);
    for (const source of jsdelivr) {
      expect(source.startsWith('https://cdn.jsdelivr.net/npm/'), source).toBe(
        true
      );
      expect(source.endsWith('/'), source).toBe(true);
      expect(source).toMatch(/@v?\d+\.\d+\.\d+\//);
    }
  });

  it('covers every script the app loads from its default CDN URLs', () => {
    const { pymupdf, ghostscript, cpdf } = WasmProvider.getAllProviders();
    const tesseract = JSON.parse(
      read('node_modules/tesseract.js/package.json')
    ) as { version: string; dependencies: Record<string, string> };
    const core = tesseract.dependencies['tesseract.js-core'].substring(1);
    const urls = [
      `${pymupdf}dist/index.js`,
      `${pymupdf}assets/pyodide.js`,
      `${pymupdf}assets/pyodide.asm.js`,
      `${ghostscript}gs.js`,
      `${cpdf}coherentpdf.browser.min.js`,
      `https://cdn.jsdelivr.net/npm/tesseract.js@v${tesseract.version}/dist/worker.min.js`,
      `https://cdn.jsdelivr.net/npm/tesseract.js-core@v${core}/tesseract-core-simd-lstm.wasm.js`,
    ];
    for (const url of urls) {
      expect(allowedBy(scriptSrc, url), url).toBe(true);
    }
  });

  it('rejects arbitrary jsDelivr packages and GitHub repos', () => {
    for (const url of [
      'https://cdn.jsdelivr.net/gh/attacker/repo@main/x.js',
      'https://cdn.jsdelivr.net/npm/evil-package@1.0.0/x.js',
      'https://cdn.jsdelivr.net/npm/coherentpdf@2.5.6/dist/coherentpdf.browser.min.js',
      'https://cdn.jsdelivr.net/combine/npm/evil@1',
    ]) {
      expect(allowedBy(scriptSrc, url), url).toBe(false);
    }
  });

  it('keeps self-hosted VITE_* URLs working', () => {
    const custom = buildSecurityHeaders({
      VITE_WASM_PYMUPDF_URL: 'https://internal.example.com/wasm/pymupdf/',
      VITE_WASM_GS_URL:
        'https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets',
      VITE_WASM_CPDF_URL: 'https://cdn.jsdelivr.net/npm/x@1.0.0/a;b,c/',
      VITE_TESSERACT_WORKER_URL:
        'https://cdn.jsdelivr.net/npm/tesseract.js@v7.0.0/dist/worker.min.js',
      VITE_TESSERACT_CORE_URL: 'https://ocr.example.com/core',
      VITE_TESSERACT_LANG_URL: 'https://ocr.example.com/lang',
    });
    expect(custom.scriptSources).toEqual([
      'https://internal.example.com',
      'https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/',
      'https://cdn.jsdelivr.net/npm/x@1.0.0/a%3Bb%2Cc/',
      'https://cdn.jsdelivr.net/npm/tesseract.js@v7.0.0/dist/',
      'https://ocr.example.com',
    ]);
    expect(directive(custom.csp, 'connect-src')).toEqual(
      expect.arrayContaining([
        'https://internal.example.com',
        'https://cdn.jsdelivr.net',
        'https://ocr.example.com',
      ])
    );
  });

  it('only allows the pinned docs inline scripts', () => {
    const sources = directive(defaults.docsCsp, 'script-src');
    expect(sources).toEqual([
      "'self'",
      ...DOCS_INLINE_SCRIPT_HASHES.map((hash) => `'${hash}'`),
    ]);
    expect(sources).not.toContain("'unsafe-inline'");
  });
});

describe('deployment configs match the generator', () => {
  it('vercel.json', () => {
    expect(headerRuleCsp('vercel.json', '/(.*)')).toBe(defaults.csp);
    expect(headerRuleCsp('vercel.json', '/docs')).toBe(defaults.docsCsp);
    expect(headerRuleCsp('vercel.json', '/docs/:path*')).toBe(defaults.docsCsp);
  });

  it('serve.json', () => {
    expect(headerRuleCsp('serve.json', '**/*')).toBe(defaults.csp);
    expect(headerRuleCsp('serve.json', 'docs/**')).toBe(defaults.docsCsp);
  });

  it('_headers for Netlify and Cloudflare Pages', () => {
    const file = defaults.staticHeaders;
    expect(file).toContain(`/*\n  Content-Security-Policy: ${defaults.csp}\n`);
    expect(file).toContain(
      `/docs/*\n  ! Content-Security-Policy\n  Content-Security-Policy: ${defaults.docsCsp}\n`
    );
    for (const line of file.split('\n')) {
      expect(line.length).toBeLessThanOrEqual(2000);
    }
  });

  it('nginx docs config and .htaccess', () => {
    expect(defaults.nginxDocs).toContain(
      `add_header Content-Security-Policy "${defaults.docsCsp}" always;`
    );
    expect(read('.htaccess')).toContain(
      `Header always set Content-Security-Policy "${defaults.csp}"`
    );
  });
});
