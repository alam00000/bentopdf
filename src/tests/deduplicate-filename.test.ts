import { describe, it, expect } from 'vitest';
import {
  deduplicateFileName,
  makeUniqueFileKey,
} from '@/js/utils/deduplicate-filename';

describe('deduplicateFileName', () => {
  it('should return the original name when no duplicates exist', () => {
    const usedNames = new Set<string>();
    expect(deduplicateFileName('report.pdf', usedNames)).toBe('report.pdf');
  });

  it('should add the name to the Set after returning', () => {
    const usedNames = new Set<string>();
    deduplicateFileName('report.pdf', usedNames);
    expect(usedNames.has('report.pdf')).toBe(true);
  });

  it('should append (1) for the first duplicate', () => {
    const usedNames = new Set<string>();
    deduplicateFileName('report.pdf', usedNames);
    expect(deduplicateFileName('report.pdf', usedNames)).toBe('report (1).pdf');
  });

  it('should increment counter for multiple duplicates', () => {
    const usedNames = new Set<string>();
    expect(deduplicateFileName('file.pdf', usedNames)).toBe('file.pdf');
    expect(deduplicateFileName('file.pdf', usedNames)).toBe('file (1).pdf');
    expect(deduplicateFileName('file.pdf', usedNames)).toBe('file (2).pdf');
    expect(deduplicateFileName('file.pdf', usedNames)).toBe('file (3).pdf');
  });

  it('should track deduplicated names to avoid collisions with them', () => {
    const usedNames = new Set<string>();
    deduplicateFileName('file.pdf', usedNames);
    deduplicateFileName('file (1).pdf', usedNames);
    expect(deduplicateFileName('file.pdf', usedNames)).toBe('file (2).pdf');
  });

  it('should handle files with no extension', () => {
    const usedNames = new Set<string>();
    expect(deduplicateFileName('README', usedNames)).toBe('README');
    expect(deduplicateFileName('README', usedNames)).toBe('README (1)');
    expect(deduplicateFileName('README', usedNames)).toBe('README (2)');
  });

  it('should handle files with multiple dots in the name', () => {
    const usedNames = new Set<string>();
    expect(deduplicateFileName('my.report.2024.pdf', usedNames)).toBe(
      'my.report.2024.pdf'
    );
    expect(deduplicateFileName('my.report.2024.pdf', usedNames)).toBe(
      'my.report.2024 (1).pdf'
    );
  });

  it('should handle dotfiles (name starts with dot)', () => {
    const usedNames = new Set<string>();
    expect(deduplicateFileName('.gitignore', usedNames)).toBe('.gitignore');
    expect(deduplicateFileName('.gitignore', usedNames)).toBe('.gitignore (1)');
  });

  it('should handle dotfiles with extension', () => {
    const usedNames = new Set<string>();
    expect(deduplicateFileName('.env.local', usedNames)).toBe('.env.local');
    expect(deduplicateFileName('.env.local', usedNames)).toBe('.env (1).local');
  });

  it('should handle empty string', () => {
    const usedNames = new Set<string>();
    expect(deduplicateFileName('', usedNames)).toBe('');
    expect(deduplicateFileName('', usedNames)).toBe(' (1)');
  });

  it('should handle extension-only name', () => {
    const usedNames = new Set<string>();
    expect(deduplicateFileName('.pdf', usedNames)).toBe('.pdf');
    expect(deduplicateFileName('.pdf', usedNames)).toBe('.pdf (1)');
  });

  it('should preserve the original extension exactly', () => {
    const usedNames = new Set<string>();
    deduplicateFileName('photo.JPEG', usedNames);
    const result = deduplicateFileName('photo.JPEG', usedNames);
    expect(result).toBe('photo (1).JPEG');
    expect(result.endsWith('.JPEG')).toBe(true);
  });

  it('should handle very long filenames', () => {
    const usedNames = new Set<string>();
    const longName = 'a'.repeat(200) + '.pdf';
    expect(deduplicateFileName(longName, usedNames)).toBe(longName);
    expect(deduplicateFileName(longName, usedNames)).toBe(
      'a'.repeat(200) + ' (1).pdf'
    );
  });

  it('should handle names with special characters', () => {
    const usedNames = new Set<string>();
    const name = 'report (final) [v2].pdf';
    expect(deduplicateFileName(name, usedNames)).toBe(name);
    expect(deduplicateFileName(name, usedNames)).toBe(
      'report (final) [v2] (1).pdf'
    );
  });

  it('should handle names with unicode characters', () => {
    const usedNames = new Set<string>();
    expect(deduplicateFileName('レポート.pdf', usedNames)).toBe('レポート.pdf');
    expect(deduplicateFileName('レポート.pdf', usedNames)).toBe(
      'レポート (1).pdf'
    );
  });

  it('should handle names with spaces', () => {
    const usedNames = new Set<string>();
    expect(deduplicateFileName('my report.pdf', usedNames)).toBe(
      'my report.pdf'
    );
    expect(deduplicateFileName('my report.pdf', usedNames)).toBe(
      'my report (1).pdf'
    );
  });

  it('should not confuse different extensions as duplicates', () => {
    const usedNames = new Set<string>();
    expect(deduplicateFileName('file.pdf', usedNames)).toBe('file.pdf');
    expect(deduplicateFileName('file.txt', usedNames)).toBe('file.txt');
    expect(deduplicateFileName('file.pdf', usedNames)).toBe('file (1).pdf');
    expect(deduplicateFileName('file.txt', usedNames)).toBe('file (1).txt');
  });

  it('should work with a fresh Set for each batch', () => {
    const batch1 = new Set<string>();
    deduplicateFileName('file.pdf', batch1);
    deduplicateFileName('file.pdf', batch1);

    const batch2 = new Set<string>();
    expect(deduplicateFileName('file.pdf', batch2)).toBe('file.pdf');
  });

  it('should handle many duplicates without infinite loop', () => {
    const usedNames = new Set<string>();
    for (let i = 0; i < 100; i++) {
      deduplicateFileName('test.pdf', usedNames);
    }
    expect(usedNames.size).toBe(100);
    expect(usedNames.has('test.pdf')).toBe(true);
    expect(usedNames.has('test (1).pdf')).toBe(true);
    expect(usedNames.has('test (99).pdf')).toBe(true);
  });

  it('should handle pre-populated Set', () => {
    const usedNames = new Set<string>(['file.pdf', 'file (1).pdf']);
    expect(deduplicateFileName('file.pdf', usedNames)).toBe('file (2).pdf');
  });

  it('should handle name that is just a dot', () => {
    const usedNames = new Set<string>();
    expect(deduplicateFileName('.', usedNames)).toBe('.');
    expect(deduplicateFileName('.', usedNames)).toBe('. (1)');
  });
});

describe('makeUniqueFileKey', () => {
  it('should combine index and name', () => {
    expect(makeUniqueFileKey(0, 'file.pdf')).toBe('0_file.pdf');
    expect(makeUniqueFileKey(1, 'file.pdf')).toBe('1_file.pdf');
  });

  it('should produce different keys for same name at different indices', () => {
    const key1 = makeUniqueFileKey(0, 'report.pdf');
    const key2 = makeUniqueFileKey(1, 'report.pdf');
    expect(key1).not.toBe(key2);
  });

  it('should produce same key for same index and name', () => {
    expect(makeUniqueFileKey(5, 'test.pdf')).toBe(
      makeUniqueFileKey(5, 'test.pdf')
    );
  });

  it('should handle empty name', () => {
    expect(makeUniqueFileKey(0, '')).toBe('0_');
  });

  it('should handle large indices', () => {
    expect(makeUniqueFileKey(9999, 'file.pdf')).toBe('9999_file.pdf');
  });

  it('should handle names with underscores', () => {
    expect(makeUniqueFileKey(0, 'my_file.pdf')).toBe('0_my_file.pdf');
  });

  it('should handle names with special characters', () => {
    expect(makeUniqueFileKey(0, 'file (1).pdf')).toBe('0_file (1).pdf');
  });
});
