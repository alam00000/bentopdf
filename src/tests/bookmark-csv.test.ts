import { describe, expect, it, vi } from 'vitest';
import { parseBookmarkCsv } from '../js/utils/bookmarks.js';

vi.mock('../js/utils/setup-pdf-worker.js', () => ({}));
vi.mock('../js/i18n/i18n.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../js/i18n/i18n.js')>()),
  onPageReady: vi.fn(),
}));

describe('bookmark CSV parser', () => {
  it.each([
    '',
    'label,position,depth\nChapter,1,1',
    'page,title,level\n1,Chapter,1',
    'title,page,level,extra\nChapter,1,1,extra',
  ])('rejects an absent or unexpected header in %j', (csv) => {
    expect(parseBookmarkCsv(csv)).toEqual({ kind: 'invalid-header' });
  });

  it('imports all CRLF rows, supporting exported levels and quoted titles', () => {
    const result = parseBookmarkCsv(
      '\ufefftitle,page,level\r\n' +
        '"Chapter, One",1,0\r\n' +
        '"A ""quoted"" heading",2,1\r\n\r\n' +
        'Appendix,3,0\r\n'
    );

    expect(result).toMatchObject({
      kind: 'parsed',
      importedRows: 3,
      skippedRows: 0,
      bookmarks: [
        {
          title: 'Chapter, One',
          page: 1,
          children: [{ title: 'A "quoted" heading', page: 2, children: [] }],
        },
        { title: 'Appendix', page: 3, children: [] },
      ],
    });
  });

  it('counts malformed rows while retaining valid rows', () => {
    expect(
      parseBookmarkCsv(
        'title,page,level\nBad page,one,1\n\n,2,1\n' +
          'Valid chapter,2,1\nBad level,3,-1\n"Unclosed,4,1'
      )
    ).toMatchObject({
      kind: 'parsed',
      importedRows: 1,
      skippedRows: 4,
      bookmarks: [{ title: 'Valid chapter', page: 2, children: [] }],
    });
  });

  it('distinguishes a header-only file from an invalid header', () => {
    expect(parseBookmarkCsv('title,page,level\n')).toEqual({
      kind: 'parsed',
      importedRows: 0,
      skippedRows: 0,
      bookmarks: [],
    });
  });
});

it('reports errors in both import controls and preserves the edited tree', async () => {
  const initialInput = document.createElement('input');
  initialInput.type = 'file';
  initialInput.id = 'csv-input';
  const editorInput = document.createElement('input');
  editorInput.type = 'file';
  editorInput.id = 'csv-import-hidden';
  const modal = document.createElement('div');
  modal.id = 'modal-container';
  const tree = document.createElement('ul');
  tree.id = 'bookmark-tree-list';
  document.body.append(initialInput, editorInput, modal, tree);
  await import('../js/logic/bookmark-pdf.js');

  async function importCsv(
    input: HTMLInputElement,
    csv: string,
    message: string
  ) {
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [{ text: async () => csv }],
    });
    input.dispatchEvent(new Event('change'));
    await vi.waitFor(() => expect(modal.textContent).toContain(message));
    modal.querySelector<HTMLButtonElement>('#modal-ok')?.click();
  }

  await importCsv(
    initialInput,
    'label,position,depth\nFirst,1,1',
    'CSV header must be title,page,level.'
  );
  await importCsv(
    editorInput,
    'title,page,level\nFirst,1,1\nInvalid,one,1',
    'Invalid CSV rows skipped: 1.'
  );
  expect(tree.textContent).toContain('First');

  await importCsv(
    editorInput,
    'label,position,depth\nReplacement,2,1',
    'CSV header must be title,page,level.'
  );
  await importCsv(
    editorInput,
    'title,page,level\nReplacement,invalid,1',
    'The CSV contains no valid bookmarks.'
  );
  expect(tree.textContent).toContain('First');
  expect(tree.textContent).not.toContain('Replacement');
});
