import type { ComparePagePair, ComparePageSignature } from '../types.ts';
import { tokenizeTextAsSet } from './text-normalization.ts';

function similarityScore(
  left: ComparePageSignature,
  right: ComparePageSignature
) {
  if (!left.hasText && !right.hasText) {
    return left.pageNumber === right.pageNumber ? 0.7 : 0.35;
  }

  if (!left.hasText || !right.hasText) {
    return 0.08;
  }

  const leftTokens = tokenizeTextAsSet(left.plainText);
  const rightTokens = tokenizeTextAsSet(right.plainText);
  const union = new Set([...leftTokens, ...rightTokens]);
  let intersectionCount = 0;

  leftTokens.forEach((token) => {
    if (rightTokens.has(token)) intersectionCount += 1;
  });

  const jaccard = union.size === 0 ? 0 : intersectionCount / union.size;
  const positionalBias = left.pageNumber === right.pageNumber ? 0.1 : 0;
  return Math.min(jaccard + positionalBias, 1);
}

export function pairPages(
  leftPages: ComparePageSignature[],
  rightPages: ComparePageSignature[]
) {
  const insertionCost = 0.8;
  const rowCount = leftPages.length + 1;
  const colCount = rightPages.length + 1;
  const dp = Array.from({ length: rowCount }, () =>
    Array<number>(colCount).fill(0)
  );
  const backtrack = Array.from({ length: rowCount }, () =>
    Array<'match' | 'left' | 'right'>(colCount).fill('match')
  );

  for (let i = 1; i < rowCount; i += 1) {
    dp[i][0] = i * insertionCost;
    backtrack[i][0] = 'left';
  }

  for (let j = 1; j < colCount; j += 1) {
    dp[0][j] = j * insertionCost;
    backtrack[0][j] = 'right';
  }

  for (let i = 1; i < rowCount; i += 1) {
    for (let j = 1; j < colCount; j += 1) {
      const similarity = similarityScore(leftPages[i - 1], rightPages[j - 1]);
      const matchCost = dp[i - 1][j - 1] + (1 - similarity);
      const leftCost = dp[i - 1][j] + insertionCost;
      const rightCost = dp[i][j - 1] + insertionCost;

      const minCost = Math.min(matchCost, leftCost, rightCost);
      dp[i][j] = minCost;

      if (minCost === matchCost) {
        backtrack[i][j] = 'match';
      } else if (minCost === leftCost) {
        backtrack[i][j] = 'left';
      } else {
        backtrack[i][j] = 'right';
      }
    }
  }

  const pairs: ComparePagePair[] = [];
  let i = leftPages.length;
  let j = rightPages.length;

  while (i > 0 || j > 0) {
    const direction = backtrack[i][j];

    if (i > 0 && j > 0 && direction === 'match') {
      const confidence = similarityScore(leftPages[i - 1], rightPages[j - 1]);
      pairs.push({
        pairIndex: 0,
        leftPageNumber: leftPages[i - 1].pageNumber,
        rightPageNumber: rightPages[j - 1].pageNumber,
        confidence,
      });
      i -= 1;
      j -= 1;
      continue;
    }

    if (i > 0 && (j === 0 || direction === 'left')) {
      pairs.push({
        pairIndex: 0,
        leftPageNumber: leftPages[i - 1].pageNumber,
        rightPageNumber: null,
        confidence: 0,
      });
      i -= 1;
      continue;
    }

    if (j > 0) {
      pairs.push({
        pairIndex: 0,
        leftPageNumber: null,
        rightPageNumber: rightPages[j - 1].pageNumber,
        confidence: 0,
      });
      j -= 1;
    }
  }

  return pairs
    .reverse()
    .map((pair, index) => ({ ...pair, pairIndex: index + 1 }));
}
