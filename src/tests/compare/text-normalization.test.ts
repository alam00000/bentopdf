import { describe, expect, it } from 'vitest';

import {
  isLowQualityExtractedText,
  joinNormalizedText,
  normalizeCompareText,
} from '@/js/compare/engine/text-normalization.ts';

describe('text normalization', () => {
  it('joins punctuation without inserting stray spaces', () => {
    expect(joinNormalizedText(['Example', 'table', ':', 'v2'])).toBe(
      'Example table: v2'
    );
    expect(joinNormalizedText(['"', 'Quoted', 'text', '"'])).toBe(
      '"Quoted text"'
    );
  });

  it('normalizes private-use and control characters away', () => {
    expect(normalizeCompareText('A\u0000B\uE000C')).toBe('A B C');
  });

  it('flags punctuation-heavy extraction as low quality', () => {
    expect(isLowQualityExtractedText('! " # $ % & \'')).toBe(true);
    expect(isLowQualityExtractedText('Example table 2026 revision')).toBe(
      false
    );
  });
});
