import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateTranslationPair } from './content-segments.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SOURCE_FILE = path.join(ROOT, 'translations/source.json');
const LOCALES_DIR = path.join(ROOT, 'public/locales');

const SCRIPT_RANGES = {
  ar: /[؀-ۿ]/,
  fa: /[؀-ۿ]/,
  be: /[Ѐ-ӿ]/,
  ru: /[Ѐ-ӿ]/,
  uk: /[Ѐ-ӿ]/,
  ja: /[぀-ヿ一-鿿]/,
  zh: /[一-鿿]/,
  'zh-TW': /[一-鿿]/,
  ko: /[가-힯]/,
};

const ENGLISH_MARKERS = new Set([
  'the',
  'and',
  'your',
  'with',
  'you',
  'this',
  'that',
  'from',
  'are',
  'will',
  'how',
  'what',
  'when',
  'can',
]);

function readJson(file, fallback) {
  return fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file, 'utf-8'))
    : fallback;
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function contentFile(lang) {
  return path.join(ROOT, 'translations', lang, 'content.json');
}

function languages() {
  return fs
    .readdirSync(LOCALES_DIR)
    .filter(
      (entry) =>
        entry !== 'en' &&
        fs.statSync(path.join(LOCALES_DIR, entry)).isDirectory()
    )
    .sort();
}

function plainText(markup) {
  return markup.replace(/<\/?\d+\/?>/g, ' ');
}

export function reviewTranslation(lang, source, translation) {
  const problem = validateTranslationPair(source, translation);
  if (problem) return { level: 'error', reason: problem };
  if (/[—]/.test(translation)) {
    return { level: 'error', reason: 'contains an em dash' };
  }
  const sourceText = plainText(source);
  const text = plainText(translation);
  const sourceWords = sourceText.split(/\s+/).filter(Boolean);
  if (
    translation.trim() === source.trim() &&
    (sourceWords.length < 6 || !/[a-z]{3,}/.test(sourceText))
  ) {
    return null;
  }
  const range = SCRIPT_RANGES[lang];
  if (range && sourceWords.length >= 3 && !range.test(text)) {
    return { level: 'error', reason: 'not in the target script' };
  }
  const tokens = text
    .toLowerCase()
    .split(/[^\p{L}]+/u)
    .filter(Boolean);
  if (!range && tokens.length >= 6) {
    const hits = tokens.filter((token) => ENGLISH_MARKERS.has(token)).length;
    if (hits >= 2 && hits / tokens.length >= 0.15) {
      return { level: 'error', reason: 'looks like English' };
    }
  }
  const ratio = text.length / Math.max(1, sourceText.length);
  if (sourceWords.length >= 6 && (ratio > 3.5 || ratio < 0.2)) {
    return { level: 'warning', reason: `length ratio ${ratio.toFixed(2)}` };
  }
  return null;
}

function chunkCommand(workDir, wordsPerChunk, lang) {
  const source = readJson(SOURCE_FILE, {});
  const done = lang ? readJson(contentFile(lang), {}) : {};
  const ids = Object.keys(source)
    .filter((id) => !done[id])
    .sort((a, b) => {
      const pa = source[a].pages[0] || '';
      const pb = source[b].pages[0] || '';
      return pa === pb ? a.localeCompare(b) : pa.localeCompare(pb);
    });
  const inDir = path.join(workDir, 'in');
  fs.mkdirSync(inDir, { recursive: true });
  let chunk = {};
  let words = 0;
  let index = 0;
  const flush = () => {
    if (Object.keys(chunk).length === 0) return;
    index += 1;
    writeJson(
      path.join(inDir, `chunk-${String(index).padStart(3, '0')}.json`),
      chunk
    );
    chunk = {};
    words = 0;
  };
  for (const id of ids) {
    const entry = source[id];
    chunk[id] = { text: entry.text, tags: entry.tags, page: entry.pages[0] };
    words += entry.text.split(/\s+/).length;
    if (words >= wordsPerChunk) flush();
  }
  flush();
  console.log(`Wrote ${index} chunks for ${ids.length} segments to ${inDir}`);
}

function mergeCommand(lang, outDir, replace) {
  const source = readJson(SOURCE_FILE, {});
  const target = contentFile(lang);
  const existing = readJson(target, {});
  const accepted = {};
  const rejected = [];
  const warnings = [];
  const files = fs.existsSync(outDir)
    ? fs
        .readdirSync(outDir)
        .filter((f) => /^chunk-\d+\.json$/.test(f))
        .sort()
    : [];
  for (const file of files) {
    const data = readJson(path.join(outDir, file), {});
    for (const [id, translation] of Object.entries(data)) {
      if (!source[id]) {
        rejected.push({ id, reason: 'unknown id' });
        continue;
      }
      const review = reviewTranslation(lang, source[id].text, translation);
      if (review && review.level === 'error') {
        rejected.push({ id, reason: review.reason });
        continue;
      }
      if (review) warnings.push({ id, reason: review.reason });
      if (existing[id] && !replace) continue;
      accepted[id] = translation;
    }
  }
  const merged = { ...existing, ...accepted };
  const sorted = {};
  for (const id of Object.keys(merged).sort()) sorted[id] = merged[id];
  writeJson(target, sorted);
  writeJson(path.join(outDir, 'rejects.json'), rejected);
  const missing = Object.keys(source).filter((id) => !sorted[id]);
  console.log(
    `${lang}: accepted ${Object.keys(accepted).length}, rejected ${rejected.length}, warnings ${warnings.length}, still missing ${missing.length}`
  );
}

function validateCommand(lang) {
  const source = readJson(SOURCE_FILE, {});
  const content = readJson(contentFile(lang), {});
  const errors = [];
  const warnings = [];
  for (const [id, translation] of Object.entries(content)) {
    if (!source[id]) {
      warnings.push({ id, reason: 'stale id (run prune to remove)' });
      continue;
    }
    const review = reviewTranslation(lang, source[id].text, translation);
    if (review)
      (review.level === 'error' ? errors : warnings).push({
        id,
        reason: review.reason,
      });
  }
  const missing = Object.keys(source).filter((id) => !content[id]);
  const translated = Object.keys(content).filter((id) => source[id]).length;
  console.log(
    `${lang}: ${translated}/${Object.keys(source).length} translated, ${errors.length} errors, ${warnings.length} warnings, ${missing.length} missing`
  );
  return { errors, warnings, missing };
}

function pruneCommand(lang) {
  const source = readJson(SOURCE_FILE, {});
  const content = readJson(contentFile(lang), {});
  const kept = {};
  for (const id of Object.keys(content).sort()) {
    if (source[id]) kept[id] = content[id];
  }
  writeJson(contentFile(lang), kept);
  console.log(
    `${lang}: removed ${Object.keys(content).length - Object.keys(kept).length} stale ids`
  );
}

function statusCommand() {
  const source = readJson(SOURCE_FILE, {});
  const total = Object.keys(source).length;
  for (const lang of languages()) {
    const content = readJson(contentFile(lang), {});
    const done = Object.keys(content).filter((id) => source[id]).length;
    console.log(
      `${lang.padEnd(6)} ${done}/${total} (${Math.round((done / total) * 100)}%)`
    );
  }
}

function main() {
  const [command, ...args] = process.argv.slice(2);
  const langIndex = args.indexOf('--lang');
  const langOption = langIndex >= 0 ? args[langIndex + 1] : undefined;
  const flags = new Set(args.filter((arg) => arg.startsWith('--')));
  const values = args.filter(
    (arg, index) =>
      !arg.startsWith('--') && (langIndex < 0 || index !== langIndex + 1)
  );
  if (command === 'chunk') {
    chunkCommand(values[0], Number(values[1] || 900), langOption);
  } else if (command === 'merge') {
    mergeCommand(values[0], values[1], flags.has('--replace'));
  } else if (command === 'prune') pruneCommand(values[0]);
  else if (command === 'validate') {
    const result = validateCommand(args[0]);
    if (args[1] === '--list') {
      console.log(
        JSON.stringify(
          {
            errors: result.errors.slice(0, 50),
            warnings: result.warnings.slice(0, 20),
          },
          null,
          2
        )
      );
    }
    process.exitCode = result.errors.length > 0 ? 1 : 0;
  } else if (command === 'status') statusCommand();
  else {
    console.error(
      'Usage: translations.mjs chunk <workDir> [words] [--lang <lang>] | merge <lang> <outDir> [--replace] | validate <lang> [--list] | prune <lang> | status'
    );
    process.exitCode = 2;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
