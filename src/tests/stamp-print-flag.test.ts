// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const bundlePath = resolve(
  process.cwd(),
  'public/pdfjs-annotation-viewer/web/pdfjs-annotation-extension/pdfjs-annotation-extension.js'
);

describe('Stamp annotation print flag', () => {
  it('enables printing for exported Stamp annotations', () => {
    const source = readFileSync(bundlePath, 'utf8');

    const stampPattern = 'Subtype:Dj.of("Stamp")';
    const matches = source.split(stampPattern).length - 1;

    // Detect unexpected changes to the vendored serializer.
    expect(matches).toBe(1);

    const start = source.indexOf(stampPattern);
    const end = source.indexOf('},w&&', start);

    expect(end).toBeGreaterThan(start);

    const stampDictionary = source.slice(start, end);

    // PDF annotation Print flag: bit 3 (value 4).
    expect(stampDictionary).toMatch(/(?:^|,)F:4(?:,|$)/);
  });
});
