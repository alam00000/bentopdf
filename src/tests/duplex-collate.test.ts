import { describe, expect, it } from 'vitest';
import { buildDuplexOrder } from '@/js/logic/duplex-collate-page';

describe('duplex collate order builder', () => {
  it('interleaves fronts with reversed backs for even page counts', () => {
    const result = buildDuplexOrder(8, 4, 'reverse');

    expect(result.frontCount).toBe(4);
    expect(result.backCount).toBe(4);
    expect(result.order).toEqual([0, 7, 1, 6, 2, 5, 3, 4]);
  });

  it('interleaves fronts with back block kept as-is', () => {
    const result = buildDuplexOrder(8, 4, 'keep');

    expect(result.frontCount).toBe(4);
    expect(result.backCount).toBe(4);
    expect(result.order).toEqual([0, 4, 1, 5, 2, 6, 3, 7]);
  });

  it('keeps all pages when front and back counts are uneven (odd total)', () => {
    const result = buildDuplexOrder(7, 4, 'reverse');

    expect(result.frontCount).toBe(4);
    expect(result.backCount).toBe(3);
    expect(result.order).toEqual([0, 6, 1, 5, 2, 4, 3]);
    expect(result.order).toHaveLength(7);
  });

  it('appends extra pages from longer back block after paired pages', () => {
    const result = buildDuplexOrder(8, 3, 'reverse');

    expect(result.frontCount).toBe(3);
    expect(result.backCount).toBe(5);
    expect(result.order).toEqual([0, 7, 1, 6, 2, 5, 4, 3]);
    expect(result.order).toHaveLength(8);
  });
});
