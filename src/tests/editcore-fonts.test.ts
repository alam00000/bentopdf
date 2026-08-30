// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { loadEditCore } from './helpers/editcore-harness';
import { needsFontEmbedding, SCRIPT_FONTS } from '@/js/utils/freetext-script';
import { hexToRgba } from '@/js/utils/freetext-flatten';

const SCRIPT_SAMPLES: Array<[string, number]> = [
  ['Arabic', 0x0627],
  ['Hebrew', 0x05d0],
  ['Devanagari', 0x0915],
  ['Bengali', 0x0985],
  ['Gurmukhi', 0x0a15],
  ['Gujarati', 0x0a95],
  ['Oriya', 0x0b15],
  ['Tamil', 0x0b95],
  ['Telugu', 0x0c15],
  ['Kannada', 0x0c95],
  ['Malayalam', 0x0d15],
  ['Sinhala', 0x0d85],
  ['Thai', 0x0e01],
  ['Lao', 0x0e81],
  ['Myanmar', 0x1000],
  ['Khmer', 0x1780],
  ['Georgian', 0x10a0],
  ['Armenian', 0x0531],
  ['Ethiopic', 0x1200],
  ['Han', 0x4e00],
  ['Hiragana', 0x3042],
  ['Hangul', 0xac00],
];

describe('script fallback resolution', () => {
  let scriptFallbackFamilies: (cps: number[]) => string[];
  let sfntCovers: (bytes: Uint8Array, cps: number[]) => boolean;

  beforeAll(async () => {
    const mod = await loadEditCore();
    scriptFallbackFamilies = mod.scriptFallbackFamilies;
    sfntCovers = (
      mod as unknown as {
        sfntCovers: (bytes: Uint8Array, cps: number[]) => boolean;
      }
    ).sfntCovers;
  });

  it.each(SCRIPT_SAMPLES)(
    'offers at least one fallback family for %s',
    (_name, codepoint) => {
      const families = scriptFallbackFamilies([codepoint]);
      expect(families.length).toBeGreaterThan(0);
      for (const f of families) expect(typeof f).toBe('string');
    }
  );

  it('leaves Latin, Greek and Cyrillic to the base fonts', () => {
    for (const cp of [0x0041, 0x03b1, 0x0410]) {
      expect(scriptFallbackFamilies([cp])).toEqual([]);
    }
  });

  it('returns families for every script present in a mixed run', () => {
    const arabic = scriptFallbackFamilies([0x0627]);
    const thai = scriptFallbackFamilies([0x0e01]);
    const mixed = scriptFallbackFamilies([0x0627, 0x0e01]);
    expect(mixed).toEqual(expect.arrayContaining([arabic[0], thai[0]]));
  });

  it('never repeats a family in one result', () => {
    const all = scriptFallbackFamilies(SCRIPT_SAMPLES.map(([, cp]) => cp));
    expect(new Set(all).size).toBe(all.length);
  });

  it('returns nothing for an empty codepoint list', () => {
    expect(scriptFallbackFamilies([])).toEqual([]);
  });

  it('reports no coverage for bytes that are not a font', () => {
    expect(sfntCovers(new Uint8Array([1, 2, 3, 4]), [0x41])).toBe(false);
    expect(sfntCovers(new Uint8Array(0), [0x41])).toBe(false);
  });
});

describe('freetext script detection', () => {
  it('treats plain WinAnsi text as needing no embedded font', () => {
    for (const t of ['Hello world', 'Prix: 12,50 €', 'naïve café', '']) {
      expect(needsFontEmbedding(t)).toBe(false);
    }
  });

  it('flags text outside WinAnsi as needing an embedded font', () => {
    for (const t of [
      'السلام عليكم',
      'नमस्ते',
      '你好',
      'こんにちは',
      '한국어',
      'สวัสดี',
    ]) {
      expect(needsFontEmbedding(t)).toBe(true);
    }
  });

  it('flags a single non-Latin character inside otherwise Latin text', () => {
    expect(needsFontEmbedding('Total 合計 100')).toBe(true);
  });

  it('lists at least one candidate font for every script entry', () => {
    for (const [pattern, fonts] of SCRIPT_FONTS) {
      expect(fonts.length, `no fonts for ${pattern}`).toBeGreaterThan(0);
      expect(new Set(fonts).size).toBe(fonts.length);
    }
  });
});

describe('freetext colour conversion', () => {
  it('converts hex colours to packed rgba', () => {
    expect(hexToRgba('#000000')).toBe(0x000000ff);
    expect(hexToRgba('#ffffff')).toBe(0xffffffff);
    expect(hexToRgba('#ff0000')).toBe(0xff0000ff);
    expect(hexToRgba('00ff00')).toBe(0x00ff00ff);
  });

  it('falls back to opaque black for unusable input', () => {
    expect(hexToRgba('')).toBe(0x000000ff);
    expect(hexToRgba('not-a-colour')).toBe(0x000000ff);
    expect(hexToRgba('#fff')).toBe(0x000000ff);
  });
});
