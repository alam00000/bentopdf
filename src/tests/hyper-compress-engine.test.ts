// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { PDFDocument, PDFName, StandardFonts } from 'pdf-lib';
import type { HyperWasmOptions } from 'hyper-compress-wasm';
import type {
  HyperCompressRequest,
  HyperCompressResponse,
  QpdfInstanceExtended,
} from '@/types';

interface WorkerScope {
  onmessage: ((event: { data: HyperCompressRequest }) => Promise<void>) | null;
  postMessage: (message: HyperCompressResponse) => void;
}

const replies: HyperCompressResponse[] = [];
const scope: WorkerScope = {
  onmessage: null,
  postMessage: (message) => {
    replies.push(message);
  },
};
vi.stubGlobal('self', scope);
await import('../js/utils/hyper-compress.worker');

const USER_PASSWORD = 'user-pass';
const OWNER_PASSWORD = 'owner-pass';
const QPDF_WASM = resolve(
  'node_modules/@neslinesli93/qpdf-wasm/dist/qpdf.wasm'
);

let nextId = 0;

async function ask(
  request: HyperCompressRequest
): Promise<HyperCompressResponse> {
  if (!scope.onmessage) throw new Error('the worker did not start');
  await scope.onmessage({ data: request });
  const reply = replies.find((message) => message.id === request.id);
  if (!reply) throw new Error(`no reply to request ${request.id}`);
  return reply;
}

async function verify(pdf: Uint8Array, password: string): Promise<boolean> {
  const reply = await ask({
    id: ++nextId,
    type: 'verify',
    bytes: new Uint8Array(pdf).buffer,
    password,
  });
  if (reply.type !== 'verified') throw new Error(`unexpected ${reply.type}`);
  return reply.valid;
}

function compress(
  pdf: Uint8Array,
  options: HyperWasmOptions = {}
): Promise<HyperCompressResponse> {
  return ask({
    id: ++nextId,
    type: 'compress',
    bytes: new Uint8Array(pdf).buffer,
    options,
  });
}

async function qpdf(input: Uint8Array, args: string[]): Promise<Uint8Array> {
  const { default: createModule } = await import('@neslinesli93/qpdf-wasm');
  const options = {
    locateFile: () => QPDF_WASM,
    wasmBinary: readFileSync(QPDF_WASM),
    print: () => {},
    printErr: () => {},
  };
  const instance = (await createModule(
    options
  )) as unknown as QpdfInstanceExtended;
  instance.FS.writeFile('/in.pdf', input);
  instance.callMain(['/in.pdf', ...args, '/out.pdf']);
  return instance.FS.readFile('/out.pdf');
}

async function textPdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (const label of ['First page', 'Second page']) {
    doc.addPage().drawText(label, { x: 50, y: 700, font, size: 24 });
  }
  return doc.save({ useObjectStreams: false });
}

function lock(pdf: Uint8Array, userPassword = USER_PASSWORD) {
  return qpdf(pdf, ['--encrypt', userPassword, OWNER_PASSWORD, '256', '--']);
}

function shiftEveryOffset(pdf: Uint8Array): Uint8Array {
  const headerEnd = pdf.indexOf(0x0a) + 1;
  const junk = new TextEncoder().encode('%junk\n');
  const out = new Uint8Array(pdf.length + junk.length);
  out.set(pdf.subarray(0, headerEnd));
  out.set(junk, headerEnd);
  out.set(pdf.subarray(headerEnd), headerEnd + junk.length);
  return out;
}

async function signedPdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.addPage();
  const signature = doc.context.register(
    doc.context.obj({ Type: 'Sig', Filter: 'Adobe.PPKLite' })
  );
  doc.catalog.set(PDFName.of('Perms'), doc.context.obj({ DocMDP: signature }));
  return doc.save();
}

function hasEncryptDictionary(pdf: Uint8Array): boolean {
  return new TextDecoder('latin1').decode(pdf).includes('/Encrypt');
}

describe('Hyper compress worker', { timeout: 60_000 }, () => {
  it('opens an unencrypted PDF without a password', async () => {
    expect(await verify(await textPdf(), '')).toBe(true);
  });

  it('accepts only the user or owner password of a locked PDF', async () => {
    const locked = await lock(await textPdf());
    expect(await verify(locked, '')).toBe(false);
    expect(await verify(locked, 'not-it')).toBe(false);
    expect(await verify(locked, USER_PASSWORD)).toBe(true);
    expect(await verify(locked, OWNER_PASSWORD)).toBe(true);
  });

  it('turns a locked PDF into an unlocked, readable copy', async () => {
    const reply = await compress(await lock(await textPdf()), {
      preset: 'medium',
      password: USER_PASSWORD,
    });
    if (reply.type !== 'result') throw new Error(`unexpected ${reply.type}`);
    expect(hasEncryptDictionary(reply.result.data)).toBe(false);
    const output = await PDFDocument.load(reply.result.data);
    expect(output.getPageCount()).toBe(2);
  });

  it('refuses a locked PDF without its password', async () => {
    const reply = await compress(await lock(await textPdf()), {
      preset: 'medium',
    });
    expect(reply).toMatchObject({ type: 'error', code: 'decrypt_failed' });
  });

  it('refuses a locked PDF with the wrong password', async () => {
    const reply = await compress(await lock(await textPdf()), {
      preset: 'medium',
      password: 'not-it',
    });
    expect(reply).toMatchObject({ type: 'error', code: 'decrypt_failed' });
  });

  it('unlocks older encryption whose password has non-ASCII characters', async () => {
    const password = 'pässwört';
    const encryptions = [
      ['--encrypt', password, OWNER_PASSWORD, '128', '--use-aes=y', '--'],
      [
        '--allow-weak-crypto',
        '--encrypt',
        password,
        OWNER_PASSWORD,
        '40',
        '--',
      ],
    ];
    for (const args of encryptions) {
      const locked = await qpdf(await textPdf(), args);
      expect(await verify(locked, password)).toBe(true);
      expect(await verify(locked, 'passwort')).toBe(false);
      const reply = await compress(locked, { preset: 'medium', password });
      if (reply.type !== 'result') throw new Error(`unexpected ${reply.type}`);
      expect(hasEncryptDictionary(reply.result.data)).toBe(false);
    }
  });

  it('repairs and unlocks a damaged locked PDF', async () => {
    const damaged = shiftEveryOffset(await lock(await textPdf()));
    expect(await verify(damaged, USER_PASSWORD)).toBe(true);
    const reply = await compress(damaged, {
      preset: 'medium',
      password: USER_PASSWORD,
    });
    if (reply.type !== 'result') throw new Error(`unexpected ${reply.type}`);
    const output = await PDFDocument.load(reply.result.data);
    expect(output.getPageCount()).toBe(2);
  });

  it('keeps owner-only protection on a PDF that opens without a password', async () => {
    const ownerOnly = await lock(await textPdf(), '');
    expect(await verify(ownerOnly, '')).toBe(true);
    const reply = await compress(ownerOnly, { preset: 'medium' });
    if (reply.type !== 'result') throw new Error(`unexpected ${reply.type}`);
    expect(hasEncryptDictionary(reply.result.data)).toBe(true);
    expect(await verify(reply.result.data, '')).toBe(true);
  });

  it('returns a signed PDF unchanged', async () => {
    const signed = await signedPdf();
    const reply = await compress(signed, { preset: 'high' });
    if (reply.type !== 'result') throw new Error(`unexpected ${reply.type}`);
    expect(reply.result.signed).toBe(true);
    expect(Array.from(reply.result.data)).toEqual(Array.from(signed));
  });

  it('returns a valid PDF when the target size cannot be reached', async () => {
    const reply = await compress(await textPdf(), {
      preset: 'medium',
      targetSizeBytes: 100,
    });
    if (reply.type !== 'result') throw new Error(`unexpected ${reply.type}`);
    expect(reply.result.metTarget).toBe(false);
    const output = await PDFDocument.load(reply.result.data);
    expect(output.getPageCount()).toBe(2);
  });
});
