#!/usr/bin/env node
import { createReadStream, createWriteStream, readdirSync, statSync, unlinkSync } from 'fs';
import { join, extname } from 'path';
import { createBrotliCompress, createGzip, constants } from 'zlib';
import { pipeline } from 'stream/promises';

const DIST_DIR = './dist';

// File extensions to compress
const EXTENSIONS_TO_COMPRESS = [
    '.wasm',
    '.whl',
    '.data',
    '.zip',
    '.json'
];

const MIN_SIZE = 1024;

const mode = process.env.COMPRESSION_MODE || process.argv[2] || 'all';

const VALID_MODES = ['g', 'b', 'o', 'all'];
if (!VALID_MODES.includes(mode)) {
    console.error(`❌ Invalid compression mode: ${mode}`);
    console.error(`   Valid modes: g (gzip only), b (brotli only), o (original only), all (all formats)`);
    process.exit(1);
}

console.log(`🔧 Compression mode: ${mode}`);
console.log(`   ${getModeDescription(mode)}\n`);

function getModeDescription(mode) {
    const descriptions = {
        g: 'gzip ONLY (keeps .gz, deletes originals and .br)',
        b: 'brotli ONLY (keeps .br, deletes originals and .gz)',
        o: 'original ONLY (keeps originals, deletes .gz and .br)',
        all: 'ALL formats (keeps .gz, .br, and originals)'
    };
    return descriptions[mode];
}

function getAllFiles(dir, files = []) {
    const entries = readdirSync(dir);

    for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            getAllFiles(fullPath, files);
        } else {
            files.push(fullPath);
        }
    }

    return files;
}

/**
 * Compress a file with Brotli (level 11)
 */
async function compressBrotli(inputPath, outputPath) {
    const brotli = createBrotliCompress({
        params: {
            [constants.BROTLI_PARAM_QUALITY]: 11,
            [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_GENERIC,
        },
    });

    await pipeline(
        createReadStream(inputPath),
        brotli,
        createWriteStream(outputPath)
    );
}

/**
 * Compress a file with gzip (level 9)
 */
async function compressGzip(inputPath, outputPath) {
    const gzip = createGzip({ level: 9 });

    await pipeline(
        createReadStream(inputPath),
        gzip,
        createWriteStream(outputPath)
    );
}

function deleteCompressedFiles() {
    console.log('🗑️  Deleting compressed files...\n');
    const allFiles = getAllFiles(DIST_DIR);
    let deletedCount = 0;

    for (const file of allFiles) {
        if (file.endsWith('.br') || file.endsWith('.gz')) {
            unlinkSync(file);
            deletedCount++;
            console.log(`   Deleted: ${file}`);
        }
    }

    console.log(`\n✅ Deleted ${deletedCount} compressed files\n`);
}

/**
 * Delete original files (keep only compressed versions)
 */
function deleteOriginalFiles(filePaths, extension) {
    console.log(`🗑️  Deleting original files (keeping only ${extension})...\n`);
    let deletedCount = 0;

    for (const file of filePaths) {
        try {
            unlinkSync(file);
            deletedCount++;
            console.log(`   Deleted: ${file}`);
        } catch (error) {
            console.error(`   ⚠️  Failed to delete ${file}: ${error.message}`);
        }
    }

    console.log(`\n✅ Deleted ${deletedCount} original files\n`);
}

/**
 * Delete specific compressed format
 */
function deleteCompressedFormat(extension) {
    console.log(`🗑️  Deleting ${extension} files...\n`);
    const allFiles = getAllFiles(DIST_DIR);
    let deletedCount = 0;

    for (const file of allFiles) {
        if (file.endsWith(extension)) {
            unlinkSync(file);
            deletedCount++;
            console.log(`   Deleted: ${file}`);
        }
    }

    console.log(`\n✅ Deleted ${deletedCount} ${extension} files\n`);
}

async function compressStaticAssets() {
    if (mode === 'o') {
        deleteCompressedFiles();
        return;
    }

    console.log('🔍 Scanning for static assets to compress...\n');

    const allFiles = getAllFiles(DIST_DIR);
    const filesToCompress = allFiles.filter(file => {
        const ext = extname(file);
        const stat = statSync(file);

        if (file.endsWith('.br') || file.endsWith('.gz')) {
            return false;
        }
        return EXTENSIONS_TO_COMPRESS.includes(ext) && stat.size >= MIN_SIZE;
    });

    console.log(`📦 Found ${filesToCompress.length} files to compress\n`);

    let processedCount = 0;
    const shouldCompressBrotli = mode === 'b' || mode === 'all';
    const shouldCompressGzip = mode === 'g' || mode === 'all';

    for (const file of filesToCompress) {
        const stat = statSync(file);
        const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);

        try {
            let brotliStat, gzipStat;

            if (shouldCompressBrotli) {
                await compressBrotli(file, `${file}.br`);
                brotliStat = statSync(`${file}.br`);
            }
            if (shouldCompressGzip) {
                await compressGzip(file, `${file}.gz`);
                gzipStat = statSync(`${file}.gz`);
            }

            processedCount++;
            console.log(`✅ ${file}`);
            console.log(`   Original: ${sizeMB} MB`);

            if (brotliStat) {
                const brotliSizeMB = (brotliStat.size / (1024 * 1024)).toFixed(2);
                console.log(`   Brotli:   ${brotliSizeMB} MB (${((brotliStat.size / stat.size) * 100).toFixed(1)}%)`);
            }

            if (gzipStat) {
                const gzipSizeMB = (gzipStat.size / (1024 * 1024)).toFixed(2);
                console.log(`   Gzip:     ${gzipSizeMB} MB (${((gzipStat.size / stat.size) * 100).toFixed(1)}%)`);
            }

            console.log('');
        } catch (error) {
            console.error(`❌ Failed to compress ${file}:`, error.message);
        }
    }

    console.log(`\n🎉 Compressed ${processedCount}/${filesToCompress.length} files successfully!\n`);

    if (mode === 'g') {
        deleteCompressedFormat('.br');
        deleteOriginalFiles(filesToCompress, '.gz');
    } else if (mode === 'b') {
        deleteCompressedFormat('.gz');
        deleteOriginalFiles(filesToCompress, '.br');
    }
}

compressStaticAssets().catch(err => {
    console.error('❌ Compression failed:', err);
    process.exit(1);
});
