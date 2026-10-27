import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  HYPER_PRESETS,
  HyperError,
  normalizeHyperOptions,
} from 'hyper-compress-wasm';
import type { HyperWasmResult } from 'hyper-compress-wasm';
import type { HyperCompressRequest, HyperCompressResponse } from '@/types';
import {
  COMPRESS_LEVELS,
  applyHyperPreset,
  hasPdfHeader,
  matchHyperPreset,
  resolveCompressLevel,
  targetSizeToBytes,
} from '../js/utils/compress';

describe('resolveCompressLevel', () => {
  it('keeps Hyper levels', () => {
    for (const level of COMPRESS_LEVELS) {
      expect(resolveCompressLevel(level)).toBe(level);
    }
  });

  it('maps levels saved by older workflows', () => {
    expect(resolveCompressLevel('light')).toBe('low');
    expect(resolveCompressLevel('balanced')).toBe('medium');
    expect(resolveCompressLevel('aggressive')).toBe('high');
    expect(resolveCompressLevel('extreme')).toBe('high');
  });

  it('falls back to medium for anything else', () => {
    expect(resolveCompressLevel('custom')).toBe('medium');
    expect(resolveCompressLevel('')).toBe('medium');
    expect(resolveCompressLevel('constructor')).toBe('medium');
  });
});

describe('matchHyperPreset', () => {
  it('recognises every preset', () => {
    for (const level of COMPRESS_LEVELS) {
      expect(
        matchHyperPreset(normalizeHyperOptions(HYPER_PRESETS[level]))
      ).toBe(level);
    }
  });

  it('ignores grayscale, PDF/A, Brotli and content protection toggles', () => {
    const options = normalizeHyperOptions({
      ...HYPER_PRESETS.high,
      grayscale: true,
      preserveConformance: true,
      brotli: true,
      rasterizeText: true,
      removeSignatures: true,
    });
    expect(matchHyperPreset(options)).toBe('high');
  });

  it('returns null once a preset option is changed', () => {
    const options = normalizeHyperOptions({
      ...HYPER_PRESETS.medium,
      imageQuality: 63,
    });
    expect(matchHyperPreset(options)).toBeNull();
  });
});

describe('applyHyperPreset', () => {
  it('swaps preset values but keeps the independent toggles', () => {
    const current = normalizeHyperOptions({
      ...HYPER_PRESETS.medium,
      imageQuality: 33,
      grayscale: true,
      preserveConformance: true,
      brotli: true,
      rasterizeText: true,
      removeSignatures: true,
    });
    const next = applyHyperPreset('low', current);
    expect(next.imageQuality).toBe(HYPER_PRESETS.low.imageQuality);
    expect(next.maxDpi).toBe(HYPER_PRESETS.low.maxDpi);
    expect(next.grayscale).toBe(true);
    expect(next.preserveConformance).toBe(true);
    expect(next.brotli).toBe(true);
    expect(next.rasterizeText).toBe(true);
    expect(next.removeSignatures).toBe(true);
    expect(matchHyperPreset(next)).toBe('low');
  });
});

describe('targetSizeToBytes', () => {
  it('converts KB and MB', () => {
    expect(targetSizeToBytes(100, 'kb')).toBe(102400);
    expect(targetSizeToBytes(1.5, 'mb')).toBe(1572864);
  });

  it('treats empty, zero, negative and tiny values as no target', () => {
    expect(targetSizeToBytes(Number(''), 'mb')).toBeUndefined();
    expect(targetSizeToBytes(0, 'kb')).toBeUndefined();
    expect(targetSizeToBytes(-5, 'kb')).toBeUndefined();
    expect(targetSizeToBytes(Number.NaN, 'kb')).toBeUndefined();
    expect(targetSizeToBytes(0.0001, 'kb')).toBeUndefined();
  });
});

function textBuffer(text: string): ArrayBuffer {
  return new TextEncoder().encode(text).buffer;
}

describe('hasPdfHeader', () => {
  it('finds the header at the start or within the first 1024 bytes', () => {
    expect(hasPdfHeader(textBuffer('%PDF-1.7\n'))).toBe(true);
    expect(hasPdfHeader(textBuffer(`${' '.repeat(500)}%PDF-1.4`))).toBe(true);
  });

  it('rejects empty files, other formats and late headers', () => {
    expect(hasPdfHeader(new ArrayBuffer(0))).toBe(false);
    expect(hasPdfHeader(textBuffer('PK zip archive'))).toBe(false);
    expect(hasPdfHeader(textBuffer(`${' '.repeat(1024)}%PDF-1.7`))).toBe(false);
  });
});

class FakeWorker {
  static instances: FakeWorker[] = [];
  onmessage: ((event: MessageEvent<HyperCompressResponse>) => void) | null =
    null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  onmessageerror: (() => void) | null = null;
  posted: { message: HyperCompressRequest; transfer: ArrayBuffer[] }[] = [];
  terminated = false;

  constructor() {
    FakeWorker.instances.push(this);
  }

  postMessage(message: HyperCompressRequest, transfer: ArrayBuffer[]) {
    this.posted.push({ message, transfer });
  }

  terminate() {
    this.terminated = true;
  }

  reply(message: HyperCompressResponse) {
    this.onmessage?.(new MessageEvent('message', { data: message }));
  }

  lastId(): number {
    return this.posted[this.posted.length - 1].message.id;
  }
}

const sampleResult: HyperWasmResult = {
  data: new Uint8Array([1, 2, 3]),
  originalSize: 10,
  compressedSize: 3,
  signed: false,
  signaturesRemoved: false,
  pdfa: null,
  pdfaOutcome: 'none',
  metTarget: null,
  warnings: [],
};

describe('Hyper worker bridge', () => {
  let bridge: typeof import('../js/utils/compress');

  beforeEach(async () => {
    FakeWorker.instances = [];
    vi.stubGlobal('Worker', FakeWorker);
    vi.resetModules();
    bridge = await import('../js/utils/compress');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('hands the PDF to the worker without copying and returns the result', async () => {
    const pdf = textBuffer('%PDF-1.7 body');
    const pending = bridge.compressWithHyper(pdf, { preset: 'high' });
    const worker = FakeWorker.instances[0];
    expect(worker.posted[0].transfer).toEqual([pdf]);
    expect(worker.posted[0].message).toMatchObject({
      type: 'compress',
      options: { preset: 'high' },
    });
    worker.reply({ id: worker.lastId(), type: 'result', result: sampleResult });
    await expect(pending).resolves.toBe(sampleResult);
  });

  it('reports a wrong password as decrypt_failed and keeps the worker', async () => {
    const pending = bridge.compressWithHyper(textBuffer('%PDF-1.7'), {
      password: 'nope',
    });
    const worker = FakeWorker.instances[0];
    worker.reply({
      id: worker.lastId(),
      type: 'error',
      code: 'decrypt_failed',
      message: 'wrong or missing password',
    });
    await expect(pending).rejects.toMatchObject({ code: 'decrypt_failed' });
    expect(worker.terminated).toBe(false);

    const next = bridge.verifyHyperPassword(textBuffer('%PDF-1.7'), 'x');
    expect(FakeWorker.instances).toHaveLength(1);
    worker.reply({ id: worker.lastId(), type: 'verified', valid: true });
    await expect(next).resolves.toBe(true);
  });

  it('starts a fresh worker after an engine error', async () => {
    const pending = bridge.compressWithHyper(textBuffer('%PDF-1.7'), {});
    const worker = FakeWorker.instances[0];
    worker.reply({
      id: worker.lastId(),
      type: 'error',
      code: 'engine_error',
      message: 'boom',
    });
    await expect(pending).rejects.toBeInstanceOf(HyperError);
    expect(worker.terminated).toBe(true);

    void bridge.verifyHyperPassword(textBuffer('%PDF-1.7'), '');
    expect(FakeWorker.instances).toHaveLength(2);
  });

  it('fails every pending job when the worker crashes', async () => {
    const first = bridge.compressWithHyper(textBuffer('%PDF-1.7'), {});
    const second = bridge.verifyHyperPassword(textBuffer('%PDF-1.7'), '');
    const worker = FakeWorker.instances[0];
    worker.onerror?.(new ErrorEvent('error', { message: 'out of memory' }));
    await expect(first).rejects.toMatchObject({
      code: 'engine_error',
      message: 'out of memory',
    });
    await expect(second).rejects.toMatchObject({ code: 'engine_error' });
    expect(worker.terminated).toBe(true);
  });

  it('rejects a file that is not a PDF without starting the engine', async () => {
    await expect(
      bridge.compressWithHyper(textBuffer('just text'), {})
    ).rejects.toMatchObject({ message: 'This file is not a valid PDF.' });
    expect(FakeWorker.instances).toHaveLength(0);
  });
});
