import { describe, it, expect } from 'vitest';
import { calculateSearchRelevance } from '@/js/utils/search-utils';

describe('calculateSearchRelevance', () => {
  it('returns 0 for empty search queries or whitespace', () => {
    expect(calculateSearchRelevance('Merge PDF', 'Combine files', '')).toBe(0);
    expect(calculateSearchRelevance('Merge PDF', 'Combine files', '   ')).toBe(
      0
    );
  });

  it('returns 100 for exact title matches (case-insensitive)', () => {
    expect(
      calculateSearchRelevance(
        'Merge PDF',
        'Combine multiple files',
        'merge pdf'
      )
    ).toBe(100);
    expect(
      calculateSearchRelevance(
        'Merge PDF',
        'Combine multiple files',
        'MERGE PDF'
      )
    ).toBe(100);
  });

  it('returns 80 when title starts with the query', () => {
    expect(
      calculateSearchRelevance(
        'Delete Pages',
        'Remove specific pages',
        'delete'
      )
    ).toBe(80);
    expect(
      calculateSearchRelevance('Rotate PDF', 'Turn pages 90 degrees', 'rotate')
    ).toBe(80);
  });

  it('returns 60 when query matches a word boundary inside the title', () => {
    expect(
      calculateSearchRelevance(
        'Alternate Merge',
        'Interleave odd and even pages',
        'merge'
      )
    ).toBe(60);
    expect(
      calculateSearchRelevance(
        'PDF Editor',
        'Annotate and edit PDF files',
        'editor'
      )
    ).toBe(60);
  });

  it('returns 40 when query is a non-word-boundary substring in the title', () => {
    expect(
      calculateSearchRelevance(
        'Validate PDF',
        'Check digital signatures',
        'date'
      )
    ).toBe(40);
  });

  it('returns 20 when query matches a word boundary in the description', () => {
    expect(
      calculateSearchRelevance(
        'PDF Multi Tool',
        'Merge, Split, Organize, Delete, Rotate, Add Blank Pages, Extract and Duplicate',
        'delete'
      )
    ).toBe(20);
    expect(
      calculateSearchRelevance(
        'Duplicate & Organize',
        'Duplicate, reorder, and delete pages.',
        'delete'
      )
    ).toBe(20);
  });

  it('returns 10 when query is a non-word-boundary substring in the description', () => {
    expect(
      calculateSearchRelevance(
        'Add Overlay',
        'Apply watermarking to background pages',
        'mark'
      )
    ).toBe(10);
  });

  it('returns 0 when neither title nor description match', () => {
    expect(
      calculateSearchRelevance(
        'Compress PDF',
        'Reduce the file size',
        'watermark'
      )
    ).toBe(0);
  });

  it('prioritizes title matches over description-only matches', () => {
    const titleMatchScore = calculateSearchRelevance(
      'Delete Pages',
      'Remove specific pages from your document',
      'delete'
    );
    const descMatchScore = calculateSearchRelevance(
      'PDF Multi Tool',
      'Merge, Split, Organize, Delete, Rotate, Add Blank Pages, Extract and Duplicate in a unified interface.',
      'delete'
    );

    expect(titleMatchScore).toBeGreaterThan(descMatchScore);
    expect(titleMatchScore).toBe(80);
    expect(descMatchScore).toBe(20);
  });

  it('correctly matches non-ASCII Unicode words at word boundaries', () => {
    expect(
      calculateSearchRelevance('Outil Éclair', 'Outil de conversion', 'éclair')
    ).toBe(60);
    expect(
      calculateSearchRelevance('Añadir Página', 'Operaciones de PDF', 'página')
    ).toBe(60);
  });

  it('safely handles special regex characters in query', () => {
    expect(() =>
      calculateSearchRelevance(
        'PDF to C++ (Docs)',
        'Convert PDF to code',
        'c++'
      )
    ).not.toThrow();
    expect(
      calculateSearchRelevance(
        'PDF to C++ (Docs)',
        'Convert PDF to code',
        'c++'
      )
    ).toBeGreaterThan(0);
  });
});
