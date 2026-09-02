import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Navigation BASE_URL Consistency', () => {
  const logicDir = path.resolve(__dirname, '../js/logic');
  const pagesDir = path.resolve(__dirname, '../pages');
  const rootDir = path.resolve(__dirname, '../../');

  it('ensures no tool logic files hardcode root "/" or relative paths for navigation', () => {
    const files = fs
      .readdirSync(logicDir)
      .filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

    const offendingFiles: string[] = [];

    for (const file of files) {
      const content = fs.readFileSync(path.join(logicDir, file), 'utf-8');

      // Check for hardcoded root redirects or relative path escapes
      if (
        /window\.location\.href\s*=\s*['"`]\/['"`]/.test(content) ||
        /window\.location\.href\s*=\s*['"`]\.\.\//.test(content)
      ) {
        offendingFiles.push(file);
      }
    }

    expect(
      offendingFiles,
      `The following files hardcode root or relative navigation instead of import.meta.env.BASE_URL: ${offendingFiles.join(
        ', '
      )}`
    ).toEqual([]);
  });

  it('ensures tool logic files with back-to-tools button use import.meta.env.BASE_URL', () => {
    const files = fs
      .readdirSync(logicDir)
      .filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

    const filesMissingBaseUrl: string[] = [];

    for (const file of files) {
      const content = fs.readFileSync(path.join(logicDir, file), 'utf-8');

      // If the file handles 'back-to-tools' click navigation
      if (
        content.includes('back-to-tools') &&
        content.includes('window.location.href') &&
        !content.includes('import.meta.env.BASE_URL')
      ) {
        filesMissingBaseUrl.push(file);
      }
    }

    expect(
      filesMissingBaseUrl,
      `The following files handle back-to-tools navigation without import.meta.env.BASE_URL: ${filesMissingBaseUrl.join(
        ', '
      )}`
    ).toEqual([]);
  });

  it('ensures HTML templates do not hardcode href="/" for brand links', () => {
    const htmlFiles = fs
      .readdirSync(pagesDir)
      .filter((file) => file.endsWith('.html'))
      .map((file) => path.join(pagesDir, file));

    const simpleIndex = path.join(rootDir, 'simple-index.html');
    if (fs.existsSync(simpleIndex)) {
      htmlFiles.push(simpleIndex);
    }

    const offendingFiles: string[] = [];

    for (const filePath of htmlFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');

      // Brand link / logo anchor should not be hardcoded to href="/"
      // e.g. <a href="/"> should be <a href="{{baseUrl}}">
      if (/<a\s+[^>]*href=["']\/["'][^>]*>.*BentoPDF/i.test(content)) {
        offendingFiles.push(path.basename(filePath));
      }
    }

    expect(
      offendingFiles,
      `The following HTML templates hardcode href="/" for the brand link: ${offendingFiles.join(
        ', '
      )}`
    ).toEqual([]);
  });
});
