import type { MergeFile, MergeJob, InterleaveStep } from '@/types';

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
    const zIdiom = /^(\d*)-?(z)$/i.exec(part);
    if (zIdiom) {
      const startStr = zIdiom[1];
      if (startStr.length === 0) {
        normalized.push('z');
        continue;
      }
      const start = Number(startStr);
      if (start < 1 || start > totalPages) return null;
      normalized.push(`${start}-z`);
      continue;
    }

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

export function applyReturnedFiles(
  store: {
    get(name: string): ArrayBuffer | undefined;
    set(name: string, data: ArrayBuffer): void;
  },
  files: MergeFile[] | undefined
): void {
  for (const file of files || []) {
    if (file && file.name && file.data) {
      store.set(file.name, file.data);
    }
  }
}
