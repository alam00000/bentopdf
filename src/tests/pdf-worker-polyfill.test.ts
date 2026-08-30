import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC_JS = join(process.cwd(), 'src/js');

function collectTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...collectTsFiles(full));
    } else if (full.endsWith('.ts')) {
      out.push(full);
    }
  }
  return out;
}

describe('pdf.js worker polyfill wiring', () => {
  it('installs the polyfill before loading the pdf.js worker', () => {
    const entry = readFileSync(join(SRC_JS, 'pdf.worker.ts'), 'utf8');
    const polyfillAt = entry.indexOf('map-upsert-polyfill');
    const workerAt = entry.indexOf('pdfjs-dist/build/pdf.worker');

    expect(polyfillAt).toBeGreaterThanOrEqual(0);
    expect(workerAt).toBeGreaterThanOrEqual(0);
    expect(polyfillAt).toBeLessThan(workerAt);
  });

  it('points workerSrc at the wrapped worker', () => {
    const setup = readFileSync(
      join(SRC_JS, 'utils/setup-pdf-worker.ts'),
      'utf8'
    );

    expect(setup).toContain("from '../pdf.worker?worker&url'");
    expect(setup).toMatch(/GlobalWorkerOptions\.workerSrc\s*=\s*pdfWorkerUrl/);
  });

  it('never points workerSrc straight at the unpolyfilled pdf.js worker', () => {
    const offenders = collectTsFiles(SRC_JS)
      .filter((f) => !f.endsWith('pdf.worker.ts'))
      .filter((file) => {
        const source = readFileSync(file, 'utf8');
        return /GlobalWorkerOptions\.workerSrc\s*=[\s\S]{0,120}pdfjs-dist\/build\/pdf\.worker/.test(
          source
        );
      });

    expect(offenders).toEqual([]);
  });

  it('keeps every page that configures pdf.js on the shared setup', () => {
    const importers = collectTsFiles(SRC_JS).filter((file) =>
      readFileSync(file, 'utf8').includes('setup-pdf-worker')
    );

    expect(importers.length).toBeGreaterThan(30);
  });
});
