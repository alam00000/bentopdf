import { describe, expect, it } from 'vitest';

import { pairPages } from '@/js/compare/engine/pair-pages.ts';
import type { ComparePageSignature } from '@/js/compare/types.ts';

function signature(pageNumber: number, text: string): ComparePageSignature {
  return {
    pageNumber,
    plainText: text,
    hasText: text.length > 0,
    tokenItems: text
      .split(/\s+/)
      .filter(Boolean)
      .map((token, index) => ({
        id: `${pageNumber}-${index}`,
        text: token,
        normalizedText: token,
        rect: { x: 0, y: 0, width: 0, height: 0 },
      })),
  };
}

describe('pairPages', () => {
  it('pairs reordered and inserted pages without collapsing alignment', () => {
    const pairs = pairPages(
      [signature(1, 'alpha beta'), signature(2, 'gamma delta')],
      [
        signature(1, 'intro page'),
        signature(2, 'alpha beta'),
        signature(3, 'gamma delta'),
      ]
    );

    expect(pairs).toHaveLength(3);
    expect(pairs[0]).toMatchObject({
      leftPageNumber: null,
      rightPageNumber: 1,
    });
    expect(pairs[1]).toMatchObject({ leftPageNumber: 1, rightPageNumber: 2 });
    expect(pairs[2]).toMatchObject({ leftPageNumber: 2, rightPageNumber: 3 });
  });
});
