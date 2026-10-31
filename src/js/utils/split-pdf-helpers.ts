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
