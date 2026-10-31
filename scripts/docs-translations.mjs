import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs');
const LOCALES_DIR = path.join(ROOT, 'public/locales');
const FILE_EXTENSION = /\.[a-z0-9]{2,5}$/i;

const SCRIPT_RANGES = {
  ar: /[\u0600-\u06ff]/,
  fa: /[\u0600-\u06ff]/,
  be: /[\u0400-\u04ff]/,
  ru: /[\u0400-\u04ff]/,
  uk: /[\u0400-\u04ff]/,
  ja: /[\u3040-\u30ff\u4e00-\u9fff]/,
  zh: /[\u4e00-\u9fff]/,
  'zh-TW': /[\u4e00-\u9fff]/,
  ko: /[\uac00-\ud7af]/,
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

function proseOf(markdown) {
  let fenced = false;
  return markdown
    .split('\n')
    .filter((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        fenced = !fenced;
        return false;
      }
      return !fenced && !/^\s*(\||:::|---)/.test(line);
    })
    .join(' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/https?:\/\/\S+/g, ' ');
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

export function listSourceFiles() {
  const langs = new Set(languages());
  const files = [];
  const walk = (dir, relative) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      if (entry.name === 'public') continue;
      const next = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (!relative && langs.has(entry.name)) continue;
        walk(path.join(dir, entry.name), next);
      } else if (entry.name.endsWith('.md')) {
        files.push(next);
      }
    }
  };
  walk(DOCS_DIR, '');
  return files.sort();
}

function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

export function localizeLinks(markdown, lang) {
  const prefix = `/${lang}`;
  const shouldPrefix = (target) => {
    if (!target.startsWith('/') || target.startsWith('//')) return false;
    if (target === prefix || target.startsWith(`${prefix}/`)) return false;
    if (/^\/(images|docs)(\/|$)/.test(target)) return false;
    const pathOnly = target.split(/[?#]/)[0];
    return !FILE_EXTENSION.test(pathOnly);
  };
  const lines = markdown.split('\n');
  let fenced = false;
  return lines
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        fenced = !fenced;
        return line;
      }
      if (fenced) return line;
      const linkRewritten = line.replace(
        /(?<!!)(\[[^\]]*\]\()(\/[^)\s]*)(\))/g,
        (match, open, target, close) =>
          shouldPrefix(target) ? `${open}${prefix}${target}${close}` : match
      );
      return linkRewritten.replace(
        /^(\s*(?:-\s+)?link:\s*)(\/\S*)\s*$/,
        (match, head, target) =>
          shouldPrefix(target) ? `${head}${prefix}${target}` : match
      );
    })
    .join('\n');
}

const SLUG_CONTROL = /[\u0000-\u001f]/g;
const SLUG_SPECIAL =
  /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'\u201c\u201d\u2018\u2019<>,.?/]+/g;
const SLUG_COMBINING = /[\u0300-\u036f]/g;

function slugify(text) {
  return text
    .normalize('NFKD')
    .replace(SLUG_COMBINING, '')
    .replace(SLUG_CONTROL, '')
    .replace(SLUG_SPECIAL, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^(\d)/, '_$1')
    .toLowerCase();
}

function listHeadings(markdown) {
  const headings = [];
  const lines = markdown.split('\n');
  let fenced = false;
  let inFrontmatter = lines[0] === '---';
  lines.forEach((line, index) => {
    if (inFrontmatter) {
      if (index > 0 && line === '---') inFrontmatter = false;
      return;
    }
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      return;
    }
    if (fenced) return;
    const match = line.match(/^(#{1,6})\s+(.*?)\s*$/);
    if (!match) return;
    const explicit = match[2].match(/\s*\{#([^}]+)\}\s*$/);
    const text = match[2].replace(/\s*\{#[^}]+\}\s*$/, '');
    headings.push({
      line: index,
      text,
      explicitId: explicit ? explicit[1] : null,
    });
  });
  return headings;
}

function headingId(text) {
  return slugify(
    text
      .replace(/`/g, '')
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\*/g, '')
  );
}

export function quoteFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return markdown;
  const body = match[1]
    .split('\n')
    .map((line) => {
      const field = line.match(/^(\s*(?:- )?[\w-]+):[ \t]+(.+)$/);
      if (!field) return line;
      const value = field[2].trim();
      if (/^["'|>]/.test(value)) return line;
      if (!/: |\s#|^[&*!%@`{[]/.test(value)) return line;
      return `${field[1]}: "${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    })
    .join('\n');
  return `---\n${body}\n---\n${markdown.slice(match[0].length)}`;
}

function headingIds(markdown) {
  const used = new Map();
  return listHeadings(markdown).map((heading) => {
    if (heading.explicitId) return heading.explicitId;
    const base = headingId(heading.text);
    const count = used.get(base) || 0;
    used.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  });
}

export function removeGeneratedAnchors(source, translated) {
  const english = listHeadings(source);
  const target = listHeadings(translated);
  if (english.length !== target.length) return translated;
  const lines = translated.split('\n');
  target.forEach((heading, index) => {
    if (english[index].explicitId) {
      lines[heading.line] = lines[heading.line].replace(
        /\s*\{#\\?[^}]+\}\s*$/,
        ` {#${english[index].explicitId}}`
      );
    } else if (heading.explicitId) {
      lines[heading.line] = lines[heading.line].replace(
        /\s*\{#\\?[^}]+\}\s*$/,
        ''
      );
    }
  });
  return lines.join('\n');
}

export function anchorMap(source, translated) {
  const english = headingIds(source);
  const target = headingIds(translated);
  const map = new Map();
  if (english.length !== target.length) return { map, ids: new Set(target) };
  english.forEach((id, index) => map.set(id, target[index]));
  return { map, ids: new Set(target) };
}

function linkedDocsFile(target, currentFile, lang) {
  const pathPart = target.split('#')[0].split('?')[0];
  let relative;
  if (pathPart === '') {
    return currentFile;
  } else if (pathPart === `/${lang}` || pathPart.startsWith(`/${lang}/`)) {
    relative = pathPart.slice(lang.length + 2);
  } else if (!pathPart.startsWith('/') && !/^[a-z]+:/i.test(pathPart)) {
    relative = path.posix.join(path.posix.dirname(currentFile), pathPart);
  } else {
    return null;
  }
  relative = relative.replace(/\.(md|html)$/, '').replace(/^\/+/, '');
  if (relative === '' || relative.endsWith('/')) return `${relative}index.md`;
  return `${relative}.md`;
}

export function translateAnchors(markdown, currentFile, lang, anchors) {
  let fenced = false;
  return markdown
    .split('\n')
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        fenced = !fenced;
        return line;
      }
      if (fenced) return line;
      return line.replace(
        /(?<!!)(\[[^\]]*\]\()([^)\s]*#[^)\s]+)(\))/g,
        (match, open, target, close) => {
          const file = linkedDocsFile(target, currentFile, lang);
          const entry = file && anchors.get(file);
          if (!entry) return match;
          const hashIndex = target.indexOf('#');
          const hash = decodeURIComponent(target.slice(hashIndex + 1));
          if (entry.ids.has(hash) || !entry.map.has(hash)) return match;
          return `${open}${target.slice(0, hashIndex + 1)}${entry.map.get(hash)}${close}`;
        }
      );
    })
    .join('\n');
}

export function brokenAnchors(markdown, currentFile, lang, anchors) {
  const broken = [];
  let fenced = false;
  for (const line of markdown.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    for (const match of line.matchAll(
      /(?<!!)\[[^\]]*\]\(([^)\s]*#[^)\s]+)\)/g
    )) {
      const target = match[1];
      const file = linkedDocsFile(target, currentFile, lang);
      const entry = file && anchors.get(file);
      if (!entry) continue;
      const hash = decodeURIComponent(target.slice(target.indexOf('#') + 1));
      if (!entry.ids.has(hash)) broken.push(target);
    }
  }
  return broken;
}

export function summarize(markdown) {
  let body = markdown;
  const frontmatterKeys = [];
  if (markdown.startsWith('---')) {
    const end = markdown.indexOf('\n---', 3);
    if (end > 0) {
      const frontmatter = markdown.slice(3, end);
      for (const line of frontmatter.split('\n')) {
        const key = line.match(/^([A-Za-z_][\w-]*):/);
        if (key) frontmatterKeys.push(key[1]);
      }
      body = markdown.slice(end + 4);
    }
  }
  const headings = [];
  const fences = [];
  const links = [];
  const containers = [];
  const tables = [];
  let fenced = null;
  let current = null;
  let tableRows = 0;
  for (const line of body.split('\n')) {
    const fence = line.match(/^\s*(```|~~~)/);
    if (fence) {
      if (fenced === null) {
        fenced = { marker: fence[1], lines: [line.trim()] };
      } else {
        fenced.lines.push(line.trim());
        fences.push(fenced.lines.join('\n'));
        fenced = null;
      }
      continue;
    }
    if (fenced) {
      fenced.lines.push(line);
      continue;
    }
    const heading = line.match(/^(#{1,6})\s/);
    if (heading) headings.push(heading[1].length);
    const container = line.match(/^:::\s*([a-z-]+)?/);
    if (container) containers.push(container[1] || 'end');
    if (/^\s*\|/.test(line)) {
      tableRows += 1;
      current = true;
    } else if (current) {
      tables.push(tableRows);
      tableRows = 0;
      current = null;
    }
    for (const match of line.matchAll(/!?\[[^\]]*\]\(([^)\s]+)[^)]*\)/g)) {
      links.push(match[1]);
    }
  }
  if (current) tables.push(tableRows);
  return {
    frontmatterKeys,
    headings,
    fences,
    links: links.sort(),
    containers,
    tables,
  };
}

function sameJson(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function compareStructure(source, translated, lang) {
  const problems = [];
  const a = summarize(source);
  const b = summarize(translated);
  if (!sameJson(a.frontmatterKeys, b.frontmatterKeys)) {
    problems.push('frontmatter keys differ');
  }
  if (!sameJson(a.headings, b.headings)) problems.push('heading levels differ');
  if (!sameJson(a.fences, b.fences)) problems.push('code blocks differ');
  if (!sameJson(a.containers, b.containers)) problems.push('containers differ');
  if (!sameJson(a.tables, b.tables)) problems.push('table sizes differ');
  const withoutAnchor = (link) => link.replace(/#.*$/, '');
  const localizedLinks = (links) =>
    links
      .map((link) =>
        link.startsWith(`/${lang}/`) ? link.slice(lang.length + 1) : link
      )
      .map(withoutAnchor)
      .sort();
  if (!sameJson(a.links.map(withoutAnchor).sort(), localizedLinks(b.links))) {
    problems.push('link targets differ');
  }
  if (
    /—/.test(
      translated
        .replace(/^(```|~~~)[\s\S]*?^\1/gm, '')
        .replace(/`[^`\n]*`/g, '')
    )
  ) {
    problems.push('contains an em dash');
  }
  if (translated.trim() === source.trim())
    problems.push('identical to English');
  const prose = proseOf(translated);
  const proseWords = wordCount(prose);
  const sourceWords = wordCount(proseOf(source));
  if (sourceWords > 40) {
    const range = SCRIPT_RANGES[lang];
    if (range && !range.test(prose)) problems.push('not in the target script');
    const tokens = prose
      .toLowerCase()
      .split(/[^\p{L}]+/u)
      .filter(Boolean);
    if (!range && tokens.length >= 40) {
      const hits = tokens.filter((token) => ENGLISH_MARKERS.has(token)).length;
      if (hits / tokens.length >= 0.08) problems.push('looks like English');
    }
    const unspaced = ['ja', 'zh', 'zh-TW'].includes(lang);
    const ratio = unspaced
      ? prose.replace(/\s+/g, '').length /
        proseOf(source).replace(/\s+/g, '').length
      : proseWords / sourceWords;
    if (unspaced ? ratio < 0.15 || ratio > 1.5 : ratio < 0.4 || ratio > 3)
      problems.push(`length ratio ${ratio.toFixed(2)}`);
  }
  return problems;
}

function groupsCommand(outFile, wordsPerGroup) {
  const files = listSourceFiles();
  const groups = [];
  let current = [];
  let words = 0;
  for (const file of files) {
    const count = wordCount(
      fs.readFileSync(path.join(DOCS_DIR, file), 'utf-8')
    );
    if (current.length > 0 && words + count > wordsPerGroup) {
      groups.push(current);
      current = [];
      words = 0;
    }
    current.push(file);
    words += count;
  }
  if (current.length > 0) groups.push(current);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(groups, null, 2) + '\n');
  console.log(`${files.length} files in ${groups.length} groups`);
}

const ENGLISH_ONLY_DOCS = new Set(['licensing.md']);

function checkCommand(lang, only) {
  const files = only.length > 0 ? only : listSourceFiles();
  const results = [];
  let missing = 0;
  const anchors = anchorsFor(translatedDocs(lang));
  for (const file of files) {
    const translatedPath = path.join(DOCS_DIR, lang, file);
    if (!fs.existsSync(translatedPath)) {
      missing += 1;
      results.push({ file, problems: ['missing'] });
      continue;
    }
    if (ENGLISH_ONLY_DOCS.has(file)) continue;
    const translated = fs.readFileSync(translatedPath, 'utf-8');
    const problems = compareStructure(
      fs.readFileSync(path.join(DOCS_DIR, file), 'utf-8'),
      translated,
      lang
    );
    const broken = brokenAnchors(translated, file, lang, anchors);
    if (broken.length > 0) {
      problems.push(`broken anchor links: ${broken.join(', ')}`);
    }
    if (/^#{1,6} .*\{#\\/m.test(translated)) {
      problems.push('escaped heading anchor');
    }
    if (problems.length > 0) results.push({ file, problems });
  }
  const bad = results.filter((entry) => !entry.problems.includes('missing'));
  console.log(
    `${lang}: ${files.length - missing}/${files.length} files present, ${bad.length} with problems`
  );
  if (results.length > 0)
    console.log(JSON.stringify(results.slice(0, 40), null, 2));
  process.exitCode = bad.length > 0 ? 1 : 0;
}

function translatedDocs(lang) {
  const docs = new Map();
  for (const file of listSourceFiles()) {
    const target = path.join(DOCS_DIR, lang, file);
    if (!fs.existsSync(target)) continue;
    docs.set(file, {
      target,
      source: fs.readFileSync(path.join(DOCS_DIR, file), 'utf-8'),
      translated: fs.readFileSync(target, 'utf-8'),
    });
  }
  return docs;
}

function anchorsFor(docs) {
  const anchors = new Map();
  for (const [file, doc] of docs) {
    anchors.set(file, anchorMap(doc.source, doc.translated));
  }
  return anchors;
}

function localizeCommand(lang) {
  let changed = 0;
  for (const file of ENGLISH_ONLY_DOCS) {
    const target = path.join(DOCS_DIR, lang, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(DOCS_DIR, file), target);
  }
  const docs = translatedDocs(lang);
  const originals = new Map();
  for (const [file, doc] of docs) {
    originals.set(file, doc.translated);
    doc.translated = quoteFrontmatter(
      removeGeneratedAnchors(doc.source, localizeLinks(doc.translated, lang))
    );
  }
  const anchors = anchorsFor(docs);
  for (const [file, doc] of docs) {
    const after = translateAnchors(doc.translated, file, lang, anchors);
    if (after !== originals.get(file)) {
      fs.writeFileSync(doc.target, after);
      changed += 1;
    }
  }
  console.log(`${lang}: localized links and anchors in ${changed} files`);
}

function labelsCheckCommand(lang) {
  const sourceFile = path.join(DOCS_DIR, '.vitepress/i18n/source.json');
  const source = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));
  const targetFile = path.join(DOCS_DIR, `.vitepress/i18n/${lang}.json`);
  if (!fs.existsSync(targetFile)) {
    console.log(`${lang}: labels file is missing`);
    process.exitCode = 1;
    return;
  }
  const labels = JSON.parse(fs.readFileSync(targetFile, 'utf-8'));
  const problems = [];
  for (const key of source) {
    const value = labels[key];
    if (typeof value !== 'string' || value.trim() === '') {
      problems.push({ key, problem: 'missing or empty' });
    } else if (/\u2014/.test(value)) {
      problems.push({ key, problem: 'contains an em dash' });
    }
  }
  for (const key of Object.keys(labels)) {
    if (!source.includes(key)) problems.push({ key, problem: 'unknown key' });
  }
  console.log(
    `${lang}: ${source.length - problems.length}/${source.length} labels ok`
  );
  if (problems.length > 0)
    console.log(JSON.stringify(problems.slice(0, 30), null, 2));
  process.exitCode = problems.length > 0 ? 1 : 0;
}

function statusCommand() {
  const files = listSourceFiles();
  for (const lang of languages()) {
    const present = files.filter((file) =>
      fs.existsSync(path.join(DOCS_DIR, lang, file))
    ).length;
    console.log(`${lang.padEnd(6)} ${present}/${files.length}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [command, ...args] = process.argv.slice(2);
  if (command === 'groups') groupsCommand(args[0], Number(args[1] || 6000));
  else if (command === 'check') checkCommand(args[0], args.slice(1));
  else if (command === 'localize') localizeCommand(args[0]);
  else if (command === 'labels') labelsCheckCommand(args[0]);
  else if (command === 'status') statusCommand();
  else {
    console.error(
      'Usage: docs-translations.mjs groups <outFile> [words] | check <lang> [files...] | localize <lang> | labels <lang> | status'
    );
    process.exitCode = 2;
  }
}
