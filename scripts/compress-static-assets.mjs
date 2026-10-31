import fs from 'fs';
import os from 'os';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../dist');
const COMPRESSIBLE = /\.(html|js|mjs|css|json|svg|wasm|xml|txt|webmanifest)$/i;
const MIN_SIZE = 1024;
const MODES = { o: [], g: ['.gz'], b: ['.br'], all: ['.gz', '.br'] };

const brotli = promisify(zlib.brotliCompress);
const gzip = promisify(zlib.gzip);
const ENCODERS = {
  '.gz': (data) => gzip(data, { level: 9 }),
  '.br': (data) =>
    brotli(data, {
      params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 },
    }),
};

const mode = process.env.COMPRESSION_MODE || 'o';
if (!MODES[mode]) {
  console.error(
    `Invalid COMPRESSION_MODE "${mode}". Use o (none), g (.gz), b (.br) or all (.gz and .br).`
  );
  process.exit(1);
}

function listFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(full);
    return entry.isFile() ? [full] : [];
  });
}

const queue = MODES[mode].length
  ? listFiles(DIST_DIR).filter(
      (file) => COMPRESSIBLE.test(file) && fs.statSync(file).size >= MIN_SIZE
    )
  : [];
let written = 0;

async function compress(file) {
  const { mtimeMs } = fs.statSync(file);
  const stale = MODES[mode].filter((ext) => {
    const copy = `${file}${ext}`;
    return !fs.existsSync(copy) || fs.statSync(copy).mtimeMs < mtimeMs;
  });
  if (!stale.length) return;
  const data = await fs.promises.readFile(file);
  for (const ext of stale) {
    const encoded = await ENCODERS[ext](data);
    if (encoded.length < data.length) {
      await fs.promises.writeFile(`${file}${ext}`, encoded);
      written++;
    } else {
      fs.rmSync(`${file}${ext}`, { force: true });
    }
  }
}

async function worker() {
  for (let file = queue.pop(); file; file = queue.pop()) {
    await compress(file);
  }
}

await Promise.all(Array.from({ length: os.availableParallelism() }, worker));

console.log(`Compression mode ${mode}: wrote ${written} precompressed files.`);
