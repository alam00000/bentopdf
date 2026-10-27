// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  anchorMap,
  brokenAnchors,
  quoteFrontmatter,
  removeGeneratedAnchors,
  translateAnchors,
  compareStructure,
  localizeLinks,
  summarize,
} from '../../scripts/docs-translations.mjs';

describe('localizeLinks', () => {
  it('prefixes absolute docs links with the language', () => {
    expect(localizeLinks('See [Docker](/self-hosting/docker#env).', 'de')).toBe(
      'See [Docker](/de/self-hosting/docker#env).'
    );
    expect(localizeLinks('[Tools](/tools/)', 'zh-TW')).toBe(
      '[Tools](/zh-TW/tools/)'
    );
  });

  it('leaves images, files, external links, anchors and relative links alone', () => {
    const text = [
      '![Logo](/images/logo.png)',
      '[PDF](/files/sample.pdf)',
      '[Site](https://www.bentopdf.com/licensing)',
      '[Mail](mailto:a@b.co)',
      '[Top](#top)',
      '[Next](./merge-pdf)',
      '[Up](../index)',
    ].join('\n');
    expect(localizeLinks(text, 'fr')).toBe(text);
  });

  it('does not touch code blocks and is safe to run twice', () => {
    const text = '```md\n[x](/tools/)\n```\n\n[ok](/tools/)';
    const once = localizeLinks(text, 'es');
    expect(once).toBe('```md\n[x](/tools/)\n```\n\n[ok](/es/tools/)');
    expect(localizeLinks(once, 'es')).toBe(once);
  });

  it('rewrites hero action links in frontmatter', () => {
    const text = '---\nhero:\n  actions:\n    - link: /getting-started\n---';
    expect(localizeLinks(text, 'ja')).toBe(
      '---\nhero:\n  actions:\n    - link: /ja/getting-started\n---'
    );
  });
});

describe('compareStructure', () => {
  const source = [
    '---',
    'title: Merge PDF',
    'description: Combine files.',
    '---',
    '',
    '# Merge PDF',
    '',
    'Read [the guide](/self-hosting/docker) first.',
    '',
    '```bash',
    'npm run build',
    '```',
    '',
    '| A | B |',
    '|---|---|',
    '| 1 | 2 |',
  ].join('\n');

  it('accepts a faithful translation', () => {
    const translated = [
      '---',
      'title: PDF zusammenführen',
      'description: Dateien kombinieren.',
      '---',
      '',
      '# PDF zusammenführen',
      '',
      'Lesen Sie zuerst [die Anleitung](/self-hosting/docker).',
      '',
      '```bash',
      'npm run build',
      '```',
      '',
      '| A | B |',
      '|---|---|',
      '| 1 | 2 |',
    ].join('\n');
    expect(compareStructure(source, translated, 'de')).toEqual([]);
  });

  it('flags changed code, links, headings and em dashes', () => {
    const translated = source
      .replace('npm run build', 'npm ausführen')
      .replace('/self-hosting/docker', '/other')
      .replace('# Merge PDF', '## Merge PDF')
      .replace('Read', 'Lesen —');
    const problems = compareStructure(source, translated, 'de');
    expect(problems).toContain('code blocks differ');
    expect(problems).toContain('link targets differ');
    expect(problems).toContain('heading levels differ');
    expect(problems).toContain('contains an em dash');
  });

  it('treats localized absolute links as equal to the English ones', () => {
    const translated = source.replace(
      '/self-hosting/docker',
      '/de/self-hosting/docker'
    );
    expect(compareStructure(source, translated, 'de')).not.toContain(
      'link targets differ'
    );
  });

  it('summarizes structure', () => {
    const summary = summarize(source);
    expect(summary.headings).toEqual([1]);
    expect(summary.fences).toHaveLength(1);
    expect(summary.tables).toEqual([3]);
    expect(summary.frontmatterKeys).toEqual(['title', 'description']);
  });
});

describe('anchors', () => {
  const source =
    '# Docker\n\n## Disabling Specific Tools\n\n### Disabling Specific Tools\n\n### 404 on Refresh\n\nSee [refresh](#_404-on-refresh) and [tools](/self-hosting/nginx#_502-bad-gateway).\n';
  const translated =
    '# Docker {#docker}\n\n## Werkzeuge deaktivieren {#disabling-specific-tools}\n\n### Werkzeuge deaktivieren\n\n### 404 beim Neuladen {#\\_404-on-refresh}\n\nSiehe [Neuladen](#_404-on-refresh) und [Werkzeuge](/de/self-hosting/nginx#_502-bad-gateway).\n';

  it('removes generated heading ids, including ones Prettier escaped', () => {
    const cleaned = removeGeneratedAnchors(source, translated);
    expect(cleaned).not.toContain('{#');
    expect(cleaned).toContain('### 404 beim Neuladen\n');
  });

  it('keeps explicit ids that the English page defines', () => {
    expect(
      removeGeneratedAnchors('## One {#custom}\n', '## Eins {#old}\n')
    ).toBe('## Eins {#custom}\n');
  });

  it('maps English heading ids to the translated ones, like VitePress', () => {
    const cleaned = removeGeneratedAnchors(source, translated);
    const { map } = anchorMap(source, cleaned);
    expect(map.get('disabling-specific-tools')).toBe('werkzeuge-deaktivieren');
    expect(map.get('disabling-specific-tools-1')).toBe(
      'werkzeuge-deaktivieren-1'
    );
    expect(map.get('_404-on-refresh')).toBe('_404-beim-neuladen');
  });

  it('rewrites anchor links on the same page and on other pages', () => {
    const cleaned = removeGeneratedAnchors(source, translated);
    const nginxSource = '## 502 Bad Gateway\n';
    const nginxTranslated = '## 502 Fehlerhaftes Gateway\n';
    const anchors = new Map([
      ['self-hosting/vercel.md', anchorMap(source, cleaned)],
      ['self-hosting/nginx.md', anchorMap(nginxSource, nginxTranslated)],
    ]);
    const result = translateAnchors(
      cleaned,
      'self-hosting/vercel.md',
      'de',
      anchors
    );
    expect(result).toContain('[Neuladen](#_404-beim-neuladen)');
    expect(result).toContain(
      '[Werkzeuge](/de/self-hosting/nginx#_502-fehlerhaftes-gateway)'
    );
    expect(
      translateAnchors(result, 'self-hosting/vercel.md', 'de', anchors)
    ).toBe(result);
    expect(
      brokenAnchors(result, 'self-hosting/vercel.md', 'de', anchors)
    ).toEqual([]);
    expect(
      brokenAnchors('[x](#missing)', 'self-hosting/vercel.md', 'de', anchors)
    ).toEqual(['#missing']);
  });

  it('builds ids the same way VitePress does for code and punctuation', () => {
    const { map } = anchorMap(
      '## Step 3b: Response Headers Policy (Required)\n\n## `ROBOTS_NOINDEX` flag\n',
      '## Schritt 3b: Antwort (Pflicht)\n\n## `ROBOTS_NOINDEX`-Schalter\n'
    );
    expect(map.get('step-3b-response-headers-policy-required')).toBe(
      'schritt-3b-antwort-pflicht'
    );
    expect(map.get('robots-noindex-flag')).toBe('robots-noindex-schalter');
  });
});

describe('quoteFrontmatter', () => {
  it('quotes values that YAML would misread and leaves the rest alone', () => {
    const input =
      '---\ntitle: Merge PDF\ndescription: Entfernen: Autor, Titel\nnote: "already quoted: yes"\n---\n# Body: text\n';
    expect(quoteFrontmatter(input)).toBe(
      '---\ntitle: Merge PDF\ndescription: "Entfernen: Autor, Titel"\nnote: "already quoted: yes"\n---\n# Body: text\n'
    );
    expect(quoteFrontmatter(quoteFrontmatter(input))).toBe(
      quoteFrontmatter(input)
    );
  });
});
