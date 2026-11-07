import { readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ASSET_DIRECTORY = path.resolve('dist/libreoffice-wasm');
const FILES_TO_SPLIT = ['soffice.data.gz', 'soffice.wasm.gz'];
// Keep a comfortable margin below Cloudflare Workers' 25 MiB per-asset limit.
const MAX_PART_SIZE = 20 * 1024 * 1024;

async function removeStaleParts(directory, filename) {
  const prefix = `${filename}.part-`;
  const entries = await readdir(directory);
  await Promise.all(
    entries
      .filter((entry) => entry.startsWith(prefix))
      .map((entry) => unlink(path.join(directory, entry)))
  );
}

for (const filename of FILES_TO_SPLIT) {
  const filePath = path.join(ASSET_DIRECTORY, filename);
  let fileStat;

  try {
    fileStat = await stat(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') continue;
    throw error;
  }

  if (fileStat.size <= MAX_PART_SIZE) continue;

  const contents = await readFile(filePath);
  const partCount = Math.ceil(contents.length / MAX_PART_SIZE);
  await removeStaleParts(ASSET_DIRECTORY, filename);

  for (let index = 0; index < partCount; index += 1) {
    const start = index * MAX_PART_SIZE;
    const end = Math.min(start + MAX_PART_SIZE, contents.length);
    const partName = `${filename}.part-${String(index).padStart(3, '0')}`;
    await writeFile(path.join(ASSET_DIRECTORY, partName), contents.subarray(start, end));
  }

  await writeFile(
    `${filePath}.parts.json`,
    `${JSON.stringify({ parts: partCount, size: contents.length })}\n`
  );
  await unlink(filePath);

  console.log(
    `[static-assets] Split ${filename} (${(contents.length / 1024 / 1024).toFixed(1)} MiB) into ${partCount} assets.`
  );
}
