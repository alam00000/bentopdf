import { describe, it, expect, beforeEach } from 'vitest';
import MarkdownIt from 'markdown-it';
import { MarkdownEditor } from '@/js/utils/markdown-editor';
import { useMarkdownPlugins } from '@/js/utils/markdown-plugins';

let container: HTMLDivElement;

function preview(markdown?: string): HTMLElement {
  new MarkdownEditor(
    container,
    markdown === undefined ? {} : { initialContent: markdown }
  );
  return container.querySelector('#mdPreview') as HTMLElement;
}

beforeEach(() => {
  document.body.innerHTML = '';
  container = document.createElement('div');
  document.body.appendChild(container);
});

describe('Markdown to PDF rendering', () => {
  it('renders every feature of the default sample', () => {
    const root = preview();
    for (const selector of [
      'sub',
      'sup',
      'mark',
      'ins',
      'abbr',
      'dl dd',
      '.footnotes',
      'input[type="checkbox"]',
      '.katex',
      '.katex-display',
      'pre code.hljs, pre code .hljs-keyword',
    ]) {
      expect(root.querySelector(selector), selector).not.toBeNull();
    }
    const tocLinks = root.querySelectorAll('.table-of-contents a');
    expect(tocLinks.length).toBeGreaterThan(5);
    for (const link of tocLinks) {
      const id = decodeURIComponent(link.getAttribute('href')!.slice(1));
      expect(document.getElementById(id), id).not.toBeNull();
    }
  });

  it('renders every math delimiter and leaves prices and code alone', () => {
    const root = preview(
      [
        'Dollar $a*b*c$ and paren \\(x^2\\) and escaped \\\\(y\\\\).',
        '',
        '$$\nx\\,y\n$$',
        '',
        '\\[\n\\frac{a}{b}\n\\]',
        '',
        'Mid \\[z\\] and \\\\[w\\\\] here.',
        '',
        '```math\n\\int x\n```',
        '',
        'Price $5 and $10, escaped \\$3, code `$q$`.',
      ].join('\n')
    );
    expect(root.querySelectorAll('.katex').length).toBe(8);
    expect(root.querySelectorAll('.katex-display').length).toBe(5);
    expect(root.querySelector('em')).toBeNull();
    expect(root.textContent).toContain('Price $5 and $10, escaped $3');
    expect(root.querySelector('code')?.textContent).toBe('$q$');
  });

  it('links accented and duplicate headings from the table of contents', () => {
    const root = preview('[[toc]]\n\n## Café & Crème\n\n## Same\n\n## Same');
    const hrefs = Array.from(
      root.querySelectorAll('.table-of-contents a'),
      (a) => decodeURIComponent(a.getAttribute('href')!.slice(1))
    );
    expect(hrefs).toHaveLength(3);
    expect(new Set(hrefs).size).toBe(3);
    for (const id of hrefs)
      expect(document.getElementById(id), id).not.toBeNull();
  });

  it('only treats a line holding nothing but the marker as a TOC', () => {
    const root = preview('[TOC] is short for table of contents.');
    expect(root.querySelector('.table-of-contents')).toBeNull();
    expect(root.textContent).toContain('is short for table of contents.');
  });

  it('still links bare domains', () => {
    const root = preview('Visit www.example.com or example.com today');
    expect(root.querySelectorAll('a[href^="http"]').length).toBe(2);
  });

  it('keeps KaTeX from creating links, images or raw HTML', () => {
    const root = preview(
      [
        '$\\href{javascript:alert(1)}{x}$',
        '$\\url{javascript:alert(2)}$',
        '$\\includegraphics{https://example.com/x.png}$',
        '$\\htmlClass{x}{y}\\htmlStyle{position:fixed}{z}\\htmlId{app}{w}$',
        '\\[\\text{<img src=x onerror=alert(3)>}\\]',
        '$\\def\\a{\\a\\a}\\a$',
      ].join('\n\n')
    );
    expect(root.querySelector('a, img, script, [onerror], #app')).toBeNull();
    for (const el of root.querySelectorAll('*')) {
      for (const attr of el.attributes) {
        expect(attr.value, attr.name).not.toMatch(/javascript:|fixed/i);
      }
    }
  });

  it('strips script and handlers from raw HTML next to math', () => {
    const root = preview(
      '<img src=x onerror=alert(1)> $x$ <svg onload=alert(2)></svg>\n\n<a href="javascript:alert(3)">x</a>'
    );
    expect(root.querySelector('[onerror], [onload], script')).toBeNull();
    expect(root.innerHTML).not.toMatch(/javascript:/i);
  });

  it('removes elements that can restyle or cover the rest of the page', () => {
    const root = preview(
      [
        'x <style>body{display:none}</style>',
        '<svg><style>body{display:none}</style></svg>',
        '<form action="https://example.com"><input type="password"></form>',
        '<button popovertarget="p">x</button><div popover id="p">x</div>',
        '<dialog open>x</dialog>',
        '- [x] done',
      ].join('\n\n')
    );
    expect(root.querySelector('style, form, dialog, [popover]')).toBeNull();
    expect(root.querySelector('input[type="checkbox"]')).not.toBeNull();
  });

  it('keeps editor controls ahead of document ids with the same name', () => {
    preview('<div id="mdSettingsModal"></div><input id="mdOptHtml">');
    const modal = document.getElementById('mdSettingsModal');
    expect(modal?.classList.contains('md-editor-modal-overlay')).toBe(true);
    expect(
      document.getElementById('mdOptHtml')?.closest('#mdPreview')
    ).toBeNull();
  });
});

describe('Workflow Markdown renderer', () => {
  it('renders the shared extensions and leaves emoji and task markers as text', () => {
    const html = useMarkdownPlugins(new MarkdownIt({ linkify: true })).render(
      '[[toc]]\n\n## Notes\n\nH~2~O x^2^ ==m== ++i++ :smile:\n\n- [x] done\n\nTerm\n: def\n\nx[^1]\n\n[^1]: n\n\nsee example.com'
    );
    for (const tag of [
      '<sub>',
      '<sup>',
      '<mark>',
      '<ins>',
      '<dd>',
      'footnote',
      'table-of-contents',
      'href="http://example.com"',
    ]) {
      expect(html, tag).toContain(tag);
    }
    expect(html).toContain(':smile:');
    expect(html).toContain('[x] done');
  });
});
