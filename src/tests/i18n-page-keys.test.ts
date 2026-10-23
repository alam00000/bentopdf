import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import common from '../../public/locales/en/common.json';
import tools from '../../public/locales/en/tools.json';

const root = resolve(__dirname, '../..');
const htmlFiles = (dir: string) =>
  readdirSync(join(root, dir))
    .filter((name) => name.endsWith('.html'))
    .map((name) => join(dir, name));

const resolveKey = (key: string): unknown => {
  const [ns, path] = key.includes(':') ? key.split(':', 2) : ['common', key];
  const bundle: unknown = ns === 'tools' ? tools : common;
  return path
    .split('.')
    .reduce<unknown>(
      (node, part) => (node as Record<string, unknown> | undefined)?.[part],
      bundle
    );
};

describe('data-i18n keys used in HTML', () => {
  it('all resolve to an English string', () => {
    const missing: string[] = [];
    for (const file of [
      ...htmlFiles('.'),
      ...htmlFiles('src/pages'),
      ...htmlFiles('src/partials'),
    ]) {
      const html = readFileSync(join(root, file), 'utf-8');
      for (const [, key] of html.matchAll(
        /data-i18n(?:-placeholder|-title)?="([^"{}]+)"/g
      )) {
        if (typeof resolveKey(key) !== 'string')
          missing.push(`${file}: ${key}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
