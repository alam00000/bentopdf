import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { reviewTranslation } from './translations.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SOURCE_FILE = path.join(ROOT, 'translations/ui-source.json');
const LOCALES_DIR = path.join(ROOT, 'public/locales');

function readJson(file, fallback) {
  return fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file, 'utf-8'))
    : fallback;
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function targetFile(lang) {
  return path.join(LOCALES_DIR, lang, 'ui.json');
}

function idOf(text) {
  return createHash('sha1').update(text).digest('hex').slice(0, 12);
}

function placeholderSignature(text) {
  return (text.match(/\{\{\w+\}\}/g) || []).sort().join(',');
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

function needsTranslation(text) {
  return /\p{L}{2}/u.test(text.replace(/\{\{\w+\}\}/g, ' '));
}

function review(lang, source, translation) {
  if (!needsTranslation(source) && translation === source) return null;
  if (typeof translation !== 'string' || translation.trim() === '') {
    return { level: 'error', reason: 'empty' };
  }
  if (placeholderSignature(source) !== placeholderSignature(translation)) {
    return { level: 'error', reason: 'placeholders differ' };
  }
  if (/<\/?[a-z][^>]*>/i.test(translation)) {
    return { level: 'error', reason: 'contains HTML' };
  }
  const stripped = (text) => text.replace(/\{\{\w+\}\}/g, ' ');
  return reviewTranslation(lang, stripped(source), stripped(translation));
}

function chunkCommand(workDir, wordsPerChunk) {
  const source = readJson(SOURCE_FILE, {});
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
  for (const text of Object.keys(source).sort()) {
    chunk[idOf(text)] = {
      text,
      tags: ['ui'],
      page: source[text].files[0] || '',
    };
    words += text.split(/\s+/).length;
    if (words >= wordsPerChunk) flush();
  }
  flush();
  console.log(
    `Wrote ${index} chunks for ${Object.keys(source).length} strings`
  );
}

function mergeCommand(lang, outDir, replace) {
  const source = readJson(SOURCE_FILE, {});
  const byId = new Map(Object.keys(source).map((text) => [idOf(text), text]));
  const existing = readJson(targetFile(lang), {});
  const accepted = {};
  const rejected = [];
  const files = fs.existsSync(outDir)
    ? fs
        .readdirSync(outDir)
        .filter((file) => /^chunk-\d+\.json$/.test(file))
        .sort()
    : [];
  for (const file of files) {
    const data = readJson(path.join(outDir, file), {});
    for (const [id, translation] of Object.entries(data)) {
      const text = byId.get(id);
      if (!text) {
        rejected.push({ id, reason: 'unknown id' });
        continue;
      }
      const result = review(lang, text, translation);
      if (result && result.level === 'error') {
        rejected.push({ id, reason: result.reason });
        continue;
      }
      if (existing[text] && !replace) continue;
      accepted[text] = translation;
    }
  }
  const merged = { ...existing, ...accepted };
  for (const text of Object.keys(source)) {
    if (!needsTranslation(text) && !merged[text]) merged[text] = text;
  }
  const sorted = {};
  for (const text of Object.keys(merged).sort()) sorted[text] = merged[text];
  writeJson(targetFile(lang), sorted);
  writeJson(path.join(outDir, 'rejects.json'), rejected);
  const missing = Object.keys(source).filter((text) => !sorted[text]);
  console.log(
    `${lang}: accepted ${Object.keys(accepted).length}, rejected ${rejected.length}, still missing ${missing.length}`
  );
}

function validateCommand(lang) {
  const source = readJson(SOURCE_FILE, {});
  const content = readJson(targetFile(lang), {});
  const errors = [];
  const stale = [];
  for (const [text, translation] of Object.entries(content)) {
    if (!source[text]) {
      stale.push(text);
      continue;
    }
    const result = review(lang, text, translation);
    if (result && result.level === 'error') {
      errors.push({ text, reason: result.reason });
    }
  }
  const missing = Object.keys(source).filter((text) => !content[text]);
  const translated = Object.keys(content).length - stale.length;
  console.log(
    `${lang}: ${translated}/${Object.keys(source).length} translated, ${errors.length} errors, ${missing.length} missing${stale.length ? `, ${stale.length} stale (run prune to remove)` : ''}`
  );
  return { errors, missing, stale };
}

function pruneCommand(lang) {
  const source = readJson(SOURCE_FILE, {});
  const content = readJson(targetFile(lang), {});
  const kept = {};
  for (const text of Object.keys(content).sort()) {
    if (source[text]) kept[text] = content[text];
  }
  writeJson(targetFile(lang), kept);
  console.log(
    `${lang}: removed ${Object.keys(content).length - Object.keys(kept).length} stale keys`
  );
}

function statusCommand() {
  const source = readJson(SOURCE_FILE, {});
  const total = Object.keys(source).length;
  for (const lang of languages()) {
    const content = readJson(targetFile(lang), {});
    const done = Object.keys(content).filter((text) => source[text]).length;
    console.log(`${lang.padEnd(6)} ${done}/${total}`);
  }
}

const [command, ...args] = process.argv.slice(2);
if (command === 'chunk') chunkCommand(args[0], Number(args[1] || 800));
else if (command === 'merge')
  mergeCommand(args[0], args[1], args.includes('--replace'));
else if (command === 'validate') {
  const result = validateCommand(args[0]);
  process.exitCode = result.errors.length > 0 ? 1 : 0;
} else if (command === 'prune') pruneCommand(args[0]);
else if (command === 'status') statusCommand();
else {
  console.error(
    'Usage: ui-translations.mjs chunk <workDir> [words] | merge <lang> <outDir> [--replace] | validate <lang> | prune <lang> | status'
  );
  process.exitCode = 2;
}
