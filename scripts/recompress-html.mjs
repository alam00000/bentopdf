import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../dist');

function listHtml(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listHtml(full);
    return entry.name.endsWith('.html') ? [full] : [];
  });
}

let refreshed = 0;
for (const file of listHtml(DIST_DIR)) {
  const brotli = `${file}.br`;
  const gzip = `${file}.gz`;
  if (!fs.existsSync(brotli) && !fs.existsSync(gzip)) continue;
  const html = fs.readFileSync(file);
  if (fs.existsSync(brotli)) {
    fs.writeFileSync(
      brotli,
      zlib.brotliCompressSync(html, {
        params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 },
      })
    );
  }
  if (fs.existsSync(gzip)) {
    fs.writeFileSync(gzip, zlib.gzipSync(html, { level: 9 }));
  }
  refreshed++;
}
console.log(`Recompressed ${refreshed} precompressed HTML files.`);
