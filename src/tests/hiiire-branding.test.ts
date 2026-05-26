import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const projectRoot = resolve(__dirname, '../..');

function readProjectFile(path: string) {
  return readFileSync(resolve(projectRoot, path), 'utf8');
}

describe('hiiirePDF branded surface', () => {
  it('uses hiiirePDF as the visible product name on the landing page', () => {
    const html = readProjectFile('index.html');

    expect(html).toContain('hiiirePDF');
    expect(html).not.toContain('HirePDF');
  });

  it('keeps the homepage tools area on the dark Hiiire surface', () => {
    const html = readProjectFile('index.html');
    const main = readProjectFile('src/js/main.ts');
    const css = readProjectFile('src/css/styles.css');

    expect(html).not.toContain('<section class="bg-slate-950');
    expect(html).not.toContain('border-slate-700 bg-slate-800');
    expect(html).toContain('border-t border-border bg-background');
    expect(main).not.toContain('bg-gray-800');
    expect(main).toContain('bg-card/60');
    expect(css).toContain('#tool-uploader.bg-gray-800');
    expect(css).toContain('--color-background: #0a0a0a');
    expect(css).toContain('background-color: #0a0a0a !important');
  });

  it('builds the branded deploy with hiiirePDF defaults', () => {
    const buildScript = readProjectFile('scripts/build-hirepdf.mjs');

    expect(buildScript).toContain("VITE_BRAND_NAME: 'hiiirePDF'");
    expect(buildScript).toContain('© 2026 hiiirePDF');
  });

  it('generates the branded deploy with the refreshed favicon assets', () => {
    const buildScript = readProjectFile('scripts/build-hirepdf.mjs');
    const brandingScript = readProjectFile('scripts/apply-branding.mjs');

    expect(buildScript).toContain("VITE_BRAND_LOGO: 'images/favicon.svg'");
    expect(brandingScript).toContain("src: '/images/favicon.svg'");
    expect(brandingScript).toContain("src: '/images/favicon-192x192.png'");
    expect(brandingScript).toContain("src: '/images/favicon-512x512.png'");
  });

  it('does not keep the previous product branding in tracked text files', () => {
    const previousBrandNeedle = ['ben', 'to'].join('');
    let output = '';
    try {
      output = execFileSync(
        'git',
        [
          'grep',
          '-Il',
          '-i',
          previousBrandNeedle,
          '--',
          '.',
          ':!.github/workflows',
        ],
        {
          cwd: projectRoot,
          encoding: 'utf8',
        }
      );
    } catch (error) {
      const status = (error as { status?: number }).status;
      if (status !== 1) throw error;
    }
    const contentOffenders = output.split(/\r?\n/).filter(Boolean);
    const pathOffenders = execFileSync('git', ['ls-files'], {
      cwd: projectRoot,
      encoding: 'utf8',
    })
      .split(/\r?\n/)
      .filter(
        (path) =>
          !path.startsWith('.github/workflows/') &&
          path.toLowerCase().includes(previousBrandNeedle)
      );

    expect([...contentOffenders, ...pathOffenders]).toEqual([]);
  });
});
