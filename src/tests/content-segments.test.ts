import { describe, it, expect } from 'vitest';
import {
  parseTranslation,
  processDocument,
  processPage,
  segmentId,
  validateTranslationPair,
} from '../../scripts/content-segments.mjs';

interface Collected {
  id: string;
  markup: string;
}

function parse(body: string, head = ''): Document {
  return new DOMParser().parseFromString(
    `<!doctype html><html><head>${head}</head><body>${body}</body></html>`,
    'text/html'
  );
}

function collect(document: Document): Collected[] {
  const found: Collected[] = [];
  processDocument(document, {
    record: (id: string, markup: string): void => {
      found.push({ id, markup });
    },
  });
  return found;
}

function translateWith(
  document: Document,
  dictionary: Record<string, string>
): { translated: number; invalid: string[] } {
  const ids = new Map<string, string>();
  collect(parse(document.body.innerHTML, document.head.innerHTML)).forEach(
    (entry) => ids.set(entry.markup, entry.id)
  );
  const byId: Record<string, string> = {};
  for (const [markup, translation] of Object.entries(dictionary)) {
    const id = ids.get(markup) ?? segmentId(markup);
    byId[id] = translation;
  }
  return processDocument(document, {
    translate: (id: string) => byId[id] ?? null,
  });
}

describe('content segments', () => {
  it('turns inline elements into numbered placeholders', () => {
    const doc = parse('<p>Read <a href="/docs">the docs</a> now.</p>');
    expect(collect(doc).map((entry) => entry.markup)).toEqual([
      'Read <1>the docs</1> now.',
    ]);
  });

  it('keeps links intact and allows word order to change', () => {
    const doc = parse(
      '<p>Read <a href="/docs" class="x">the docs</a> now.</p>'
    );
    const result = translateWith(doc, {
      'Read <1>the docs</1> now.': 'Jetzt <1>die Doku</1> lesen.',
    });
    expect(result.translated).toBe(1);
    expect(doc.body.innerHTML).toBe(
      '<p>Jetzt <a href="/docs" class="x">die Doku</a> lesen.</p>'
    );
  });

  it('treats code and icons as untouched placeholders', () => {
    const doc = parse(
      '<p>Use <code>qpdf --check</code> first <i data-lucide="check"></i></p>'
    );
    expect(collect(doc).map((entry) => entry.markup)).toEqual([
      'Use <1/> first <2/>',
    ]);
    translateWith(doc, { 'Use <1/> first <2/>': 'Zuerst <1/> nutzen <2/>' });
    expect(doc.body.innerHTML).toBe(
      '<p>Zuerst <code>qpdf --check</code> nutzen <i data-lucide="check"></i></p>'
    );
  });

  it('rejects a translation that loses a placeholder and keeps English', () => {
    const doc = parse('<p>Read <a href="/docs">the docs</a> now.</p>');
    const result = translateWith(doc, {
      'Read <1>the docs</1> now.': 'Jetzt die Doku lesen.',
    });
    expect(result.translated).toBe(0);
    expect(result.invalid).toHaveLength(1);
    expect(doc.body.innerHTML).toBe(
      '<p>Read <a href="/docs">the docs</a> now.</p>'
    );
  });

  it('rejects unbalanced or foreign tags', () => {
    const doc = parse('<p>One <b>two</b> three</p>');
    const elements = {
      1: doc.querySelector('b') as Element,
    };
    expect(parseTranslation('Eins <1>zwei</1> drei', elements)).not.toBeNull();
    expect(parseTranslation('Eins <1>zwei drei', elements)).toBeNull();
    expect(parseTranslation('Eins <2>zwei</2> drei', elements)).toBeNull();
    expect(parseTranslation('Eins <script>zwei</1> drei', elements)).toBeNull();
    expect(parseTranslation('Eins zwei drei', elements)).toBeNull();
  });

  it('peels a wrapper that covers the whole block', () => {
    const doc = parse('<ul><li><a href="/a">Merge PDF</a></li></ul>');
    expect(collect(doc).map((entry) => entry.markup)).toEqual(['Merge PDF']);
    translateWith(doc, { 'Merge PDF': 'PDF zusammenführen' });
    expect(doc.body.innerHTML).toBe(
      '<ul><li><a href="/a">PDF zusammenführen</a></li></ul>'
    );
  });

  it('translates alt, title, placeholder and aria-label', () => {
    const doc = parse(
      '<img alt="Company logo" src="/a.png"><input placeholder="Search tools" aria-label="Search box"><a href="/x" title="Open page">Go</a>'
    );
    translateWith(doc, {
      'Company logo': 'Firmenlogo',
      'Search tools': 'Werkzeuge suchen',
      'Search box': 'Suchfeld',
      'Open page': 'Seite öffnen',
    });
    expect(doc.querySelector('img')?.getAttribute('alt')).toBe('Firmenlogo');
    const input = doc.querySelector('input');
    expect(input?.getAttribute('placeholder')).toBe('Werkzeuge suchen');
    expect(input?.getAttribute('aria-label')).toBe('Suchfeld');
    expect(doc.querySelector('a')?.getAttribute('title')).toBe('Seite öffnen');
  });

  it('leaves elements that use data-i18n to the existing system', () => {
    const doc = parse(
      '<h1 data-i18n="tools:x.name">Merge PDF</h1><p>Hello <span data-i18n="a.b">World</span> there</p>'
    );
    const markups = collect(doc).map((entry) => entry.markup);
    expect(markups).toEqual(['Hello <1/> there']);
  });

  it('skips brand-only text and numbers', () => {
    const doc = parse(
      '<p>BentoPDF</p><p>PyMuPDF</p><p>2026</p><p>Kura Hyper Compress</p>'
    );
    expect(collect(doc)).toEqual([]);
  });

  it('does not change a document when there is no translation', () => {
    const html =
      '<h2>Title</h2><p>Some <b>bold</b> text, <a href="/x">link</a>.</p><button><svg></svg> Download</button>';
    const doc = parse(html);
    const before = doc.body.innerHTML;
    processDocument(doc, { translate: (): null => null });
    expect(doc.body.innerHTML).toBe(before);
  });

  it('translates title and meta descriptions', () => {
    const doc = parse(
      '<p>Body</p>',
      '<title>Merge PDF Online</title><meta name="description" content="Combine files.">'
    );
    translateWith(doc, {
      'Merge PDF Online': 'PDF online zusammenführen',
      'Combine files.': 'Dateien kombinieren.',
    });
    expect(doc.title).toBe('PDF online zusammenführen');
    expect(
      doc.querySelector('meta[name="description"]')?.getAttribute('content')
    ).toBe('Dateien kombinieren.');
  });

  it('only touches the navbar and footer on English-only pages', () => {
    const doc = parse(
      '<nav><a href="/">Home page</a></nav><main><p>Legal text here.</p></main><footer><p>Contact us</p></footer>',
      '<title>Terms</title>'
    );
    const found: string[] = [];
    processPage(doc, 'terms', {
      record: (_id: string, markup: string): void => {
        found.push(markup);
      },
    });
    expect(found).toEqual(['Home page', 'Contact us']);
  });

  it('rebuilds FAQ structured data from the translated page', () => {
    const doc = parse(
      '<details class="faq-d"><summary>Is it free?<i data-lucide="plus"></i></summary><p class="faq-d-a">Yes, always.</p></details><script type="application/ld+json">{"@type":"FAQPage","mainEntity":[]}</script>'
    );
    translateWith(doc, {
      'Is it free?<1/>': 'Ist es kostenlos?<1/>',
      'Yes, always.': 'Ja, immer.',
    });
    const data = JSON.parse(
      doc.querySelector('script[type="application/ld+json"]')?.textContent ??
        '{}'
    );
    expect(data.mainEntity[0].name).toBe('Ist es kostenlos?');
    expect(data.mainEntity[0].acceptedAnswer.text).toBe('Ja, immer.');
  });

  it('validates source and translation pairs', () => {
    expect(validateTranslationPair('A <1>b</1>', 'X <1>y</1>')).toBeNull();
    expect(validateTranslationPair('A <1>b</1>', 'X y')).toBe(
      'placeholders differ'
    );
    expect(validateTranslationPair('A', '')).toBe('empty');
    expect(validateTranslationPair('A', 'B <b>c</b>')).toBe(
      'contains raw angle brackets'
    );
  });

  it('keeps segment ids stable so stored translations stay valid', () => {
    expect(segmentId('How to deskew PDF online')).toBe('001b11bf2ae1');
    expect(segmentId('Merge PDF')).not.toBe(segmentId('Split PDF'));
  });

  it('rejects translations that nest markers differently or use unknown entities', () => {
    expect(
      validateTranslationPair('A <1>b <2>c</2></1>', 'X <1>y</1> <2>z</2>')
    ).toBe('placeholders nested differently');
    expect(validateTranslationPair('A <1>b</1>', 'X <1>y</1><2></2>')).toBe(
      'placeholders differ'
    );
    expect(validateTranslationPair('A <1>b</1>', 'X <1>y&hellip;</1>')).toBe(
      'unsupported entity &hellip;'
    );
    expect(validateTranslationPair('A &amp; B', 'X &amp; Y')).toBeNull();
    expect(validateTranslationPair('A <1/> b', '<1/> x')).toBeNull();
  });

  it('keeps translated markup-like text as plain text', () => {
    const doc = parse('<p>Hello <b>world</b></p>');
    translateWith(doc, {
      'Hello <1>world</1>': 'Hallo &lt;img onerror=alert(1)&gt; <1>Welt</1>',
    });
    expect(doc.querySelector('img')).toBeNull();
    expect(doc.querySelector('p')?.textContent).toBe(
      'Hallo <img onerror=alert(1)> Welt'
    );
  });

  it('uses the whole answer for FAQ structured data, not just the first paragraph', () => {
    const doc = parse(
      '<details class="faq-d"><summary>Why?</summary><p>Two reasons:</p><ul><li>One</li><li>Two</li></ul></details><script type="application/ld+json">{"@type":"FAQPage","mainEntity":[]}</script>'
    );
    translateWith(doc, {
      'Why?': 'Warum?',
      'Two reasons:': 'Zwei Gründe:',
      One: 'Eins',
      Two: 'Zwei',
    });
    const data = JSON.parse(
      doc.querySelector('script[type="application/ld+json"]')?.textContent ??
        '{}'
    );
    expect(data.mainEntity[0].acceptedAnswer.text).toBe(
      'Zwei Gründe: Eins Zwei'
    );
  });

  it('skips elements marked data-no-i18n', () => {
    const doc = parse(
      '<nav data-no-i18n aria-label="Breadcrumb"><a href="/">BentoPDF</a> Merge PDF</nav><p>Hello</p>'
    );
    expect(collect(doc).map((entry) => entry.markup)).toEqual(['Hello']);
  });
});
