const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceDir = path.join(__dirname, '../unoptimized-js');
const outputDir = path.join(__dirname, '../dist/js');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function processFile(filePath) {
  const relativePath = path.relative(sourceDir, filePath);
  const outputPath = path.join(outputDir, relativePath);
  const outputDirForFile = path.dirname(outputPath);

  // Create subdirectories in the output folder
  if (!fs.existsSync(outputDirForFile)) {
    fs.mkdirSync(outputDirForFile, { recursive: true });
  }

  try {
    // 1. Obfuscate the file
    console.log(`Obfuscating: ${filePath}`);
    const obfuscateCmd = `npx javascript-obfuscator "${filePath}" --output "${outputPath}"`;
    execSync(obfuscateCmd);

    // 2. Minify the obfuscated file using Terser
    console.log(`Minifying: ${outputPath}`);
    const minifyCmd = `npx terser "${outputPath}" -o "${outputPath}" --compress --mangle`;
    execSync(minifyCmd);

    console.log(`Success: ${outputPath}`);
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  fs.readdirSync(dirPath).forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      processDirectory(filePath);
    } else if (path.extname(filePath) === '.js') {
      if (filePath !== path.join(__dirname, 'build.js')) {
        processFile(filePath);
      }
    }
  });
}

console.log('Starting JavaScript build process...');
processDirectory(sourceDir);
console.log('Build complete. Files are in the /dist/js folder.');
