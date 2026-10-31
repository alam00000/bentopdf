// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { scanRawUiText } from '../../scripts/raw-ui-text-scan.mjs';
import { extractUiStrings } from '../../scripts/extract-ui-strings.mjs';

const ROOT = path.resolve(__dirname, '../..');

interface RawUiSite {
  file: string;
  line: number;
  kind: string;
  text: string;
}

describe('UI text goes through i18n', () => {
  it('has no raw English in UI sinks', () => {
    const sites = scanRawUiText() as RawUiSite[];
    const report = sites
      .map((site) => `${site.file}:${site.line} [${site.kind}] ${site.text}`)
      .join('\n');
    expect(report).toBe('');
  });

  it('keeps translations/ui-source.json in sync with the code', () => {
    const { result } = extractUiStrings();
    const committed = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'translations/ui-source.json'), 'utf-8')
    ) as Record<string, unknown>;
    const missing = Object.keys(result).filter((text) => !(text in committed));
    const stale = Object.keys(committed).filter((text) => !(text in result));
    expect({ missing, stale }).toEqual({ missing: [], stale: [] });
  });
});
