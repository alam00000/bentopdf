import type { QpdfInstanceExtended } from '@/types';

import { trText } from '../i18n/i18n.js';

export function parseRangeGroups(
  input: string,
  totalPages: number
): { groups: number[][]; indices: number[] } {
  const groups: number[][] = [];
  const indices: number[] = [];

  for (const range of input.split(',')) {
    const trimmedRange = range.trim();
    if (!trimmedRange) continue;

    const groupIndices: number[] = [];
    if (trimmedRange.includes('-')) {
      const [start, end] = trimmedRange.split('-').map(Number);
      if (
        isNaN(start) ||
        isNaN(end) ||
        start < 1 ||
        end > totalPages ||
        start > end
      )
        continue;
      for (let i = start; i <= end; i++) groupIndices.push(i - 1);
    } else {
      const pageNum = Number(trimmedRange);
      if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) continue;
      groupIndices.push(pageNum - 1);
    }

    if (groupIndices.length > 0) {
      groups.push(groupIndices);
      indices.push(...groupIndices);
    }
  }

  return { groups, indices };
}

export function evenOddIndices(
  choice: 'even' | 'odd',
  totalPages: number
): number[] {
  const indices: number[] = [];
  for (let i = 0; i < totalPages; i++) {
    if (choice === 'even' && (i + 1) % 2 === 0) indices.push(i);
    if (choice === 'odd' && (i + 1) % 2 !== 0) indices.push(i);
  }
  return indices;
}

export function allPagesIndices(totalPages: number): number[] {
  return Array.from({ length: totalPages }, (_, i) => i);
}

export function nTimesGroups(nValue: number, totalPages: number): number[][] {
  const groups: number[][] = [];
  const numSplits = Math.ceil(totalPages / nValue);
  for (let i = 0; i < numSplits; i++) {
    const startPage = i * nValue;
    const endPage = Math.min(startPage + nValue - 1, totalPages - 1);
    groups.push(
      Array.from(
        { length: endPage - startPage + 1 },
        (_, idx) => startPage + idx
      )
    );
  }
  return groups;
}

export function bookmarkSplitGroups(
  splitPages: number[],
  totalPages: number
): number[][] {
  const sorted = [...splitPages].sort((a, b) => a - b);
  const groups: number[][] = [];
  for (let i = 0; i < sorted.length; i++) {
    const startPage = i === 0 ? 0 : sorted[i];
    const endPage = i < sorted.length - 1 ? sorted[i + 1] - 1 : totalPages - 1;
    groups.push(
      Array.from(
        { length: endPage - startPage + 1 },
        (_, idx) => startPage + idx
      )
    );
  }
  return groups;
}

export function groupFilename(group: number[]): string {
  const minPage = Math.min(...group) + 1;
  const maxPage = Math.max(...group) + 1;
  return minPage === maxPage
    ? `page-${minPage}.pdf`
    : `pages-${minPage}-${maxPage}.pdf`;
}

export function uniqueZipName(
  name: string,
  usedNames: Map<string, number>
): string {
  const seen = usedNames.get(name);
  if (seen !== undefined) {
    usedNames.set(name, seen + 1);
    return name.replace(/\.pdf$/, `-${seen + 1}.pdf`);
  }
  usedNames.set(name, 0);
  return name;
}

export function pagesToSpec(indices: number[]): string {
  return indices.map((index) => index + 1).join(',');
}

export type SizeSplitPlanResult =
  | { groups: number[][]; sizes: number[] }
  | { error: 'page-too-large'; page: number }
  | { error: 'extract-failed'; page: number };

export interface SizeSplitPlanInput {
  pageCount: number;
  maxBytes: number;
  extract: (indices: number[]) => Promise<Uint8Array | null>;
}

function pageRange(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, offset) => start + offset);
}

/**
 * Plan a split where every output PDF stays within `maxBytes`.
 *
 * Pages are never split, so each group is a contiguous page range. The end
 * page grows exponentially while the extraction fits, then a binary search
 * finds the largest fitting end page. A page that exceeds the limit on its own
 * aborts the plan so no partial output is produced.
 *
 * The PDF Multi Tool has an equivalent planner, but it is bundled inside the
 * vendored `bentopdf-viewer` package and is not exported, so the standalone
 * tool keeps its own copy here.
 */
export async function planSizeBasedSplit({
  pageCount,
  maxBytes,
  extract,
}: SizeSplitPlanInput): Promise<SizeSplitPlanResult> {
  const groups: number[][] = [];
  const sizes: number[] = [];
  let start = 0;

  while (start < pageCount) {
    const singlePage = await extract([start]);
    if (!singlePage) return { error: 'extract-failed', page: start + 1 };
    if (singlePage.length > maxBytes) {
      return { error: 'page-too-large', page: start + 1 };
    }

    let end = start;
    let bestBytes = singlePage.length;
    let step = 1;
    let failedEnd: number | null = null;

    // Grow the range exponentially until it no longer fits.
    while (end + 1 < pageCount) {
      const candidateEnd = Math.min(end + step, pageCount - 1);
      const candidate = await extract(pageRange(start, candidateEnd));
      if (!candidate) {
        return { error: 'extract-failed', page: candidateEnd + 1 };
      }
      if (candidate.length > maxBytes) {
        failedEnd = candidateEnd;
        break;
      }
      end = candidateEnd;
      bestBytes = candidate.length;
      step *= 2;
    }

    // Binary-search the largest fitting end page between the last known fit
    // and the first known overflow (or the end of the document).
    let low = end + 1;
    let high = failedEnd === null ? pageCount - 1 : failedEnd - 1;
    while (low <= high) {
      const mid = (low + high) >> 1;
      const candidate = await extract(pageRange(start, mid));
      if (!candidate) return { error: 'extract-failed', page: mid + 1 };
      if (candidate.length <= maxBytes) {
        end = mid;
        bestBytes = candidate.length;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    groups.push(pageRange(start, end));
    sizes.push(bestBytes);
    start = end + 1;
  }

  return { groups, sizes };
}

export function extractPagesWithQpdf(
  qpdf: QpdfInstanceExtended,
  inputPath: string,
  indices: number[],
  outputPath = '/split-output.pdf'
): Uint8Array {
  const exitCode = qpdf.callMain([
    inputPath,
    '--remove-unreferenced-resources=yes',
    '--pages',
    '.',
    pagesToSpec(indices),
    '--',
    outputPath,
  ]);
  try {
    if (exitCode !== 0 && exitCode !== 3) {
      throw new Error(
        trText('Failed to extract pages (qpdf exit code {{exitCode}}).', {
          exitCode,
        })
      );
    }
    const bytes = qpdf.FS.readFile(outputPath, { encoding: 'binary' });
    if (!bytes || bytes.length === 0) {
      throw new Error(trText('Page extraction produced an empty PDF.'));
    }
    return bytes;
  } finally {
    try {
      qpdf.FS.unlink(outputPath);
    } catch (cleanupError) {
      console.warn('Failed to clean up qpdf output file:', cleanupError);
    }
  }
}
