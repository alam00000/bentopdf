// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
describe('Arabic-only deployment', () => {
  it('ships no language redirect or selector', () => {
    expect(fs.existsSync('src/js/language-redirect.js')).toBe(false);
    expect(fs.existsSync('src/js/i18n/language-switcher.ts')).toBe(false);
    expect(fs.readdirSync('public/locales')).toEqual(['ar']);
  });
});
