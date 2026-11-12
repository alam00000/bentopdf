import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const PAGES_DIR = path.resolve(__dirname, '../pages');

function loadPage(name: string): Document {
  const html = fs.readFileSync(path.join(PAGES_DIR, name), 'utf8');
  return new DOMParser().parseFromString(html, 'text/html');
}

describe('top bar hover text', () => {
  it.each(['pdf-multi-tool.html', 'pdf-workflow.html'])(
    'gives every %s button that hides its label a title',
    (page) => {
      const labels = loadPage(page).querySelectorAll(
        'button span[class*="hidden"][class*=":inline"]'
      );

      expect(labels.length).toBeGreaterThan(0);
      labels.forEach((label) => {
        const button = label.closest('button');
        expect(button?.title, button?.id).toBe(label.textContent?.trim());
      });
    }
  );
});
