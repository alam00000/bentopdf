import type { CompareRectangle, CompareTextItem } from '../types.ts';

export function normalizeCompareText(text: string) {
  return text
    .normalize('NFKC')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
    .replace(/[\u{E000}-\u{F8FF}]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function shouldAppendWithoutSpace(current: string, next: string) {
  if (!current) return true;
  if (/^[,.;:!?%)\]}]/.test(next)) return true;
  if (/^["']$/.test(next)) return true;
  if (/^['’”]/u.test(next)) return true;
  if (/[([{/"'“‘-]$/u.test(current)) return true;
  return false;
}

export function joinNormalizedText(tokens: string[]) {
  return tokens.reduce((result, token) => {
    if (!token) return result;
    if (shouldAppendWithoutSpace(result, token)) {
      return `${result}${token}`;
    }
    return `${result} ${token}`;
  }, '');
}

export function joinCompareTextItems(items: CompareTextItem[]) {
  return joinNormalizedText(items.map((item) => item.normalizedText));
}

export function isLowQualityExtractedText(text: string) {
  const normalized = normalizeCompareText(text);
  if (!normalized) return true;

  const tokens = normalized.split(/\s+/).filter(Boolean);
  const visibleCharacters = Array.from(normalized).filter(
    (character) => character.trim().length > 0
  );
  const alphaNumericCount = visibleCharacters.filter((character) =>
    /[\p{L}\p{N}]/u.test(character)
  ).length;
  const symbolCount = visibleCharacters.length - alphaNumericCount;
  const tokenWithAlphaNumericCount = tokens.filter((token) =>
    /[\p{L}\p{N}]/u.test(token)
  ).length;

  if (alphaNumericCount === 0) return true;
  if (
    visibleCharacters.length >= 12 &&
    alphaNumericCount / visibleCharacters.length < 0.45 &&
    symbolCount / visibleCharacters.length > 0.35
  ) {
    return true;
  }
  if (tokens.length >= 6 && tokenWithAlphaNumericCount / tokens.length < 0.6) {
    return true;
  }

  return false;
}

export function tokenizeText(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

export function tokenizeTextAsSet(text: string): Set<string> {
  return new Set(tokenizeText(text));
}

const CJK_REGEX =
  /[\u2E80-\u9FFF\uF900-\uFAFF\uFE30-\uFE4F\u{20000}-\u{2FA1F}]/u;

export function containsCJK(text: string): boolean {
  return CJK_REGEX.test(text);
}

let cachedSegmenter: Intl.Segmenter | null = null;

function getWordSegmenter(): Intl.Segmenter | null {
  if (cachedSegmenter) return cachedSegmenter;
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    cachedSegmenter = new Intl.Segmenter(undefined, { granularity: 'word' });
    return cachedSegmenter;
  }
  return null;
}

export function segmentCJKText(text: string): string[] {
  const segmenter = getWordSegmenter();
  if (!segmenter) return [text];
  return [...segmenter.segment(text)]
    .filter((seg) => seg.isWordLike)
    .map((seg) => seg.segment);
}

export function calculateBoundingRect(
  rects: CompareRectangle[]
): CompareRectangle {
  if (rects.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  const minX = Math.min(...rects.map((r) => r.x));
  const minY = Math.min(...rects.map((r) => r.y));
  const maxX = Math.max(...rects.map((r) => r.x + r.width));
  const maxY = Math.max(...rects.map((r) => r.y + r.height));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
