import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { applyLinkedText } from '../../scripts/i18n-linked-text.mjs';

const ROOT = path.resolve(__dirname, '../..');
const LOCALES_DIR = path.join(ROOT, 'public/locales');
type Faq = Record<string, Record<string, { q: string; a: string }>>;

const loadFaq = (lang: string): Faq | null => {
  const file = path.join(LOCALES_DIR, lang, 'faq.json');
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
};
const en = loadFaq('en')!;
const markers = (text: string) =>
  (text.match(/\[\/?\d+\]/g) ?? []).sort().join(' ');

const pages = [
  ...fs.readdirSync(path.join(ROOT, 'src/pages')).map((f) => `src/pages/${f}`),
  ...fs.readdirSync(ROOT),
].filter((f) => f.endsWith('.html'));

describe('tool page FAQ translations', () => {
  it('every data-i18n-faq key in the pages has its English text', () => {
    const missing: string[] = [];
    for (const page of pages) {
      const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
      const doc = new DOMParser().parseFromString(html, 'text/html');
      doc.querySelectorAll('[data-i18n-faq]').forEach((element) => {
        const key = element.getAttribute('data-i18n-faq')!;
        const [slug, n, part] = key.split('.');
        const text = en[slug]?.[n]?.[part as 'q' | 'a'];
        const links = element.children.length;
        if (
          !text ||
          markers(text).split(' ').filter(Boolean).length !== links * 2
        )
          missing.push(`${page}: ${key}`);
      });
    }
    expect(missing).toEqual([]);
  });

  it('translations keep the English keys and link markers', () => {
    const problems: string[] = [];
    for (const lang of fs.readdirSync(LOCALES_DIR)) {
      const faq = lang === 'en' ? null : loadFaq(lang);
      if (!faq) continue;
      for (const [slug, items] of Object.entries(faq)) {
        for (const [n, item] of Object.entries(items)) {
          for (const part of ['q', 'a'] as const) {
            const source = en[slug]?.[n]?.[part];
            if (source === undefined)
              problems.push(`${lang}: ${slug}.${n}.${part} is not in en`);
            else if (markers(item[part]) !== markers(source))
              problems.push(
                `${lang}: ${slug}.${n}.${part} link markers differ`
              );
          }
        }
      }
    }
    expect(problems).toEqual([]);
  });
});

describe('applyLinkedText', () => {
  const answer = () => {
    const p = document.createElement('p');
    p.innerHTML =
      'Use <a href="/sign-pdf" class="link">Sign PDF</a> for a picture of your signature.';
    return p;
  };

  it('keeps the link and its attributes with the translated text', () => {
    const p = answer();
    expect(
      applyLinkedText(p, 'Na obrázok podpisu použite [0]Podpísať PDF[/0].')
    ).toBe(true);
    expect(p.innerHTML).toBe(
      'Na obrázok podpisu použite <a href="/sign-pdf" class="link">Podpísať PDF</a>.'
    );
  });

  it('rejects broken markers and leaves the page text', () => {
    for (const bad of ['[1]x[/1]', '[0]x', 'x[/0]']) {
      const p = answer();
      const before = p.innerHTML;
      expect(applyLinkedText(p, bad)).toBe(false);
      expect(p.innerHTML).toBe(before);
    }
  });

  it('sets plain text when the answer has no links', () => {
    const p = document.createElement('p');
    p.textContent = 'Yes.';
    expect(applyLinkedText(p, 'Áno <img src=x onerror=alert(1)> & nič')).toBe(
      true
    );
    expect(p.children).toHaveLength(0);
    expect(p.textContent).toBe('Áno <img src=x onerror=alert(1)> & nič');
  });
});
