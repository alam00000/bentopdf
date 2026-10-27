import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TRANSLATIONS_DIR = path.resolve(__dirname, '../translations');

export const COVERAGE_THRESHOLD = 0.8;

function readJson(file, fallback) {
  return fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file, 'utf-8'))
    : fallback;
}

export function createTranslationChecker(toolsByLang, keyFor) {
  const pageIndex = readJson(path.join(TRANSLATIONS_DIR, 'pages.json'), {});
  const idsByLang = new Map();
  const idsFor = (lang) => {
    if (!idsByLang.has(lang)) {
      const content = readJson(
        path.join(TRANSLATIONS_DIR, lang, 'content.json'),
        {}
      );
      idsByLang.set(
        lang,
        new Set(
          Object.keys(content).filter(
            (id) => typeof content[id] === 'string' && content[id].trim()
          )
        )
      );
    }
    return idsByLang.get(lang);
  };
  return (pageName, lang) => {
    if (lang === 'en' || pageName === 'index') return true;
    if (toolsByLang[lang] && toolsByLang[lang][keyFor(pageName)]) return true;
    const ids = pageIndex[pageName];
    if (!ids || ids.length === 0) return false;
    const translated = idsFor(lang);
    let covered = 0;
    for (const id of ids) if (translated.has(id)) covered += 1;
    return covered / ids.length >= COVERAGE_THRESHOLD;
  };
}
