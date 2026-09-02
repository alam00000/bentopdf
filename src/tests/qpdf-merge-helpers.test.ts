import { describe, expect, it } from 'vitest';
import type { MergeFile, MergeJob } from '@/types';
import {
  mergeJobToPageSpec,
  validatePageRangeString,
  buildInterleaveSeries,
  applyReturnedFiles,
} from '@/js/utils/qpdf-merge-helpers';

describe('mergeJobToPageSpec', () => {
  it('maps an all-pages job to the qpdf 1-z idiom', () => {
    const job: MergeJob = { fileName: 'a.pdf', rangeType: 'all' };
    expect(mergeJobToPageSpec(job)).toBe('1-z');
  });

  it('maps a single-page job to a 1-based qpdf page term', () => {
    const job: MergeJob = {
      fileName: 'a.pdf',
      rangeType: 'single',
      pageIndex: 2,
    };
    expect(mergeJobToPageSpec(job)).toBe('3');
  });

  it('maps a contiguous-range job to the n-m qpdf page term', () => {
    const job: MergeJob = {
      fileName: 'a.pdf',
      rangeType: 'range',
      startPage: 2,
      endPage: 5,
    };
    expect(mergeJobToPageSpec(job)).toBe('2-5');
  });

  it('passes a specific range string through verbatim', () => {
    const job: MergeJob = {
      fileName: 'a.pdf',
      rangeType: 'specific',
      rangeString: '1-3,7-9',
    };
    expect(mergeJobToPageSpec(job)).toBe('1-3,7-9');
  });

  it('returns null for an unsupported or spec-less job', () => {
    expect(
      mergeJobToPageSpec({
        fileName: 'a.pdf',
        rangeType: 'specific',
      } as MergeJob)
    ).toBeNull();
    expect(
      mergeJobToPageSpec({
        fileName: 'a.pdf',
        rangeType: 'bogus',
      } as unknown as MergeJob)
    ).toBeNull();
  });
});

describe('validatePageRangeString', () => {
  it('accepts a comma-separated mix of pages and ranges', () => {
    expect(validatePageRangeString('1-3,7-9', 20)).toBe('1-3,7-9');
  });

  it('trims whitespace and empty parts between commas', () => {
    expect(validatePageRangeString(' 1 , , 3-4 ', 10)).toBe('1,3-4');
  });

  it('accepts and trims a single page', () => {
    expect(validatePageRangeString(' 5 ', 5)).toBe('5');
  });

  it('skips empty comma parts and normalizes leading zeros', () => {
    expect(validatePageRangeString('1,', 10)).toBe('1');
    expect(validatePageRangeString('01-03', 10)).toBe('1-3');
  });

  it('rejects ranges beyond the page count', () => {
    expect(validatePageRangeString('7-9', 5)).toBeNull();
    expect(validatePageRangeString('1-100', 5)).toBeNull();
  });

  it('rejects zero, reversed, and out-of-bounds ranges', () => {
    expect(validatePageRangeString('0-2', 5)).toBeNull();
    expect(validatePageRangeString('3-1', 5)).toBeNull();
  });

  it('accepts the qpdf z idioms for the last page', () => {
    expect(validatePageRangeString('z', 10)).toBe('z');
    expect(validatePageRangeString('1-z', 10)).toBe('1-z');
    expect(validatePageRangeString('5-z', 10)).toBe('5-z');
    expect(validatePageRangeString('1-3,7-z', 20)).toBe('1-3,7-z');
    expect(validatePageRangeString('1,z', 10)).toBe('1,z');
  });

  it('normalizes leading zeros in z-idiom starts', () => {
    expect(validatePageRangeString('05-z', 10)).toBe('5-z');
  });

  it('rejects z idioms whose start is invalid or out of bounds', () => {
    expect(validatePageRangeString('0-z', 10)).toBeNull();
    expect(validatePageRangeString('11-z', 10)).toBeNull();
    expect(validatePageRangeString('z-3', 10)).toBeNull();
  });

  it('rejects non-numeric and malformed input', () => {
    expect(validatePageRangeString('abc', 10)).toBeNull();
    expect(validatePageRangeString('1.5', 10)).toBeNull();
    expect(validatePageRangeString('', 10)).toBeNull();
    expect(validatePageRangeString(' , ', 10)).toBeNull();
  });
});

describe('buildInterleaveSeries', () => {
  it('interleaves two equal-count files A1,B1,A2,B2…', () => {
    expect(buildInterleaveSeries([2, 2])).toEqual([
      { fileIndex: 0, page: 1 },
      { fileIndex: 1, page: 1 },
      { fileIndex: 0, page: 2 },
      { fileIndex: 1, page: 2 },
    ]);
  });

  it('skips files that run out of pages (uneven counts)', () => {
    expect(buildInterleaveSeries([3, 2])).toEqual([
      { fileIndex: 0, page: 1 },
      { fileIndex: 1, page: 1 },
      { fileIndex: 0, page: 2 },
      { fileIndex: 1, page: 2 },
      { fileIndex: 0, page: 3 },
    ]);
  });

  it('interleaves three files in round order', () => {
    expect(buildInterleaveSeries([2, 3, 1])).toEqual([
      { fileIndex: 0, page: 1 },
      { fileIndex: 1, page: 1 },
      { fileIndex: 2, page: 1 },
      { fileIndex: 0, page: 2 },
      { fileIndex: 1, page: 2 },
      { fileIndex: 1, page: 3 },
    ]);
  });

  it('handles a single file', () => {
    expect(buildInterleaveSeries([3])).toEqual([
      { fileIndex: 0, page: 1 },
      { fileIndex: 0, page: 2 },
      { fileIndex: 0, page: 3 },
    ]);
  });

  it('returns an empty series for no files or zero-page files', () => {
    expect(buildInterleaveSeries([])).toEqual([]);
    expect(buildInterleaveSeries([0, 0])).toEqual([]);
  });
});

describe('applyReturnedFiles', () => {
  it('replaces stored buffers with the returned ones by file name', () => {
    const store = new Map<string, ArrayBuffer>();
    const original = new ArrayBuffer(8);
    store.set('a.pdf', original);
    const replacement = new ArrayBuffer(16);
    applyReturnedFiles(store, [{ name: 'a.pdf', data: replacement }]);
    expect(store.get('a.pdf')).toBe(replacement);
    expect(store.size).toBe(1);
  });

  it('adds buffers for names the store did not have yet', () => {
    const store = new Map<string, ArrayBuffer>();
    const bytes = new ArrayBuffer(4);
    applyReturnedFiles(store, [{ name: 'b.pdf', data: bytes }]);
    expect(store.get('b.pdf')).toBe(bytes);
  });

  it('skips entries without a name or data', () => {
    const store = new Map<string, ArrayBuffer>();
    const original = new ArrayBuffer(8);
    store.set('a.pdf', original);
    applyReturnedFiles(store, [
      { name: '', data: new ArrayBuffer(4) },
      { name: 'b.pdf' } as MergeFile,
      {} as MergeFile,
    ]);
    expect(store.get('a.pdf')).toBe(original);
    expect(store.size).toBe(1);
  });

  it('tolerates an undefined reply payload', () => {
    const store = new Map<string, ArrayBuffer>();
    expect(() => applyReturnedFiles(store, undefined)).not.toThrow();
  });
});
