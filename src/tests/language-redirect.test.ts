// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const source = fs.readFileSync(
  path.resolve(__dirname, '../js/language-redirect.js'),
  'utf-8'
);
const LANGUAGES = 'ar,de,fr,ja,zh,zh-TW';

interface Visit {
  path: string;
  browser?: string[];
  choice?: string | null;
  base?: string;
  defaultLanguage?: string;
  storageThrows?: boolean;
  referrer?: string;
  hash?: string;
  withoutScript?: boolean;
}

function visit({
  path: pathname,
  browser = ['en-US'],
  choice = null,
  base = '/',
  defaultLanguage = 'en',
  storageThrows = false,
  referrer = '',
  hash = '',
  withoutScript = false,
}: Visit): string | null {
  let redirect: string | null = null;
  const attributes: Record<string, string> = {
    'data-base': base,
    'data-languages': LANGUAGES,
    'data-default-language': defaultLanguage,
  };
  const document = {
    referrer,
    currentScript: withoutScript
      ? null
      : { getAttribute: (name: string) => attributes[name] ?? null },
  };
  const window = {
    location: {
      pathname,
      origin: 'https://www.bentopdf.com',
      search: '?q=1',
      hash,
      replace: (url: string) => {
        redirect = url;
      },
    },
    navigator: { languages: browser, language: browser[0] },
    localStorage: {
      getItem: () => {
        if (storageThrows) throw new Error('blocked');
        return choice;
      },
    },
  };
  new Function('document', 'window', source)(document, window);
  return redirect;
}

describe('language-redirect.js', () => {
  it('sends first-time visitors of the home page to their browser language', () => {
    expect(visit({ path: '/', browser: ['de-AT', 'en'] })).toBe('/de?q=1');
    expect(visit({ path: '/index.html', browser: ['fr-CA'] })).toBe('/fr?q=1');
  });

  it('keeps English browsers and unsupported languages on English', () => {
    expect(visit({ path: '/', browser: ['en-GB', 'de'] })).toBeNull();
    expect(visit({ path: '/', browser: ['xx-XX'] })).toBeNull();
  });

  it('maps Chinese variants to the right script', () => {
    expect(visit({ path: '/', browser: ['zh-HK'] })).toBe('/zh-TW?q=1');
    expect(visit({ path: '/', browser: ['zh-Hant-TW'] })).toBe('/zh-TW?q=1');
    expect(visit({ path: '/', browser: ['zh-CN'] })).toBe('/zh?q=1');
  });

  it('never redirects deep links on browser language alone', () => {
    expect(visit({ path: '/merge-pdf', browser: ['de-DE'] })).toBeNull();
  });

  it('follows an explicit choice on any unprefixed page', () => {
    expect(visit({ path: '/merge-pdf', choice: 'ja' })).toBe(
      '/ja/merge-pdf?q=1'
    );
    expect(visit({ path: '/', browser: ['de-DE'], choice: 'en' })).toBeNull();
  });

  it('leaves language URLs, the blog and the docs alone', () => {
    expect(visit({ path: '/fr/merge-pdf', choice: 'de' })).toBeNull();
    expect(visit({ path: '/blog/some-post', choice: 'de' })).toBeNull();
    expect(visit({ path: '/docs/tools', choice: 'de' })).toBeNull();
  });

  it('uses the self-hosted default language when the browser has no match', () => {
    expect(visit({ path: '/', browser: ['xx'], defaultLanguage: 'fr' })).toBe(
      '/fr?q=1'
    );
    expect(
      visit({ path: '/', browser: ['en-US'], defaultLanguage: 'fr' })
    ).toBeNull();
  });

  it('respects a base path', () => {
    expect(visit({ path: '/pdf/', browser: ['de'], base: '/pdf/' })).toBe(
      '/pdf/de?q=1'
    );
    expect(
      visit({ path: '/pdf/de/', browser: ['de'], base: '/pdf/' })
    ).toBeNull();
  });

  it('does not auto-detect when the visitor came from another page of the site', () => {
    expect(
      visit({
        path: '/',
        browser: ['de-DE'],
        referrer: 'https://www.bentopdf.com/merge-pdf',
      })
    ).toBeNull();
    expect(
      visit({
        path: '/',
        browser: ['de-DE'],
        referrer: 'https://www.google.com/',
      })
    ).toBe('/de?q=1');
  });

  it('treats the base path without a trailing slash as the home page', () => {
    expect(visit({ path: '/pdf', browser: ['de'], base: '/pdf/' })).toBe(
      '/pdf/de?q=1'
    );
    expect(visit({ path: '/pdf/merge-pdf', choice: 'fr', base: '/pdf/' })).toBe(
      '/pdf/fr/merge-pdf?q=1'
    );
  });

  it('survives blocked storage', () => {
    expect(visit({ path: '/', browser: ['de'], storageThrows: true })).toBe(
      '/de?q=1'
    );
  });

  it('ignores a stored choice that is not a supported language', () => {
    expect(visit({ path: '/merge-pdf', choice: 'xx' })).toBeNull();
    expect(visit({ path: '/', browser: ['en'], choice: 'xx' })).toBeNull();
  });

  it('keeps the hash and does nothing without its script element', () => {
    expect(visit({ path: '/merge-pdf', choice: 'de', hash: '#faq' })).toBe(
      '/de/merge-pdf?q=1#faq'
    );
    expect(
      visit({ path: '/', browser: ['de'], withoutScript: true })
    ).toBeNull();
  });
});
