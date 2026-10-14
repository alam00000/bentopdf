import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const LOGIC_FILE = join(ROOT, 'src/js/logic/merge-pdf-page.ts');
const CHECKED_LANGUAGES = ['en', 'fr'] as const;

const source = readFileSync(LOGIC_FILE, 'utf8');

const loadLocale = (lang: string, namespace: 'common' | 'tools') =>
  JSON.parse(
    readFileSync(
      join(ROOT, 'public/locales', lang, `${namespace}.json`),
      'utf8'
    )
  ) as Record<string, unknown>;

const resolveKey = (bundle: Record<string, unknown>, key: string): unknown =>
  key
    .split('.')
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === 'object'
          ? (node as Record<string, unknown>)[part]
          : undefined,
      bundle
    );

const usedKeys = [...source.matchAll(/\bt\('([^']+)'/g)].map(
  (match) => match[1]
);

describe('merge PDF notifications are localized', () => {
  it('uses translation keys for every alert and loader message', () => {
    const literalCalls = [
      ...source.matchAll(/\bshow(?:Alert|Loader)\(\s*['"`]/g),
    ];
    expect(literalCalls).toHaveLength(0);
  });

  it('never surfaces the raw worker message to the user', () => {
    const rawWorkerMessageInAlert = [
      ...source.matchAll(/\bshowAlert\([^;]*?\be\.data\.message/gs),
    ];
    expect(rawWorkerMessageInAlert).toHaveLength(0);
  });

  it('references at least the alert and loader keys added for the merge tool', () => {
    expect(usedKeys).toContain('tools:mergePdf.alert.mergeSuccess');
    expect(usedKeys).toContain('tools:mergePdf.loader.merging');
    expect(usedKeys).toContain('common.success');
    expect(usedKeys).toContain('common.error');
  });

  for (const lang of CHECKED_LANGUAGES) {
    it(`resolves every key used by the merge tool in "${lang}"`, () => {
      const bundles = {
        common: loadLocale(lang, 'common'),
        tools: loadLocale(lang, 'tools'),
      };

      const missing = usedKeys.filter((key) => {
        const [namespace, plainKey] = key.startsWith('tools:')
          ? ['tools', key.slice('tools:'.length)]
          : ['common', key];
        const value = resolveKey(
          bundles[namespace as 'common' | 'tools'],
          plainKey
        );
        return typeof value !== 'string' || value.length === 0;
      });

      expect(missing).toEqual([]);
    });
  }
});
