import {
  HYPER_PRESETS,
  HyperError,
  normalizeHyperOptions,
} from 'hyper-compress-wasm';
import type {
  CompressLevel,
  HyperCompressOptions,
  HyperWasmOptions,
  HyperWasmResult,
} from 'hyper-compress-wasm';
import type { HyperCompressRequest, HyperCompressResponse } from '@/types';

import { trText } from '../i18n/i18n.js';

export const COMPRESS_LEVELS: readonly CompressLevel[] = [
  'low',
  'medium',
  'high',
  'lossless',
];

const LEGACY_LEVELS: Record<string, CompressLevel> = {
  light: 'low',
  balanced: 'medium',
  aggressive: 'high',
  extreme: 'high',
};

const PRESET_INDEPENDENT_OPTIONS: ReadonlySet<keyof HyperCompressOptions> =
  new Set([
    'grayscale',
    'preserveConformance',
    'brotli',
    'rasterizeText',
    'removeSignatures',
  ]);

export function resolveCompressLevel(value: string): CompressLevel {
  return (
    COMPRESS_LEVELS.find((level) => level === value) ??
    (Object.hasOwn(LEGACY_LEVELS, value) ? LEGACY_LEVELS[value] : 'medium')
  );
}

export function applyHyperPreset(
  level: CompressLevel,
  current: HyperCompressOptions
): HyperCompressOptions {
  return normalizeHyperOptions({
    ...HYPER_PRESETS[level],
    grayscale: current.grayscale,
    preserveConformance: current.preserveConformance,
    brotli: current.brotli,
    rasterizeText: current.rasterizeText,
    removeSignatures: current.removeSignatures,
  });
}

export function matchHyperPreset(
  options: HyperCompressOptions
): CompressLevel | null {
  return (
    COMPRESS_LEVELS.find((level) => {
      const preset = normalizeHyperOptions(HYPER_PRESETS[level]);
      return (Object.keys(preset) as (keyof HyperCompressOptions)[]).every(
        (key) =>
          PRESET_INDEPENDENT_OPTIONS.has(key) || preset[key] === options[key]
      );
    }) ?? null
  );
}

export function hasPdfHeader(head: ArrayBuffer): boolean {
  const bytes = new Uint8Array(head, 0, Math.min(head.byteLength, 1024));
  return new TextDecoder('latin1').decode(bytes).includes('%PDF-');
}

export function targetSizeToBytes(
  value: number,
  unit: string
): number | undefined {
  if (!Number.isFinite(value) || value <= 0) return undefined;
  const bytes = Math.floor(value * (unit === 'kb' ? 1024 : 1024 * 1024));
  return bytes >= 1 ? bytes : undefined;
}

let hyperWorker: Worker | null = null;
let nextHyperJobId = 0;
const hyperJobs = new Map<
  number,
  {
    resolve: (message: HyperCompressResponse) => void;
    reject: (err: Error) => void;
  }
>();

function discardHyperWorker(worker: Worker, error?: Error): void {
  worker.terminate();
  if (hyperWorker === worker) hyperWorker = null;
  if (!error) return;
  for (const job of hyperJobs.values()) job.reject(error);
  hyperJobs.clear();
}

function getHyperWorker(): Worker {
  if (hyperWorker) return hyperWorker;
  const worker = new Worker(
    new URL('./hyper-compress.worker.ts', import.meta.url),
    { type: 'module' }
  );
  worker.onmessage = (e: MessageEvent<HyperCompressResponse>) => {
    const message = e.data;
    const job = hyperJobs.get(message.id);
    if (!job) return;
    hyperJobs.delete(message.id);
    if (message.type !== 'error') {
      job.resolve(message);
      return;
    }
    job.reject(new HyperError(message.code, message.message));
    if (message.code === 'engine_error' && hyperJobs.size === 0) {
      discardHyperWorker(worker);
    }
  };
  worker.onerror = (e: ErrorEvent) => {
    e.preventDefault();
    discardHyperWorker(
      worker,
      new HyperError(
        'engine_error',
        e.message || trText('The compression engine stopped unexpectedly.')
      )
    );
  };
  worker.onmessageerror = () => {
    discardHyperWorker(
      worker,
      new HyperError(
        'engine_error',
        trText('The compression engine returned an unreadable result.')
      )
    );
  };
  hyperWorker = worker;
  return worker;
}

function postToHyper(
  build: (id: number) => HyperCompressRequest,
  transfer: ArrayBuffer
): Promise<HyperCompressResponse> {
  const worker = getHyperWorker();
  const id = ++nextHyperJobId;
  return new Promise((resolve, reject) => {
    hyperJobs.set(id, { resolve, reject });
    worker.postMessage(build(id), [transfer]);
  });
}

export async function compressWithHyper(
  pdf: ArrayBuffer,
  options: HyperWasmOptions
): Promise<HyperWasmResult> {
  if (!hasPdfHeader(pdf)) {
    throw new HyperError(
      'engine_error',
      trText('This file is not a valid PDF.')
    );
  }
  const message = await postToHyper(
    (id) => ({ id, type: 'compress', bytes: pdf, options }),
    pdf
  );
  if (message.type !== 'result') {
    throw new HyperError(
      'engine_error',
      trText('Unexpected reply from the engine.')
    );
  }
  return message.result;
}

export async function verifyHyperPassword(
  pdf: ArrayBuffer,
  password: string
): Promise<boolean> {
  const message = await postToHyper(
    (id) => ({ id, type: 'verify', bytes: pdf, password }),
    pdf
  );
  if (message.type !== 'verified') {
    throw new HyperError(
      'engine_error',
      trText('Unexpected reply from the engine.')
    );
  }
  return message.valid;
}
