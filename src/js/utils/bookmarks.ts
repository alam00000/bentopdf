import Papa from 'papaparse';
import type { BookmarkNode, BookmarkTree } from '../types/bookmark-pdf-type.js';

export const BOOKMARK_CSV_HEADER = 'title,page,level';

type BookmarkCsvResult =
  | { kind: 'invalid-header' }
  | {
      kind: 'parsed';
      bookmarks: BookmarkTree;
      importedRows: number;
      skippedRows: number;
    };

export function cleanBookmarkTitle(title: string): string {
  if (typeof title === 'string') {
    // eslint-disable-next-line no-control-regex -- Bookmark titles exclude control characters.
    return title.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
  }
  return title;
}

export function parseBookmarkCsv(text: string): BookmarkCsvResult {
  const { data, errors } = Papa.parse<string[]>(text.trim(), {
    delimiter: ',',
  });
  const [header, ...rows] = data;
  const malformedRows = new Set(errors.map(({ row }) => row));
  if (
    !header ||
    malformedRows.has(0) ||
    header.length !== 3 ||
    header.map((field) => field.trim().toLowerCase()).join(',') !==
      BOOKMARK_CSV_HEADER
  ) {
    return { kind: 'invalid-header' };
  }

  const bookmarks: BookmarkTree = [];
  const stack = [{ children: bookmarks, level: -1 }];
  let importedRows = 0;
  let skippedRows = 0;

  for (const [index, row] of rows.entries()) {
    const malformed = malformedRows.has(index + 1);
    if (!malformed && row.length === 1 && !row[0].trim()) continue;

    const [rawTitle = '', rawPage = '', rawLevel = ''] = row;
    const title = cleanBookmarkTitle(rawTitle);
    const page = Number(rawPage);
    const level = Number(rawLevel);
    if (
      malformed ||
      row.length !== 3 ||
      !title ||
      !/^\d+$/.test(rawPage.trim()) ||
      !Number.isSafeInteger(page) ||
      page < 1 ||
      !/^\d+$/.test(rawLevel.trim()) ||
      !Number.isSafeInteger(level)
    ) {
      skippedRows++;
      continue;
    }

    const bookmark: BookmarkNode = {
      id: Date.now() + Math.random(),
      title,
      page,
      children: [],
      color: null,
      style: null,
      destX: null,
      destY: null,
      zoom: null,
    };
    while (stack[stack.length - 1].level >= level) stack.pop();
    stack[stack.length - 1].children.push(bookmark);
    stack.push({ children: bookmark.children, level });
    importedRows++;
  }

  return { kind: 'parsed', bookmarks, importedRows, skippedRows };
}
