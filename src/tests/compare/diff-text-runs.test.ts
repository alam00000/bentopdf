import { describe, expect, it } from 'vitest';

import { comparePageModels } from '@/js/compare/engine/compare-page-models.ts';
import { diffTextRuns } from '@/js/compare/engine/diff-text-runs.ts';
import {
  mergeIntoLines,
  sortCompareTextItems,
} from '@/js/compare/engine/extract-page-model.ts';
import type {
  CompareAnnotation,
  ComparePageModel,
  CompareTextItem,
  CompareWordToken,
} from '@/js/compare/types.ts';

function makeItem(id: string, text: string): CompareTextItem {
  return {
    id,
    text,
    normalizedText: text,
    rect: { x: 0, y: 0, width: 10, height: 10 },
  };
}

function makePage(
  pageNumber: number,
  textItems: CompareTextItem[],
  overrides: Partial<ComparePageModel> = {}
): ComparePageModel {
  return {
    pageNumber,
    width: 100,
    height: 100,
    textItems,
    plainText: textItems.map((item) => item.normalizedText).join(' '),
    hasText: textItems.length > 0,
    source: 'pdfjs',
    ...overrides,
  };
}

function makeAnnotation(
  subtype: string,
  overrides: Partial<CompareAnnotation> = {}
): CompareAnnotation {
  return {
    id: `${subtype}-1`,
    subtype,
    rect: { x: 0, y: 0, width: 10, height: 10 },
    contents: '',
    title: '',
    color: '',
    ...overrides,
  };
}

describe('diffTextRuns', () => {
  it('detects modified tokens as one change', () => {
    const result = diffTextRuns(
      [makeItem('a', 'Hello'), makeItem('b', 'world')],
      [makeItem('a', 'Hello'), makeItem('c', 'there')]
    );

    expect(result.summary).toEqual({
      added: 0,
      removed: 0,
      modified: 1,
      moved: 0,
      styleChanged: 0,
    });
    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].type).toBe('modified');
    expect(result.changes[0].beforeText).toBe('world');
    expect(result.changes[0].afterText).toBe('there');
  });

  it('detects added tokens', () => {
    const result = diffTextRuns(
      [makeItem('a', 'Hello')],
      [makeItem('a', 'Hello'), makeItem('b', 'again')]
    );

    expect(result.summary).toEqual({
      added: 1,
      removed: 0,
      modified: 0,
      moved: 0,
      styleChanged: 0,
    });
    expect(result.changes[0].type).toBe('added');
  });

  it('splits compound replacements into discrete changes', () => {
    const result = diffTextRuns(
      [
        makeItem('a', 'This'),
        makeItem('b', 'is'),
        makeItem('c', 'an'),
        makeItem('d', 'example'),
        makeItem('e', 'of'),
        makeItem('f', 'a'),
        makeItem('g', 'data'),
        makeItem('h', 'table'),
        makeItem('i', 'new.'),
        makeItem('j', 'Disabilit'),
      ],
      [
        makeItem('k', 'Example'),
        makeItem('l', 'table'),
        makeItem('m', 'This'),
        makeItem('n', 'is'),
        makeItem('o', 'an'),
        makeItem('p', 'example'),
        makeItem('q', 'of'),
        makeItem('r', 'a'),
        makeItem('s', 'data'),
        makeItem('t', 'table.'),
        makeItem('u', 'Disability'),
      ]
    );

    expect(result.changes).toHaveLength(2);
    expect(result.summary).toEqual({
      added: 1,
      removed: 0,
      modified: 1,
      moved: 0,
      styleChanged: 0,
    });
    expect(
      result.changes.some(
        (change) =>
          change.type === 'added' && change.afterText === 'Example table'
      )
    ).toBe(true);
    expect(
      result.changes.some(
        (change) =>
          change.type === 'modified' &&
          change.beforeText === 'table new. Disabilit' &&
          change.afterText === 'table. Disability'
      )
    ).toBe(true);
  });
});

describe('comparePageModels', () => {
  it('marks pages missing from the second document', () => {
    const result = comparePageModels(
      makePage(3, [makeItem('a', 'Only')]),
      null
    );

    expect(result.status).toBe('left-only');
    expect(result.summary.removed).toBe(1);
    expect(result.changes[0].type).toBe('page-removed');
  });

  it('ignores empty highlight annotations in annotation diff output', () => {
    const result = comparePageModels(
      makePage(1, [makeItem('a', 'Original')], {
        annotations: [makeAnnotation('Highlight')],
      }),
      makePage(1, [makeItem('b', 'Updated')], {
        annotations: [makeAnnotation('Highlight', { id: 'highlight-2' })],
      })
    );

    expect(
      result.changes.some(
        (change) =>
          change.category === 'annotation' &&
          change.description.includes('Highlight annotation')
      )
    ).toBe(false);
  });
});

describe('sortCompareTextItems', () => {
  it('orders tokens by reading order', () => {
    const items: CompareTextItem[] = [
      {
        ...makeItem('b', 'Body'),
        rect: { x: 60, y: 40, width: 10, height: 10 },
      },
      {
        ...makeItem('a', 'Title'),
        rect: { x: 10, y: 10, width: 10, height: 10 },
      },
      {
        ...makeItem('c', 'Next'),
        rect: { x: 10, y: 40, width: 10, height: 10 },
      },
    ];

    expect(
      sortCompareTextItems(items).map((item) => item.normalizedText)
    ).toEqual(['Title', 'Next', 'Body']);
  });
});

describe('mergeIntoLines', () => {
  it('merges items on the same Y-line into one item', () => {
    const items: CompareTextItem[] = [
      {
        id: '0',
        text: 'Hello',
        normalizedText: 'Hello',
        rect: { x: 0, y: 10, width: 50, height: 12 },
      },
      {
        id: '1',
        text: 'World',
        normalizedText: 'World',
        rect: { x: 60, y: 10, width: 50, height: 12 },
      },
    ];
    const merged = mergeIntoLines(sortCompareTextItems(items));

    expect(merged).toHaveLength(1);
    expect(merged[0].normalizedText).toBe('Hello World');
    expect(merged[0].rect.x).toBe(0);
    expect(merged[0].rect.width).toBe(110);
  });

  it('does not insert spaces inside a split word', () => {
    const items: CompareTextItem[] = [
      {
        id: '0',
        text: 'sam',
        normalizedText: 'sam',
        rect: { x: 0, y: 10, width: 24, height: 12 },
      },
      {
        id: '1',
        text: 'e',
        normalizedText: 'e',
        rect: { x: 24.4, y: 10, width: 8, height: 12 },
      },
    ];

    const merged = mergeIntoLines(sortCompareTextItems(items));

    expect(merged).toHaveLength(1);
    expect(merged[0].normalizedText).toBe('same');
  });

  it('keeps items on different Y-lines separate', () => {
    const items: CompareTextItem[] = [
      {
        id: '0',
        text: 'Line 1',
        normalizedText: 'Line 1',
        rect: { x: 0, y: 10, width: 50, height: 12 },
      },
      {
        id: '1',
        text: 'Line 2',
        normalizedText: 'Line 2',
        rect: { x: 0, y: 30, width: 50, height: 12 },
      },
    ];
    const merged = mergeIntoLines(sortCompareTextItems(items));

    expect(merged).toHaveLength(2);
    expect(merged[0].normalizedText).toBe('Line 1');
    expect(merged[1].normalizedText).toBe('Line 2');
  });

  it('produces same result for different text run boundaries', () => {
    const pdf1Items: CompareTextItem[] = [
      {
        id: '0',
        text: 'Hello World',
        normalizedText: 'Hello World',
        rect: { x: 0, y: 10, width: 100, height: 12 },
      },
    ];
    const pdf2Items: CompareTextItem[] = [
      {
        id: '0',
        text: 'Hello',
        normalizedText: 'Hello',
        rect: { x: 0, y: 10, width: 45, height: 12 },
      },
      {
        id: '1',
        text: 'World',
        normalizedText: 'World',
        rect: { x: 55, y: 10, width: 45, height: 12 },
      },
    ];

    const merged1 = mergeIntoLines(sortCompareTextItems(pdf1Items));
    const merged2 = mergeIntoLines(sortCompareTextItems(pdf2Items));

    expect(merged1[0].normalizedText).toBe(merged2[0].normalizedText);

    const result = diffTextRuns(merged1, merged2);
    expect(result.changes).toHaveLength(0);
  });

  it('detects actual changes after merging', () => {
    const pdf1Items: CompareTextItem[] = [
      {
        id: '0',
        text: 'Sample',
        normalizedText: 'Sample',
        rect: { x: 0, y: 10, width: 60, height: 14 },
      },
      {
        id: '1',
        text: 'page text here',
        normalizedText: 'page text here',
        rect: { x: 0, y: 30, width: 120, height: 14 },
      },
    ];
    const pdf2Items: CompareTextItem[] = [
      {
        id: '0',
        text: 'Sample',
        normalizedText: 'Sample',
        rect: { x: 0, y: 10, width: 45, height: 14 },
      },
      {
        id: '1',
        text: 'PDF',
        normalizedText: 'PDF',
        rect: { x: 55, y: 10, width: 30, height: 14 },
      },
      {
        id: '2',
        text: 'pages text here',
        normalizedText: 'pages text here',
        rect: { x: 0, y: 30, width: 125, height: 14 },
      },
    ];

    const merged1 = mergeIntoLines(sortCompareTextItems(pdf1Items));
    const merged2 = mergeIntoLines(sortCompareTextItems(pdf2Items));

    expect(merged1).toHaveLength(2);
    expect(merged2).toHaveLength(2);

    const result = diffTextRuns(merged1, merged2);
    expect(result.summary.modified).toBe(1);
    expect(result.summary.added).toBe(0);
    expect(result.summary.removed).toBe(0);
    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].beforeText).toBe('page');
    expect(result.changes[0].afterText).toBe('PDF pages');
  });

  it('preserves original casing in change descriptions', () => {
    const result = diffTextRuns(
      [makeItem('a', 'Sample')],
      [makeItem('b', 'Sample PDF')]
    );

    expect(result.changes[0].afterText).toBe('PDF');
  });

  it('ignores joined versus split words when collapsed text matches', () => {
    const result = diffTextRuns(
      [makeItem('a', 'non'), makeItem('b', 'tincidunt')],
      [makeItem('c', 'nontincidunt')]
    );

    expect(result.changes).toHaveLength(0);
    expect(result.summary).toEqual({
      added: 0,
      removed: 0,
      modified: 0,
      moved: 0,
      styleChanged: 0,
    });
  });
});

function makeItemWithTokens(
  id: string,
  text: string,
  fontName?: string,
  fontSize?: number
): CompareTextItem {
  const words = text.split(/\s+/).filter(Boolean);
  const charWidth = 10 / Math.max(text.length, 1);
  let offset = 0;
  const wordTokens: CompareWordToken[] = words.map((w) => {
    const startIndex = text.indexOf(w, offset);
    offset = startIndex + w.length;
    return {
      word: w,
      compareWord: w.toLowerCase(),
      rect: {
        x: startIndex * charWidth,
        y: 0,
        width: w.length * charWidth,
        height: 10,
      },
      fontName,
      fontSize,
    };
  });
  return {
    id,
    text,
    normalizedText: text,
    rect: { x: 0, y: 0, width: 10, height: 10 },
    wordTokens,
  };
}

describe('detectStyleChanges', () => {
  it('detects font name change on identical text', () => {
    const result = diffTextRuns(
      [makeItemWithTokens('a', 'Hello world test', 'Arial', 12)],
      [makeItemWithTokens('b', 'Hello world test', 'Times', 12)]
    );

    expect(result.summary.styleChanged).toBe(1);
    expect(result.changes.some((c) => c.type === 'style-changed')).toBe(true);
  });

  it('detects font size change on identical text', () => {
    const result = diffTextRuns(
      [makeItemWithTokens('a', 'Hello world test', 'Arial', 12)],
      [makeItemWithTokens('b', 'Hello world test', 'Arial', 16)]
    );

    expect(result.summary.styleChanged).toBe(1);
    const sc = result.changes.find((c) => c.type === 'style-changed')!;
    expect(sc.beforeText).toBe('Hello world test');
  });

  it('ignores negligible font size difference', () => {
    const result = diffTextRuns(
      [makeItemWithTokens('a', 'Same text here', 'Arial', 12)],
      [makeItemWithTokens('b', 'Same text here', 'Arial', 12.3)]
    );

    expect(result.summary.styleChanged).toBe(0);
  });

  it('reports no style change when fonts match', () => {
    const result = diffTextRuns(
      [makeItemWithTokens('a', 'Identical font', 'Arial', 12)],
      [makeItemWithTokens('b', 'Identical font', 'Arial', 12)]
    );

    expect(result.changes).toHaveLength(0);
    expect(result.summary.styleChanged).toBe(0);
  });

  it('ignores pdfjs document-scoped font name prefixes', () => {
    const result = diffTextRuns(
      [makeItemWithTokens('a', 'Same font here', 'g_d0_f3', 12)],
      [makeItemWithTokens('b', 'Same font here', 'g_d1_f3', 12)]
    );

    expect(result.changes).toHaveLength(0);
    expect(result.summary.styleChanged).toBe(0);
  });
});

describe('detectMovedText', () => {
  it('detects moved text block with identical words', () => {
    const result = diffTextRuns(
      [
        makeItem('a', 'Introduction to the topic'),
        makeItem('b', 'Another paragraph here'),
      ],
      [
        makeItem('c', 'Another paragraph here'),
        makeItem('d', 'Introduction to the topic'),
      ]
    );

    expect(result.summary.moved).toBeGreaterThanOrEqual(1);
    expect(result.changes.some((c) => c.type === 'moved')).toBe(true);
    expect(result.changes.some((c) => c.type === 'removed')).toBe(false);
    expect(result.changes.some((c) => c.type === 'added')).toBe(false);
  });

  it('does not detect move for short text', () => {
    const result = diffTextRuns(
      [makeItem('a', 'Hi'), makeItem('b', 'World')],
      [makeItem('c', 'World'), makeItem('d', 'Hi')]
    );

    expect(result.summary.moved).toBe(0);
  });

  it('does not detect move when text is dissimilar', () => {
    const result = diffTextRuns(
      [makeItem('a', 'This is the first paragraph with details')],
      [makeItem('b', 'Completely different content and wording here')]
    );

    expect(result.summary.moved).toBe(0);
  });
});

describe('CJK segmentation in diffTextRuns', () => {
  it('segments Chinese text into words', () => {
    const result = diffTextRuns(
      [makeItem('a', '日本語テストです')],
      [makeItem('b', '日本語テストでした')]
    );

    expect(result.changes.length).toBeGreaterThan(0);
    expect(result.summary.modified).toBeGreaterThanOrEqual(1);
  });

  it('reports no changes for identical CJK text', () => {
    const result = diffTextRuns(
      [makeItem('a', '日本語テストです')],
      [makeItem('b', '日本語テストです')]
    );

    expect(result.changes).toHaveLength(0);
  });
});

describe('content categories', () => {
  it('assigns text category to added/removed/modified changes', () => {
    const result = diffTextRuns(
      [makeItem('a', 'Hello world')],
      [makeItem('b', 'Hello there')]
    );

    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].category).toBe('text');
  });

  it('assigns formatting category to style-changed changes', () => {
    const result = diffTextRuns(
      [makeItemWithTokens('a', 'Hello world test', 'Arial', 12)],
      [makeItemWithTokens('b', 'Hello world test', 'Times', 12)]
    );

    const styleChange = result.changes.find((c) => c.type === 'style-changed');
    expect(styleChange).toBeDefined();
    expect(styleChange!.category).toBe('formatting');
  });

  it('assigns text category to moved changes', () => {
    const result = diffTextRuns(
      [
        makeItem('a', 'Introduction to the topic'),
        makeItem('b', 'Another paragraph here'),
      ],
      [
        makeItem('c', 'Another paragraph here'),
        makeItem('d', 'Introduction to the topic'),
      ]
    );

    const movedChange = result.changes.find((c) => c.type === 'moved');
    expect(movedChange).toBeDefined();
    expect(movedChange!.category).toBe('text');
  });

  it('includes categorySummary on page comparison result', () => {
    const result = comparePageModels(
      makePage(1, [makeItem('a', 'Hello')]),
      makePage(1, [makeItem('b', 'World')])
    );

    expect(result.categorySummary).toBeDefined();
    const total = Object.values(result.categorySummary).reduce(
      (a, b) => a + b,
      0
    );
    expect(total).toBeGreaterThanOrEqual(1);
  });

  it('assigns text category to page-removed changes', () => {
    const result = comparePageModels(
      makePage(1, [makeItem('a', 'Only')]),
      null
    );

    expect(result.changes[0].category).toBe('text');
    expect(result.categorySummary.text).toBe(1);
  });
});
