import { diffArrays } from 'diff';

import type {
  CharPosition,
  CompareChangeSummary,
  CompareRectangle,
  CompareTextChange,
  CompareTextItem,
  CompareWordToken,
} from '../types.ts';
import {
  calculateBoundingRect,
  containsCJK,
  segmentCJKText,
} from './text-normalization.ts';
import { COMPARE_GEOMETRY } from '../config.ts';

interface WordToken {
  word: string;
  compareWord: string;
  rect: CompareRectangle;
  fontName?: string;
  fontSize?: number;
}

function getCharMap(line: CompareTextItem): CharPosition[] {
  if (line.charMap && line.charMap.length === line.normalizedText.length) {
    return line.charMap;
  }
  const charWidth = line.rect.width / Math.max(line.normalizedText.length, 1);
  return Array.from({ length: line.normalizedText.length }, (_, i) => ({
    x: line.rect.x + i * charWidth,
    width: charWidth,
  }));
}

function splitLineIntoWords(line: CompareTextItem): WordToken[] {
  if (line.wordTokens && line.wordTokens.length > 0) {
    const baseTokens = line.wordTokens.map((token: CompareWordToken) => ({
      word: token.word,
      compareWord: token.compareWord,
      rect: token.rect,
      fontName: token.fontName,
      fontSize: token.fontSize,
    }));
    if (!containsCJK(line.normalizedText)) return baseTokens;
    return baseTokens.flatMap(splitCJKToken);
  }

  const words = line.normalizedText.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const charMap = getCharMap(line);
  let offset = 0;

  const baseTokens = words.map((word) => {
    const startIndex = line.normalizedText.indexOf(word, offset);
    const endIndex = startIndex + word.length - 1;
    offset = startIndex + word.length;

    const startChar = charMap[startIndex];
    const endChar = charMap[endIndex];

    if (!startChar || !endChar) {
      const charWidth =
        line.rect.width / Math.max(line.normalizedText.length, 1);
      return {
        word,
        compareWord: word.toLowerCase(),
        rect: {
          x: line.rect.x + startIndex * charWidth,
          y: line.rect.y,
          width: word.length * charWidth,
          height: line.rect.height,
        },
      };
    }

    const x = startChar.x;
    const w = endChar.x + endChar.width - startChar.x;

    return {
      word,
      compareWord: word.toLowerCase(),
      rect: { x, y: line.rect.y, width: w, height: line.rect.height },
    };
  });

  if (!containsCJK(line.normalizedText)) return baseTokens;
  return baseTokens.flatMap(splitCJKToken);
}

function splitCJKToken(token: WordToken): WordToken[] {
  if (!containsCJK(token.word)) return [token];

  const segments = segmentCJKText(token.word);
  if (segments.length <= 1) return [token];

  const totalLen = token.word.length;
  const charWidth = token.rect.width / Math.max(totalLen, 1);
  let charOffset = 0;

  return segments.map((seg) => {
    const x = token.rect.x + charOffset * charWidth;
    const width = seg.length * charWidth;
    charOffset += seg.length;
    return {
      word: seg,
      compareWord: seg.toLowerCase(),
      rect: { x, y: token.rect.y, width, height: token.rect.height },
    };
  });
}

function groupAdjacentRects(rects: CompareRectangle[]): CompareRectangle[] {
  if (rects.length === 0) return [];

  const sorted = [...rects].sort((a, b) => a.y - b.y || a.x - b.x);
  const groups: CompareRectangle[][] = [[sorted[0]]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = groups[groups.length - 1];
    const lastRect = prev[prev.length - 1];
    const curr = sorted[i];
    const sameLine =
      Math.abs(curr.y - lastRect.y) <
      Math.max(
        lastRect.height * COMPARE_GEOMETRY.LINE_TOLERANCE_FACTOR,
        COMPARE_GEOMETRY.MIN_LINE_TOLERANCE
      );
    const close = curr.x <= lastRect.x + lastRect.width + lastRect.height * 2;

    if (sameLine && close) {
      prev.push(curr);
    } else {
      groups.push([curr]);
    }
  }

  return groups.map((group) => calculateBoundingRect(group));
}

function collapseWords(words: WordToken[]) {
  return words.map((word) => word.compareWord).join('');
}

function areEquivalentIgnoringWordBreaks(
  beforeWords: WordToken[],
  afterWords: WordToken[]
) {
  if (beforeWords.length === 0 || afterWords.length === 0) {
    return false;
  }

  return collapseWords(beforeWords) === collapseWords(afterWords);
}

function createWordChange(
  changes: CompareTextChange[],
  type: CompareTextChange['type'],
  beforeWords: WordToken[],
  afterWords: WordToken[]
) {
  const beforeText = beforeWords.map((w) => w.word).join(' ');
  const afterText = afterWords.map((w) => w.word).join(' ');
  if (!beforeText && !afterText) return;

  const id = `${type}-${changes.length}`;
  const beforeRects = groupAdjacentRects(beforeWords.map((w) => w.rect));
  const afterRects = groupAdjacentRects(afterWords.map((w) => w.rect));

  if (type === 'modified') {
    changes.push({
      id,
      type,
      category: 'text',
      description: `Replaced "${beforeText}" with "${afterText}"`,
      beforeText,
      afterText,
      beforeRects,
      afterRects,
    });
  } else if (type === 'removed') {
    changes.push({
      id,
      type,
      category: 'text',
      description: `Removed "${beforeText}"`,
      beforeText,
      afterText: '',
      beforeRects,
      afterRects: [],
    });
  } else {
    changes.push({
      id,
      type,
      category: 'text',
      description: `Added "${afterText}"`,
      beforeText: '',
      afterText,
      beforeRects: [],
      afterRects,
    });
  }
}

function toSummary(changes: CompareTextChange[]): CompareChangeSummary {
  return changes.reduce(
    (summary, change) => {
      if (change.type === 'added') summary.added += 1;
      if (change.type === 'removed') summary.removed += 1;
      if (change.type === 'modified') summary.modified += 1;
      if (change.type === 'moved') summary.moved += 1;
      if (change.type === 'style-changed') summary.styleChanged += 1;
      return summary;
    },
    { added: 0, removed: 0, modified: 0, moved: 0, styleChanged: 0 }
  );
}

export function diffTextRuns(
  beforeItems: CompareTextItem[],
  afterItems: CompareTextItem[]
) {
  const beforeWords = beforeItems.flatMap(splitLineIntoWords);
  const afterWords = afterItems.flatMap(splitLineIntoWords);

  const rawChanges = diffArrays(
    beforeWords.map((w) => w.compareWord),
    afterWords.map((w) => w.compareWord)
  );

  const changes: CompareTextChange[] = [];
  let beforeIndex = 0;
  let afterIndex = 0;

  for (let i = 0; i < rawChanges.length; i++) {
    const change = rawChanges[i];
    const count = change.value.length;

    if (change.removed) {
      const removedTokens = beforeWords.slice(beforeIndex, beforeIndex + count);
      beforeIndex += count;

      const next = rawChanges[i + 1];
      if (next?.added) {
        const addedTokens = afterWords.slice(
          afterIndex,
          afterIndex + next.value.length
        );
        afterIndex += next.value.length;
        if (areEquivalentIgnoringWordBreaks(removedTokens, addedTokens)) {
          i++;
          continue;
        }
        createWordChange(changes, 'modified', removedTokens, addedTokens);
        i++;
      } else {
        createWordChange(changes, 'removed', removedTokens, []);
      }
      continue;
    }

    if (change.added) {
      const addedTokens = afterWords.slice(afterIndex, afterIndex + count);
      afterIndex += count;
      createWordChange(changes, 'added', [], addedTokens);
      continue;
    }

    beforeIndex += count;
    afterIndex += count;
  }

  detectStyleChanges(changes, beforeWords, afterWords, rawChanges);
  detectMovedText(changes);

  return { changes, summary: toSummary(changes) };
}

function normalizeFontName(name: string): string {
  return name.replace(/^g_d\d+_/, 'g_d_');
}

function hasStyleDifference(before: WordToken, after: WordToken): boolean {
  if (
    before.fontName &&
    after.fontName &&
    normalizeFontName(before.fontName) !== normalizeFontName(after.fontName)
  )
    return true;
  if (
    before.fontSize &&
    after.fontSize &&
    Math.abs(before.fontSize - after.fontSize) > 0.5
  )
    return true;
  return false;
}

function detectStyleChanges(
  changes: CompareTextChange[],
  beforeWords: WordToken[],
  afterWords: WordToken[],
  rawChanges: ReturnType<typeof diffArrays<string>>
) {
  interface StyleFragment {
    bFont: string;
    aFont: string;
    bSize: number | undefined;
    aSize: number | undefined;
    text: string;
    beforeRects: CompareRectangle[];
    afterRects: CompareRectangle[];
  }

  const fragments: StyleFragment[] = [];
  let beforeIdx = 0;
  let afterIdx = 0;

  for (const change of rawChanges) {
    const count = change.value.length;
    if (change.removed) {
      beforeIdx += count;
      continue;
    }
    if (change.added) {
      afterIdx += count;
      continue;
    }

    let styleRunStart = -1;
    for (let k = 0; k < count; k++) {
      const bw = beforeWords[beforeIdx + k];
      const aw = afterWords[afterIdx + k];
      const isDiff = hasStyleDifference(bw, aw);

      if (isDiff && styleRunStart < 0) {
        styleRunStart = k;
      }
      if ((!isDiff || k === count - 1) && styleRunStart >= 0) {
        const end = isDiff ? k + 1 : k;
        const bTokens = beforeWords.slice(
          beforeIdx + styleRunStart,
          beforeIdx + end
        );
        const aTokens = afterWords.slice(
          afterIdx + styleRunStart,
          afterIdx + end
        );
        fragments.push({
          bFont: bTokens[0].fontName ?? 'unknown',
          aFont: aTokens[0].fontName ?? 'unknown',
          bSize: bTokens[0].fontSize,
          aSize: aTokens[0].fontSize,
          text: bTokens.map((w) => w.word).join(' '),
          beforeRects: groupAdjacentRects(bTokens.map((w) => w.rect)),
          afterRects: groupAdjacentRects(aTokens.map((w) => w.rect)),
        });
        styleRunStart = -1;
      }
    }

    beforeIdx += count;
    afterIdx += count;
  }

  const groups = new Map<string, StyleFragment[]>();
  for (const frag of fragments) {
    const key = `${frag.bFont}→${frag.aFont}|${frag.bSize ?? ''}→${frag.aSize ?? ''}`;
    const arr = groups.get(key);
    if (arr) arr.push(frag);
    else groups.set(key, [frag]);
  }

  for (const groupFrags of groups.values()) {
    const bFont = groupFrags[0].bFont;
    const aFont = groupFrags[0].aFont;
    const bSize = groupFrags[0].bSize;
    const aSize = groupFrags[0].aSize;
    const allText = groupFrags.map((f) => f.text).join(' … ');
    const allBeforeRects = groupFrags.flatMap((f) => f.beforeRects);
    const allAfterRects = groupFrags.flatMap((f) => f.afterRects);

    let desc = `Style changed (${groupFrags.length} regions)`;
    const details: string[] = [];
    if (bFont !== aFont) details.push(`Font: ${bFont} → ${aFont}`);
    if (bSize && aSize && Math.abs(bSize - aSize) > 0.5)
      details.push(`Font size: ${bSize} → ${aSize}`);
    if (details.length) desc += '\n' + details.map((d) => `• ${d}`).join('\n');

    changes.push({
      id: `style-changed-${changes.length}`,
      type: 'style-changed',
      category: 'formatting',
      description: desc,
      beforeText: allText,
      afterText: allText,
      beforeRects: allBeforeRects,
      afterRects: allAfterRects,
    });
  }
}

const MOVE_MIN_WORDS = 3;
const MOVE_SIMILARITY_THRESHOLD = 0.8;

function normalizeForMove(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function moveSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (!a || !b) return 0;
  const aWords = a.split(' ');
  const bWords = b.split(' ');
  const bSet = new Set(bWords);
  let matches = 0;
  for (const w of aWords) {
    if (bSet.has(w)) matches++;
  }
  return matches / Math.max(aWords.length, bWords.length);
}

function detectMovedText(changes: CompareTextChange[]) {
  const removed = changes.filter((c) => c.type === 'removed');
  const added = changes.filter((c) => c.type === 'added');
  if (removed.length === 0 || added.length === 0) return;

  const matchedRemoved = new Set<string>();
  const matchedAdded = new Set<string>();

  for (const rem of removed) {
    const remNorm = normalizeForMove(rem.beforeText);
    const remWordCount = remNorm.split(' ').length;
    if (remWordCount < MOVE_MIN_WORDS) continue;

    let bestMatch: CompareTextChange | null = null;
    let bestScore = MOVE_SIMILARITY_THRESHOLD;

    for (const add of added) {
      if (matchedAdded.has(add.id)) continue;
      const addNorm = normalizeForMove(add.afterText);
      const score = moveSimilarity(remNorm, addNorm);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = add;
      }
    }

    if (bestMatch) {
      matchedRemoved.add(rem.id);
      matchedAdded.add(bestMatch.id);

      changes.push({
        id: `moved-${changes.length}`,
        type: 'moved',
        category: 'text',
        description: `Moved "${rem.beforeText.slice(0, 80)}"`,
        beforeText: rem.beforeText,
        afterText: bestMatch.afterText,
        beforeRects: rem.beforeRects,
        afterRects: bestMatch.afterRects,
      });
    }
  }

  for (let i = changes.length - 1; i >= 0; i--) {
    if (matchedRemoved.has(changes[i].id) || matchedAdded.has(changes[i].id)) {
      changes.splice(i, 1);
    }
  }
}
