import { describe, expect, it } from 'vitest';

import {
  classifyItemLayers,
  lineAngleDeg,
  angularDistanceDeg,
  itemPositionKey,
  repeatedItemKeys,
  type ItemLayerSignal,
} from '@/js/compare/engine/fixed-layer.ts';
import {
  mergeIntoLines,
  sortCompareTextItems,
} from '@/js/compare/engine/extract-page-model.ts';
import type { CompareTextItem } from '@/js/compare/types.ts';

function bodyItem(
  id: string,
  text: string,
  x: number,
  y: number
): CompareTextItem {
  return {
    id,
    text,
    normalizedText: text,
    rect: { x, y, width: text.length * 6, height: 10 },
  };
}

describe('classifyItemLayers', () => {
  it('flags an oversized glyph as background', () => {
    const signals: ItemLayerSignal[] = [
      { scale: 10, angleDeg: 0, insideArtifact: false },
      { scale: 10, angleDeg: 0, insideArtifact: false },
      { scale: 10, angleDeg: 0, insideArtifact: false },
      { scale: 40, angleDeg: 0, insideArtifact: false },
    ];
    expect(classifyItemLayers(signals)).toEqual([
      'body',
      'body',
      'body',
      'background',
    ]);
  });

  it('flags an off-axis glyph relative to the page dominant orientation', () => {
    const signals: ItemLayerSignal[] = [
      { scale: 10, angleDeg: 0, insideArtifact: false },
      { scale: 10, angleDeg: 0, insideArtifact: false },
      { scale: 10, angleDeg: 45, insideArtifact: false },
    ];
    expect(classifyItemLayers(signals)).toEqual(['body', 'body', 'background']);
  });

  it('measures orientation relative to a rotated page, not absolute zero', () => {
    const signals: ItemLayerSignal[] = [
      { scale: 10, angleDeg: 90, insideArtifact: false },
      { scale: 10, angleDeg: 90, insideArtifact: false },
      { scale: 10, angleDeg: 90, insideArtifact: false },
      { scale: 10, angleDeg: 45, insideArtifact: false },
    ];
    const result = classifyItemLayers(signals);
    expect(result.slice(0, 3)).toEqual(['body', 'body', 'body']);
    expect(result[3]).toBe('background');
  });

  it('keeps body glyphs whose angles straddle the 0/180 wrap boundary', () => {
    const signals: ItemLayerSignal[] = [
      { scale: 10, angleDeg: 0.5, insideArtifact: false },
      { scale: 10, angleDeg: 179.5, insideArtifact: false },
      { scale: 10, angleDeg: 0.3, insideArtifact: false },
      { scale: 10, angleDeg: 179.8, insideArtifact: false },
      { scale: 10, angleDeg: 90, insideArtifact: false },
    ];
    const result = classifyItemLayers(signals);
    expect(result.slice(0, 4)).toEqual(['body', 'body', 'body', 'body']);
    expect(result[4]).toBe('background');
  });

  it('flags marked-content artifacts regardless of geometry', () => {
    const signals: ItemLayerSignal[] = [
      { scale: 10, angleDeg: 0, insideArtifact: false },
      { scale: 10, angleDeg: 0, insideArtifact: true },
    ];
    expect(classifyItemLayers(signals)).toEqual(['body', 'background']);
  });

  it('excludes artifacts from the body median so they cannot skew it', () => {
    const signals: ItemLayerSignal[] = [
      { scale: 10, angleDeg: 0, insideArtifact: false },
      { scale: 10, angleDeg: 0, insideArtifact: false },
      { scale: 60, angleDeg: 0, insideArtifact: true },
      { scale: 30, angleDeg: 0, insideArtifact: false },
    ];
    expect(classifyItemLayers(signals)).toEqual([
      'body',
      'body',
      'background',
      'background',
    ]);
  });
});

describe('angle helpers', () => {
  it('normalizes radians to a [0,180) line orientation', () => {
    expect(lineAngleDeg(0)).toBeCloseTo(0);
    expect(lineAngleDeg(Math.PI)).toBeCloseTo(0);
    expect(lineAngleDeg(Math.PI / 4)).toBeCloseTo(45);
  });

  it('treats 170 and 10 degrees as 20 apart, not 160', () => {
    expect(angularDistanceDeg(170, 10)).toBeCloseTo(20);
  });
});

describe('body-only merge keeps watermark glyphs off body words', () => {
  it('does not glue a background glyph onto an adjacent body word', () => {
    const verpanden = bodyItem('a', 'verpanden', 0, 50);
    const watermarkT: CompareTextItem = {
      ...bodyItem('wm', 'T', 55, 48),
      layer: 'background',
    };

    const body = [verpanden];
    const merged = mergeIntoLines(sortCompareTextItems(body));

    expect(merged).toHaveLength(1);
    expect(merged[0].normalizedText).toBe('verpanden');

    const textItems = [...merged, watermarkT];
    expect(textItems.map((i) => i.normalizedText)).toEqual(['verpanden', 'T']);
  });
});

describe('repeatedItemKeys', () => {
  it('flags an element that recurs at the same position and text across pages', () => {
    const watermark = (page: number) => ({
      textItems: [
        bodyItem(`w-${page}`, 'CONCEPT', 100, 200),
        bodyItem(`b-${page}`, `unique body ${page}`, 40, 300),
      ],
    });
    const pages = [watermark(1), watermark(2), watermark(3), watermark(4)];

    const keys = repeatedItemKeys(pages);

    expect(keys.has(itemPositionKey(bodyItem('x', 'CONCEPT', 100, 200)))).toBe(
      true
    );
    expect(
      keys.has(itemPositionKey(bodyItem('x', 'unique body 1', 40, 300)))
    ).toBe(false);
  });

  it('does not flag body lines that merely share a y-grid across pages', () => {
    const page = (n: number) => ({
      textItems: [
        bodyItem(`l-${n}`, `line ${n} alpha`, 40, 100),
        bodyItem(`m-${n}`, `line ${n} beta`, 40, 120),
      ],
    });
    const keys = repeatedItemKeys([page(1), page(2), page(3), page(4)]);
    expect(keys.size).toBe(0);
  });
});
