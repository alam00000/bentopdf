import { describe, expect, it } from 'vitest';

import { diffTextRuns } from '@/js/compare/engine/diff-text-runs.ts';
import {
  collectDocumentItems,
  buildDocumentResults,
  type DocumentPagePair,
} from '@/js/compare/engine/compare-document.ts';
import type {
  ComparePagePair,
  ComparePageModel,
  CompareTextItem,
} from '@/js/compare/types.ts';

function makeItem(id: string, text: string): CompareTextItem {
  return {
    id,
    text,
    normalizedText: text,
    rect: { x: 0, y: 50, width: 10, height: 10 },
  };
}

function makePage(pageNumber: number, words: string[]): ComparePageModel {
  const textItems = words.map((word, index) =>
    makeItem(`${pageNumber}-${index}`, word)
  );
  return {
    pageNumber,
    width: 100,
    height: 100,
    textItems,
    plainText: words.join(' '),
    hasText: words.length > 0,
    source: 'pdfjs',
  };
}

function makePair(
  pairIndex: number,
  leftPageNumber: number | null,
  rightPageNumber: number | null
): ComparePagePair {
  return { pairIndex, leftPageNumber, rightPageNumber, confidence: 1 };
}

function diffDocument(pages: DocumentPagePair[]) {
  const { beforeItems, afterItems } = collectDocumentItems(pages);
  return buildDocumentResults(pages, diffTextRuns(beforeItems, afterItems));
}

describe('buildDocumentResults', () => {
  it('does not flag content that merely reflows onto later pages', () => {
    const pages: DocumentPagePair[] = [
      {
        pair: makePair(0, 1, 1),
        left: makePage(1, ['alpha', 'bravo', 'charlie']),
        right: makePage(1, ['xray', 'alpha', 'bravo']),
      },
      {
        pair: makePair(1, 2, 2),
        left: makePage(2, ['delta', 'echo', 'foxtrot']),
        right: makePage(2, ['charlie', 'delta', 'echo']),
      },
      {
        pair: makePair(2, 3, 3),
        left: makePage(3, ['golf', 'hotel']),
        right: makePage(3, ['foxtrot', 'golf', 'hotel']),
      },
    ];

    const results = diffDocument(pages);

    expect(results.get(0)!.summary.added).toBe(1);
    expect(results.get(0)!.changes).toHaveLength(1);
    expect(results.get(0)!.changes[0].type).toBe('added');
    expect(results.get(0)!.changes[0].afterText).toBe('xray');

    expect(results.get(1)!.status).toBe('match');
    expect(results.get(1)!.changes).toHaveLength(0);
    expect(results.get(2)!.status).toBe('match');
    expect(results.get(2)!.changes).toHaveLength(0);
  });

  it('per-page diffing flags the same reflow as spurious changes', () => {
    const before = makePage(2, ['delta', 'echo', 'foxtrot']);
    const after = makePage(2, ['charlie', 'delta', 'echo']);

    const perPage = diffTextRuns(before.textItems, after.textItems);

    expect(perPage.changes.length).toBeGreaterThan(0);
  });

  it('attributes a change to the page its content lands on', () => {
    const pages: DocumentPagePair[] = [
      {
        pair: makePair(0, 1, 1),
        left: makePage(1, ['alpha', 'bravo']),
        right: makePage(1, ['alpha', 'bravo']),
      },
      {
        pair: makePair(1, 2, 2),
        left: makePage(2, ['charlie', 'delta']),
        right: makePage(2, ['charlie', 'inserted', 'delta']),
      },
    ];

    const results = diffDocument(pages);

    expect(results.get(0)!.status).toBe('match');
    expect(results.get(1)!.summary.added).toBe(1);
    expect(results.get(1)!.changes[0].afterText).toBe('inserted');
    expect(results.get(1)!.changes[0].afterPage).toBe(2);
  });

  it('splits a cross-page moved block onto both source and target pages', () => {
    const anchorOne =
      'aaa this is a long stable anchor line that stays put across both documents unchanged';
    const anchorTwo =
      'bbb another long stable anchor paragraph remaining in place unchanged across both documents entirely';
    const movable = 'movable trio words extra';

    const pages: DocumentPagePair[] = [
      {
        pair: makePair(0, 1, 1),
        left: makePage(1, [anchorOne, movable]),
        right: makePage(1, [anchorOne]),
      },
      {
        pair: makePair(1, 2, 2),
        left: makePage(2, [anchorTwo]),
        right: makePage(2, [anchorTwo, movable]),
      },
    ];

    const results = diffDocument(pages);

    const movedOnPage0 = results
      .get(0)!
      .changes.filter((c) => c.type === 'moved');
    const movedOnPage1 = results
      .get(1)!
      .changes.filter((c) => c.type === 'moved');

    expect(movedOnPage0).toHaveLength(1);
    expect(movedOnPage1).toHaveLength(1);

    const both = [...movedOnPage0, ...movedOnPage1];
    const source = both.find((c) => c.id.endsWith('-b'));
    const target = both.find((c) => c.id.endsWith('-a'));

    expect(source!.afterRects).toHaveLength(0);
    expect(target!.beforeRects).toHaveLength(0);
  });

  it('keeps the page-added marker for pages that exist only on one side', () => {
    const pages: DocumentPagePair[] = [
      {
        pair: makePair(0, 1, 1),
        left: makePage(1, ['alpha', 'bravo']),
        right: makePage(1, ['alpha', 'bravo']),
      },
      {
        pair: makePair(1, null, 2),
        left: null,
        right: makePage(2, ['brand', 'new', 'page']),
      },
    ];

    const results = diffDocument(pages);

    expect(results.get(1)!.status).toBe('right-only');
    expect(results.get(1)!.changes[0].type).toBe('page-added');
  });
});

describe('diffTextRuns page tagging', () => {
  it('populates beforePage and afterPage from tagged items', () => {
    const before: CompareTextItem[] = [
      { ...makeItem('a', 'hello'), pageNumber: 3 },
    ];
    const after: CompareTextItem[] = [
      { ...makeItem('a', 'hello'), pageNumber: 3 },
      { ...makeItem('b', 'world'), pageNumber: 3 },
    ];

    const result = diffTextRuns(before, after);

    expect(result.changes[0].type).toBe('added');
    expect(result.changes[0].afterPage).toBe(3);
  });

  it('leaves page fields undefined when items are untagged', () => {
    const result = diffTextRuns(
      [makeItem('a', 'hello')],
      [makeItem('a', 'hello'), makeItem('b', 'world')]
    );

    expect(result.changes[0].beforePage).toBeUndefined();
    expect(result.changes[0].afterPage).toBeUndefined();
  });
});

function placedItem(
  id: string,
  text: string,
  x: number,
  y: number,
  layer?: 'background'
): CompareTextItem {
  return {
    id,
    text,
    normalizedText: text,
    rect: { x, y, width: text.length * 6, height: 8 },
    layer,
  };
}

function furniturePage(
  pageNumber: number,
  bodyText: string,
  pageLabel: string
): ComparePageModel {
  return {
    pageNumber,
    width: 100,
    height: 100,
    textItems: [
      placedItem(`wm-${pageNumber}`, 'CONCEPT', 30, 45, 'background'),
      placedItem(`body-${pageNumber}`, bodyText, 40, 50),
      placedItem(`pn-${pageNumber}`, pageLabel, 48, 95),
    ],
    plainText: bodyText,
    hasText: true,
    source: 'pdfjs',
  };
}

describe('buildDocumentResults page-fixed content', () => {
  it('keeps the watermark and footer out of the reflow stream', () => {
    const pages: DocumentPagePair[] = [
      {
        pair: makePair(0, 1, 1),
        left: furniturePage(1, 'shared body line', '3'),
        right: furniturePage(1, 'shared body line', '3'),
      },
    ];

    const { beforeItems } = collectDocumentItems(pages);
    const streamText = beforeItems.map((item) => item.normalizedText);

    expect(streamText).toContain('shared body line');
    expect(streamText).not.toContain('CONCEPT');
    expect(streamText).not.toContain('3');
  });

  it('includes furniture in the flow when detection is disabled', () => {
    const pages: DocumentPagePair[] = [
      {
        pair: makePair(0, 1, 1),
        left: furniturePage(1, 'shared body line', '3'),
        right: furniturePage(1, 'shared body line', '3'),
      },
    ];

    const streamText = collectDocumentItems(pages, false).beforeItems.map(
      (item) => item.normalizedText
    );

    expect(streamText).toContain('CONCEPT');
    expect(streamText).toContain('3');
  });

  it('reports no change when body and furniture are identical', () => {
    const pages: DocumentPagePair[] = [
      {
        pair: makePair(0, 1, 1),
        left: furniturePage(1, 'shared body line', '3'),
        right: furniturePage(1, 'shared body line', '3'),
      },
    ];

    const results = diffDocument(pages);

    expect(results.get(0)!.status).toBe('match');
    expect(results.get(0)!.changes).toHaveLength(0);
  });

  it('still surfaces a real body edit while furniture stays silent', () => {
    const pages: DocumentPagePair[] = [
      {
        pair: makePair(0, 1, 1),
        left: furniturePage(1, 'body before edit', '3'),
        right: furniturePage(1, 'body after edit', '3'),
      },
    ];

    const results = diffDocument(pages);
    const changes = results.get(0)!.changes;

    expect(changes.length).toBeGreaterThan(0);
    expect(changes.every((c) => c.beforeText !== 'CONCEPT')).toBe(true);
  });

  it('surfaces a genuinely changed footer via the per-page fixed diff', () => {
    const pages: DocumentPagePair[] = [
      {
        pair: makePair(0, 1, 1),
        left: furniturePage(1, 'shared body line', '3'),
        right: furniturePage(1, 'shared body line', '4'),
      },
    ];

    const results = diffDocument(pages);
    const changes = results.get(0)!.changes;

    expect(
      changes.some((c) => c.beforeText === '3' && c.afterText === '4')
    ).toBe(true);
  });
});
