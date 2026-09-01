import type { MergeJob, InterleaveStep } from '@/types';

export function mergeJobToPageSpec(job: MergeJob): string | null {
  switch (job.rangeType) {
    case 'all':
      return '1-z';
    case 'specific':
      return job.rangeString ?? null;
    case 'single':
      return job.pageIndex === undefined ? null : String(job.pageIndex + 1);
    case 'range':
      return job.startPage === undefined || job.endPage === undefined
        ? null
        : `${job.startPage}-${job.endPage}`;
    default:
      return null;
  }
}

export function validatePageRangeString(
  input: string,
  totalPages: number
): string | null {
  const parts = input
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (parts.length === 0) return null;

  const normalized: string[] = [];
  for (const part of parts) {
    const rangeMatch = /^(\d+)-(\d+)$/.exec(part);
    if (!rangeMatch && !/^\d+$/.test(part)) return null;

    const start = Number(rangeMatch ? rangeMatch[1] : part);
    const end = rangeMatch ? Number(rangeMatch[2]) : start;

    if (start < 1 || end > totalPages || start > end) return null;

    normalized.push(rangeMatch ? `${start}-${end}` : `${start}`);
  }
  return normalized.join(',');
}

export function buildInterleaveSeries(pageCounts: number[]): InterleaveStep[] {
  const series: InterleaveStep[] = [];
  const maxPages = pageCounts.length === 0 ? 0 : Math.max(...pageCounts);

  for (let page = 1; page <= maxPages; page++) {
    for (let fileIndex = 0; fileIndex < pageCounts.length; fileIndex++) {
      if (pageCounts[fileIndex] >= page) {
        series.push({ fileIndex, page });
      }
    }
  }
  return series;
}
