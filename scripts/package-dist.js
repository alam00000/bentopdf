#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Get package.json to extract version
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const version = packageJson.version;

import { createWriteStream, existsSync } from 'fs';
import archiver from 'archiver';

function buildAndZip(label, envVars, zipName) {
  console.log(`📦 Building ${label} dist for version ${version}...`);

  try {
    execSync(`${envVars} npm run build`, { stdio: 'inherit', shell: true });
    console.log(`✅ ${label} build completed successfully`);
  } catch (error) {
    console.error(`❌ ${label} build failed:`, error.message);
    process.exit(1);
  }

  const distDir = path.resolve('./dist');
  const zipPath = path.resolve(zipName);

  if (!existsSync(distDir)) {
    console.error('❌ dist directory does not exist.');
    process.exit(1);
  }

  return new Promise((resolve, reject) => {
    const output = createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`✅ Created ${zipPath} (${archive.pointer()} bytes)`);
      resolve();
    });

    archive.on('error', (err) => {
      console.error('❌ Error creating zip:', err);
      reject(err);
    });

    archive.pipe(output);
    archive.directory(distDir, false);
    archive.finalize();
  });
}

await buildAndZip('Full mode', '', `dist-${version}.zip`);
await buildAndZip(
  'Simple mode',
  'SIMPLE_MODE=true',
  `dist-simple-${version}.zip`
);
