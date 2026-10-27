import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { serializeJsonLd } from '../../scripts/json-ld.mjs';
import { sanitizeTranslationHtml } from '../js/utils/translation-html';

const LOCALES_DIR = path.resolve(__dirname, '../../public/locales');
const PAYLOAD =
  'Merge</script><script src=https://cdn.jsdelivr.net/gh/a/b/c.js></script>';

function localeStrings(): string[] {
  const out: string[] = [];
  const visit = (value: unknown) => {
    if (typeof value === 'string') out.push(value);
    else if (value && typeof value === 'object')
      Object.values(value).forEach(visit);
  };
  for (const lang of fs.readdirSync(LOCALES_DIR)) {
    const dir = path.join(LOCALES_DIR, lang);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
      visit(JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')));
    }
  }
  return out;
}

function parse(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html');
}

function scriptsAfterRoundTrip(jsonLd: string): HTMLScriptElement[] {
  const doc = parse('<!doctype html><html><head></head><body></body></html>');
  const script = doc.createElement('script');
  script.setAttribute('type', 'application/ld+json');
  script.textContent = jsonLd;
  doc.body.appendChild(script);
  return Array.from(
    parse(doc.documentElement.outerHTML).querySelectorAll('script')
  );
}

describe('JSON-LD serialization', () => {
  it('raw JSON.stringify lets a translated name break out of the script', () => {
    expect(
      scriptsAfterRoundTrip(JSON.stringify({ name: PAYLOAD })).length
    ).toBeGreaterThan(1);
  });

  it('serializeJsonLd keeps the payload inside one ld+json script', () => {
    const data = { name: `${PAYLOAD}\u2028\u2029<!--` };
    const scripts = scriptsAfterRoundTrip(serializeJsonLd(data));
    expect(scripts).toHaveLength(1);
    expect(scripts[0].textContent).not.toMatch(/[<\u2028\u2029]/);
    expect(JSON.parse(scripts[0].textContent || '')).toEqual(data);
  });
});

describe('sanitizeTranslationHtml', () => {
  it('keeps the allowed formatting tags', () => {
    expect(
      sanitizeTranslationHtml('a<br>b <strong>c</strong> <em>d</em>')
    ).toBe('a<br>b <strong>c</strong> <em>d</em>');
  });

  it('strips scripts, event handlers, links and attributes', () => {
    expect(sanitizeTranslationHtml(PAYLOAD)).toBe('Merge');
    expect(sanitizeTranslationHtml('<img src=x onerror=alert(1)>x')).toBe('x');
    expect(
      sanitizeTranslationHtml('<a href="javascript:alert(1)">go</a>')
    ).toBe('go');
    expect(
      sanitizeTranslationHtml('<strong onclick="alert(1)" class="x">y</strong>')
    ).toBe('<strong>y</strong>');
    expect(
      sanitizeTranslationHtml('<iframe srcdoc="<script>alert(1)</script>">')
    ).toBe('');
  });

  it('leaves every shipped locale string intact', () => {
    const withMarkup = localeStrings().filter((s) => s.includes('<'));
    expect(withMarkup.length).toBeGreaterThan(0);
    for (const value of withMarkup) {
      expect(sanitizeTranslationHtml(value)).toBe(parse(value).body.innerHTML);
    }
  });
});
