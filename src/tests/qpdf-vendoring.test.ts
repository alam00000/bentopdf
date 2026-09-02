import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(__dirname, '../..');
const VENDORED_JS = readFileSync(resolve(ROOT, 'public/qpdf.js'));
const VENDORED_WASM = readFileSync(resolve(ROOT, 'public/qpdf.wasm'));
const NPM_JS = readFileSync(
  resolve(ROOT, 'node_modules/@neslinesli93/qpdf-wasm/dist/qpdf.js')
);
const NPM_WASM = readFileSync(
  resolve(ROOT, 'node_modules/@neslinesli93/qpdf-wasm/dist/qpdf.wasm')
);

describe('vendored qpdf runtime', () => {
  it('carries the vendoring header note', () => {
    expect(VENDORED_JS.subarray(0, 2).toString('latin1')).toBe('/*');
    const header = VENDORED_JS.subarray(0, headerEnd()).toString('latin1');
    expect(header).toContain('@neslinesli93/qpdf-wasm@0.3.0');
    expect(header).toContain('inert header note');
  });

  it('is byte-identical to the npm artifact after the header', () => {
    expect(VENDORED_JS.subarray(headerEnd()).equals(NPM_JS)).toBe(true);
  });

  it('vendors the wasm binary byte-identically', () => {
    expect(VENDORED_WASM.equals(NPM_WASM)).toBe(true);
  });
});

function headerEnd(): number {
  const end = VENDORED_JS.indexOf('*/\n');
  expect(end).toBeGreaterThan(0);
  return end + 3;
}
