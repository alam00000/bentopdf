import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Arabic product shell', () => {
  it('sets Arabic and RTL before JavaScript on every application page', () => {
    const files = [
      ...fs.readdirSync('.').filter((file) => file.endsWith('.html')),
      ...fs
        .readdirSync('src/pages')
        .filter((file) => file.endsWith('.html'))
        .map((file) => `src/pages/${file}`),
    ];
    for (const file of files) {
      const source = fs.readFileSync(file, 'utf8');
      expect(source.match(/<html[^>]+>/i)?.[0], file).toMatch(/lang="ar"/);
      expect(source.match(/<html[^>]+>/i)?.[0], file).toMatch(/dir="rtl"/);
    }
  });
  it('retains upload hooks and PDF processing option values', () => {
    const doc = new DOMParser().parseFromString(
      fs.readFileSync('src/pages/merge-pdf.html', 'utf8'),
      'text/html'
    );
    expect(doc.querySelector<HTMLInputElement>('#file-input')?.accept).toBe(
      'application/pdf'
    );
    expect(doc.querySelector('#file-input')?.hasAttribute('multiple')).toBe(
      true
    );
    for (const id of [
      'drop-zone',
      'file-list',
      'process-btn',
      'retain-page-labels',
      'remove-duplicate-fonts',
    ]) {
      expect(doc.getElementById(id), id).not.toBeNull();
    }
  });
  it('keeps technical editor direction controls independent of the RTL shell', () => {
    const css = fs.readFileSync('src/css/arabic-premium.css', 'utf8');
    expect(css).toContain('.pdfViewer');
    expect(css).toContain('direction: ltr');
  });
  it('ships a local Arabic font and an Arabic installable app manifest', () => {
    const manifest = JSON.parse(
      fs.readFileSync('public/site.webmanifest', 'utf8')
    );
    expect(manifest.lang).toBe('ar');
    expect(manifest.dir).toBe('rtl');
    expect(fs.readFileSync('src/css/styles.css', 'utf8')).toContain(
      '@fontsource/tajawal/arabic-400.css'
    );
  });
});
