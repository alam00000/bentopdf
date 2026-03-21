import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const docsDistPath = path.join(projectRoot, 'docs', '.vitepress', 'dist');
const mainDistPath = path.join(projectRoot, 'dist');
const targetDocsPath = path.join(mainDistPath, 'docs');

function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log('Including docs in dist...');

if (!fs.existsSync(docsDistPath)) {
    console.error('Error: Docs build not found. Please run "npm run docs:build" first.');
    process.exit(1);
}
if (!fs.existsSync(mainDistPath)) {
    console.error('Error: Main dist folder not found. Please run "npm run build" first.');
    process.exit(1);
}

try {
    console.log(`Copying from: ${docsDistPath}`);
    console.log(`Copying to: ${targetDocsPath}`);

    copyDir(docsDistPath, targetDocsPath);

    console.log('Docs successfully included in dist/docs!');

    const files = fs.readdirSync(targetDocsPath);
    console.log(`Copied ${files.length} items to dist/docs`);
} catch (error) {
    console.error('Error copying docs:', error.message);
    process.exit(1);
}
