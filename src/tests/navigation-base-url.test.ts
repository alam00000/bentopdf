import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Navigation BASE_URL Consistency', () => {
  const logicDir = path.resolve(__dirname, '../js/logic');
  const pagesDir = path.resolve(__dirname, '../pages');
  const rootDir = path.resolve(__dirname, '../../');

  it('ensures tool navigation assignments strictly use import.meta.env.BASE_URL', () => {
    const files = fs
      .readdirSync(logicDir)
      .filter(
        (file) =>
          (file.endsWith('.ts') || file.endsWith('.js')) &&
          file !== 'shortcuts.ts'
      );

    const nonCompliantAssignments: Array<{ file: string; target: string }> = [];

    for (const file of files) {
      const content = fs.readFileSync(path.join(logicDir, file), 'utf-8');
      const assignments = content.matchAll(
        /window\.location\.href\s*=\s*([^;\n]+)/g
      );

      for (const match of assignments) {
        const target = match[1].trim();
        if (!target.includes('import.meta.env.BASE_URL')) {
          nonCompliantAssignments.push({ file, target });
        }
      }
    }

    expect(
      nonCompliantAssignments,
      `The following files assign window.location.href without import.meta.env.BASE_URL: ${JSON.stringify(
        nonCompliantAssignments,
        null,
        2
      )}`
    ).toEqual([]);
  });

  it('ensures each affected back-button handler assigns import.meta.env.BASE_URL', () => {
    const affectedFiles = [
      'deskew-pdf-page.ts',
      'markdown-to-pdf-page.ts',
      'remove-annotations-page.ts',
      'form-filler-page.ts',
      'remove-blank-pages-page.ts',
    ];

    for (const file of affectedFiles) {
      const content = fs.readFileSync(path.join(logicDir, file), 'utf-8');
      expect(
        content,
        `${file} must assign window.location.href to import.meta.env.BASE_URL`
      ).toMatch(/window\.location\.href\s*=\s*import\.meta\.env\.BASE_URL/);
    }
  });

  it('ensures brand anchor in standalone templates asserts href="{{baseUrl}}"', () => {
    const standaloneTemplates = [
      path.join(pagesDir, 'pdf-multi-tool.html'),
      path.join(rootDir, 'simple-index.html'),
      path.join(rootDir, 'src/partials/navbar-simple.html'),
    ];

    for (const filePath of standaloneTemplates) {
      if (!fs.existsSync(filePath)) continue;

      const content = fs.readFileSync(filePath, 'utf-8');
      const anchors = [
        ...content.matchAll(
          /<a\b[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a\s*>/gi
        ),
      ];

      const brandAnchor = anchors.find(([, , innerContent]) =>
        /{{#if\s+brandName}}|BentoPDF/i.test(innerContent)
      );

      expect(
        brandAnchor,
        `Could not locate brand anchor in ${path.basename(filePath)}`
      ).toBeDefined();

      const href = brandAnchor?.[1];
      expect(
        href,
        `Expected ${path.basename(filePath)} brand anchor href to be "{{baseUrl}}" but got "${href}"`
      ).toBe('{{baseUrl}}');
    }
  });
});
