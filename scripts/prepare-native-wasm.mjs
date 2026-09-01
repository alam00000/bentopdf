#!/usr/bin/env node
/**
 * Recompresses the LibreOffice WASM payloads from gzip to brotli for the
 * native app builds.
 *
 * LibreOffice is by far the largest thing in the app - 74 MB of a ~105 MB
 * install, and it ships pre-gzipped, so the APK/IPA cannot compress it any
 * further. Brotli takes the same bytes to ~47 MB with no loss of anything:
 *
 *   soffice.wasm   140.6 MB raw -> 46.5 MB gzip -> 31.5 MB brotli
 *   soffice.data    95.1 MB raw -> 27.3 MB gzip -> 15.4 MB brotli
 *
 * Quality 11 is slow (~10 minutes for both, run in parallel), so the output is
 * cached in a gitignored directory and keyed by the source file's size and
 * mtime. It only re-runs when the upstream payload actually changes.
 */
import { brotliCompress, constants, gunzipSync } from 'node:zlib';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const compress = promisify(brotliCompress);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(root, 'public', 'libreoffice-wasm');
const cacheDir = path.join(root, '.native-cache', 'libreoffice-wasm');

const PAYLOADS = ['soffice.wasm.gz', 'soffice.data.gz'];

const mb = (bytes) => `${(bytes / 1048576).toFixed(1)} MB`;

/** Identity of a source file, so a changed payload invalidates the cache. */
const stamp = (file) => {
  const { size, mtimeMs } = fs.statSync(file);
  return `${size}:${Math.round(mtimeMs)}`;
};

const prepare = async (name) => {
  const source = path.join(sourceDir, name);
  if (!fs.existsSync(source)) {
    throw new Error(`Missing LibreOffice payload: ${source}`);
  }

  const outName = name.replace(/\.gz$/, '.br');
  const out = path.join(cacheDir, outName);
  const stampFile = `${out}.stamp`;
  const expected = stamp(source);

  if (
    fs.existsSync(out) &&
    fs.existsSync(stampFile) &&
    fs.readFileSync(stampFile, 'utf8') === expected
  ) {
    console.log(
      `[native-wasm] ${outName} is up to date (${mb(fs.statSync(out).size)})`
    );
    return;
  }

  console.log(
    `[native-wasm] Compressing ${outName} - this takes a few minutes, but only once...`
  );
  const started = Date.now();

  // 1 GiB ceiling: soffice.wasm expands to ~141 MB, so this is headroom, not a
  // target, and it stops a corrupt payload from exhausting memory.
  const raw = gunzipSync(fs.readFileSync(source), { maxOutputLength: 1 << 30 });
  const compressed = await compress(raw, {
    params: {
      [constants.BROTLI_PARAM_QUALITY]: 11,
      [constants.BROTLI_PARAM_LGWIN]: 24,
      [constants.BROTLI_PARAM_SIZE_HINT]: raw.length,
    },
  });

  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(out, compressed);
  fs.writeFileSync(stampFile, expected);

  const seconds = ((Date.now() - started) / 1000).toFixed(0);
  console.log(
    `[native-wasm] ${outName}: ${mb(fs.statSync(source).size)} gzip -> ${mb(compressed.length)} brotli (${seconds}s)`
  );
};

// Both payloads at once - brotli releases the loop, so this halves wall time.
await Promise.all(PAYLOADS.map(prepare));
