// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { reviewTranslation } from '../../scripts/translations.mjs';

const ROOT = path.resolve(__dirname, '../..');
const LOCALES = path.join(ROOT, 'public/locales');

interface SourceEntry {
  text: string;
}

function readJson<T>(file: string, fallback: T): T {
  return fs.existsSync(file)
    ? (JSON.parse(fs.readFileSync(file, 'utf-8')) as T)
    : fallback;
}

const languages = fs
  .readdirSync(LOCALES)
  .filter((entry) => entry !== 'en')
  .filter((entry) => fs.statSync(path.join(LOCALES, entry)).isDirectory());

const pageSource = readJson<Record<string, SourceEntry>>(
  path.join(ROOT, 'translations/source.json'),
  {}
);
const uiSource = readJson<Record<string, unknown>>(
  path.join(ROOT, 'translations/ui-source.json'),
  {}
);

const variables = (text: string) =>
  (text.match(/\{\{\w+\}\}/g) ?? []).sort().join(',');

describe('translated page content', () => {
  it.each(languages)('%s keeps placeholders and style rules', (lang) => {
    const content = readJson<Record<string, string>>(
      path.join(ROOT, 'translations', lang, 'content.json'),
      {}
    );
    const problems: string[] = [];
    for (const [id, translation] of Object.entries(content)) {
      const source = pageSource[id];
      if (!source) continue;
      const review = reviewTranslation(lang, source.text, translation);
      if (review && review.level === 'error') {
        problems.push(`${id}: ${review.reason}`);
      }
    }
    expect(problems.slice(0, 10)).toEqual([]);
  });
});

describe('translated interface messages', () => {
  it.each(languages)('%s keeps variables and has no markup', (lang) => {
    const messages = readJson<Record<string, string>>(
      path.join(LOCALES, lang, 'ui.json'),
      {}
    );
    const problems: string[] = [];
    for (const [text, translation] of Object.entries(messages)) {
      if (!(text in uiSource)) continue;
      if (variables(text) !== variables(translation)) {
        problems.push(`${text}: variables differ`);
      }
      if (/<\/?[a-z][^>]*>/i.test(translation)) {
        problems.push(`${text}: contains HTML`);
      }
      if (translation.includes('—')) {
        problems.push(`${text}: contains an em dash`);
      }
    }
    expect(problems.slice(0, 10)).toEqual([]);
  });
});

describe('docs labels', () => {
  it.each(languages)('%s only uses known labels', (lang) => {
    const source = readJson<string[]>(
      path.join(ROOT, 'docs/.vitepress/i18n/source.json'),
      []
    );
    const labels = readJson<Record<string, string>>(
      path.join(ROOT, 'docs/.vitepress/i18n', `${lang}.json`),
      {}
    );
    const unknown = Object.keys(labels).filter((key) => !source.includes(key));
    expect(unknown).toEqual([]);
    const bad = source.filter(
      (key) => !labels[key] || !labels[key].trim() || labels[key].includes('—')
    );
    expect(bad).toEqual([]);
  });
});

describe('translation files', () => {
  it.each(languages)('%s has every translation file', (lang) => {
    const files = [
      path.join(ROOT, 'translations', lang, 'content.json'),
      path.join(LOCALES, lang, 'ui.json'),
      path.join(LOCALES, lang, 'common.json'),
      path.join(LOCALES, lang, 'tools.json'),
      path.join(ROOT, 'docs/.vitepress/i18n', `${lang}.json`),
    ];
    expect(files.filter((file) => !fs.existsSync(file))).toEqual([]);
  });
});

const flattenKeys = (
  value: unknown,
  prefix = '',
  out: Record<string, string> = {}
): Record<string, string> => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      flattenKeys(child, prefix ? `${prefix}.${key}` : key, out);
    }
  } else if (typeof value === 'string') {
    out[prefix] = value;
  }
  return out;
};

describe('locale files', () => {
  const english = Object.fromEntries(
    ['common', 'tools'].map((ns) => [
      ns,
      flattenKeys(readJson(path.join(LOCALES, 'en', `${ns}.json`), {})),
    ])
  );
  it.each(languages)('%s has every key that English has', (lang) => {
    const missing: string[] = [];
    for (const [ns, keys] of Object.entries(english)) {
      const translated = flattenKeys(
        readJson(path.join(LOCALES, lang, `${ns}.json`), {})
      );
      for (const [key, english] of Object.entries(keys)) {
        const value = translated[key];
        if (!value) {
          missing.push(`${ns}:${key}`);
          continue;
        }
        if (variables(english) !== variables(value)) {
          missing.push(`${ns}:${key} variables differ`);
        }
        const tags = (text: string) =>
          (text.match(/<\/?[a-z][^>]*>/gi) ?? []).length;
        if (tags(english) !== tags(value)) {
          missing.push(`${ns}:${key} HTML differs`);
        }
        if (value.includes('—')) missing.push(`${ns}:${key} em dash`);
      }
    }
    expect(missing.slice(0, 10)).toEqual([]);
  });
});
