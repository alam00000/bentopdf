import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { HyperWasmResult } from 'hyper-compress-wasm';

const mocks = vi.hoisted(() => ({
  compressWithHyper: vi.fn(),
  verifyHyperPassword: vi.fn(),
  showAlert: vi.fn(),
  downloadFile: vi.fn(),
}));

const page = vi.hoisted(() => ({ ready: null as (() => void) | null }));

vi.mock('../js/i18n/i18n.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../js/i18n/i18n.js')>()),
  onPageReady: (callback: () => void) => {
    page.ready = callback;
  },
}));

vi.mock('../js/utils/compress.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../js/utils/compress.js')>()),
  compressWithHyper: mocks.compressWithHyper,
  verifyHyperPassword: mocks.verifyHyperPassword,
}));

vi.mock('../js/ui.js', () => ({
  showLoader: vi.fn(),
  hideLoader: vi.fn(),
  showAlert: mocks.showAlert,
}));

vi.mock('../js/utils/helpers.js', () => ({
  downloadFile: mocks.downloadFile,
  formatBytes: (bytes: number) => `${bytes} B`,
}));

const PASSWORD = 'secret';
const OPEN_BODY = '%PDF-1.7 open';
const LOCKED_BODY = '%PDF-1.7 locked';

const pageMarkup = `
  <button id="back-to-tools"></button>
  <div id="drop-zone">
    <input type="file" id="file-input" multiple accept="application/pdf" />
  </div>
  <div id="file-display-area"></div>
  <button id="add-more-btn"></button>
  <button id="clear-files-btn"></button>
  ${readFileSync(resolve('src/partials/compress-options.html'), 'utf8')
    .replace('{{targetSize}}', '')
    .replace('{{targetUnit}}', 'mb')}`;

function result(overrides: Partial<HyperWasmResult> = {}): HyperWasmResult {
  return {
    data: new Uint8Array([37, 80, 68, 70]),
    originalSize: 100,
    compressedSize: 4,
    signed: false,
    signaturesRemoved: false,
    pdfa: null,
    pdfaOutcome: 'none',
    metTarget: null,
    warnings: [],
    ...overrides,
  };
}

async function openPage(): Promise<void> {
  const parsed = new DOMParser().parseFromString(pageMarkup, 'text/html');
  document.body.replaceChildren(...Array.from(parsed.body.childNodes));
  vi.resetModules();
  page.ready = null;
  await import('../js/logic/compress-pdf-page');
  if (!page.ready) throw new Error('page did not start');
  page.ready();
}

function pdfFile(name: string, body = OPEN_BODY, type = 'application/pdf') {
  return new File([body], name, { type });
}

function addFiles(...files: File[]) {
  const input = document.getElementById('file-input') as HTMLInputElement;
  Object.defineProperty(input, 'files', { value: files, configurable: true });
  input.dispatchEvent(new Event('change'));
}

function cards(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>('#file-display-area > div')
  ).filter((card) => card.querySelector('button[aria-label^="Remove "]'));
}

function cardText(name: string): string {
  const card = cards().find(
    (candidate) => candidate.querySelector('.truncate')?.textContent === name
  );
  return card?.textContent ?? '';
}

function passwordInput(label: string): HTMLInputElement | null {
  return document.querySelector<HTMLInputElement>(
    `input[aria-label="${label}"]`
  );
}

function type(input: HTMLInputElement | null, value: string) {
  if (!input) throw new Error('no password field');
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

function clickCompress() {
  (document.getElementById('process-btn') as HTMLButtonElement).click();
}

function alertTitles(): unknown[] {
  return mocks.showAlert.mock.calls.map(([title]) => title);
}

async function addLockedFile(name: string) {
  addFiles(pdfFile(name, LOCKED_BODY));
  await vi.waitFor(() =>
    expect(passwordInput(`Password for ${name}`)).not.toBeNull()
  );
}

async function unlock(name: string) {
  type(passwordInput(`Password for ${name}`), PASSWORD);
  await vi.waitFor(() => expect(cardText(name)).toContain('Unlocked'));
}

beforeEach(async () => {
  for (const mock of Object.values(mocks)) mock.mockReset();
  mocks.verifyHyperPassword.mockImplementation(
    async (pdf: ArrayBuffer, password: string) =>
      !new TextDecoder().decode(pdf).includes('locked') || password === PASSWORD
  );
  mocks.compressWithHyper.mockResolvedValue(result());
  await openPage();
});

describe('Compress PDF page', () => {
  it('asks for a password only on locked PDFs', async () => {
    addFiles(pdfFile('open.pdf'), pdfFile('locked.pdf', LOCKED_BODY));
    await vi.waitFor(() =>
      expect(passwordInput('Password for locked.pdf')).not.toBeNull()
    );
    expect(passwordInput('Password for open.pdf')).toBeNull();
    expect(passwordInput('Password for all locked files')).toBeNull();
    expect(cardText('locked.pdf')).toContain('Password protected');
  });

  it('shows a wrong password, then unlocks with the right one', async () => {
    await addLockedFile('locked.pdf');
    type(passwordInput('Password for locked.pdf'), 'nope');
    await vi.waitFor(() =>
      expect(cardText('locked.pdf')).toContain('Wrong password')
    );
    await unlock('locked.pdf');
  });

  it('will not compress a locked file without its password', async () => {
    await addLockedFile('locked.pdf');
    clickCompress();
    await vi.waitFor(() => expect(alertTitles()).toContain('Password Needed'));
    expect(mocks.compressWithHyper).not.toHaveBeenCalled();
  });

  it('sends the password and says the copy has none', async () => {
    await addLockedFile('locked.pdf');
    await unlock('locked.pdf');
    clickCompress();
    await vi.waitFor(() => expect(mocks.downloadFile).toHaveBeenCalled());
    expect(mocks.compressWithHyper).toHaveBeenCalledWith(
      expect.any(ArrayBuffer),
      expect.objectContaining({ password: PASSWORD })
    );
    expect(mocks.showAlert.mock.calls.at(-1)?.[1]).toContain(
      'the compressed copy has no password'
    );
  });

  it('marks the password wrong when the engine rejects it', async () => {
    await addLockedFile('locked.pdf');
    await unlock('locked.pdf');
    const { HyperError } = await import('hyper-compress-wasm');
    mocks.compressWithHyper.mockRejectedValue(
      new HyperError('decrypt_failed', 'wrong or missing password')
    );
    clickCompress();
    await vi.waitFor(() => expect(alertTitles()).toContain('Password Needed'));
    expect(cardText('locked.pdf')).toContain('Wrong password');
    expect(mocks.downloadFile).not.toHaveBeenCalled();
  });

  it('refuses files that are not PDFs', async () => {
    addFiles(pdfFile('notes.pdf', 'just some text'), pdfFile('empty.pdf', ''));
    await vi.waitFor(() => expect(alertTitles()).toContain('Not a PDF'));
    expect(mocks.showAlert.mock.calls[0][1]).toContain('notes.pdf, empty.pdf');
    expect(cards()).toHaveLength(0);
  });

  it('keeps both files in the ZIP when two share a name', async () => {
    addFiles(pdfFile('report.pdf'), pdfFile('report.pdf'));
    await vi.waitFor(() =>
      expect(mocks.verifyHyperPassword).toHaveBeenCalledTimes(2)
    );
    clickCompress();
    await vi.waitFor(() => expect(mocks.downloadFile).toHaveBeenCalled());
    const [zipBlob, zipName] = mocks.downloadFile.mock.calls[0];
    expect(zipName).toBe('compressed-pdfs.zip');
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(await (zipBlob as Blob).arrayBuffer());
    expect(Object.keys(zip.files).sort()).toEqual([
      'report (1).pdf',
      'report.pdf',
    ]);
  });

  it('does not download a signed PDF', async () => {
    mocks.compressWithHyper.mockResolvedValue(result({ signed: true }));
    addFiles(pdfFile('signed.pdf'));
    await vi.waitFor(() =>
      expect(mocks.verifyHyperPassword).toHaveBeenCalled()
    );
    clickCompress();
    await vi.waitFor(() =>
      expect(alertTitles()).toContain('Signed PDF Not Changed')
    );
    expect(mocks.downloadFile).not.toHaveBeenCalled();
  });

  it('unlocks every locked file from the shared password field', async () => {
    addFiles(
      pdfFile('a.pdf', LOCKED_BODY),
      pdfFile('b.pdf', LOCKED_BODY),
      pdfFile('c.pdf')
    );
    await vi.waitFor(() =>
      expect(passwordInput('Password for all locked files')).not.toBeNull()
    );
    type(passwordInput('Password for all locked files'), PASSWORD);
    await vi.waitFor(() => {
      expect(cardText('a.pdf')).toContain('Unlocked');
      expect(cardText('b.pdf')).toContain('Unlocked');
    });
    expect(document.getElementById('file-display-area')?.textContent).toContain(
      'Unlocked 2 of 2 files.'
    );
  });

  it('accepts dropped PDFs that have no file type', async () => {
    const drop = new Event('drop');
    Object.defineProperty(drop, 'dataTransfer', {
      value: {
        files: [
          pdfFile('scan.pdf', OPEN_BODY, ''),
          pdfFile('photo.png', 'png', 'image/png'),
        ],
      },
    });
    document.getElementById('drop-zone')?.dispatchEvent(drop);
    await vi.waitFor(() => expect(cards()).toHaveLength(1));
    expect(cardText('scan.pdf')).toContain('scan.pdf');
  });

  it('removes the file whose remove button was clicked', async () => {
    addFiles(pdfFile('a.pdf'), pdfFile('b.pdf'));
    await vi.waitFor(() => expect(cards()).toHaveLength(2));
    document
      .querySelector<HTMLButtonElement>('button[aria-label="Remove b.pdf"]')
      ?.click();
    expect(cards()).toHaveLength(1);
    expect(cardText('a.pdf')).toContain('a.pdf');
  });
});
