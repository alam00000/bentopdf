import type {
  HyperCompressOptions,
  HyperErrorCode,
  HyperWasmOptions,
  HyperWasmResult,
} from 'hyper-compress-wasm';

export type HyperCompressRequest =
  | {
      id: number;
      type: 'compress';
      bytes: ArrayBuffer;
      options: HyperWasmOptions;
    }
  | { id: number; type: 'verify'; bytes: ArrayBuffer; password: string };

export type HyperCompressResponse =
  | { id: number; type: 'result'; result: HyperWasmResult }
  | { id: number; type: 'verified'; valid: boolean }
  | { id: number; type: 'error'; code: HyperErrorCode; message: string };

export type CompressLockStatus =
  | 'checking'
  | 'open'
  | 'locked'
  | 'wrong'
  | 'unlocked';

export interface CompressFileLock {
  status: CompressLockStatus;
  password: string;
  attempt: number;
}

export interface CompressPasswordField {
  root: HTMLElement;
  input: HTMLInputElement;
  status: HTMLElement;
  lockIcon: HTMLElement;
  unlockIcon: HTMLElement;
}

interface HyperOptionFieldBase {
  key: keyof HyperCompressOptions;
  label: string;
  help?: string;
}

export type HyperOptionField =
  | (HyperOptionFieldBase & { type: 'bool' })
  | (HyperOptionFieldBase & { type: 'number'; min: number; max: number })
  | (HyperOptionFieldBase & { type: 'dpi' });

export interface HyperOptionSection {
  title: string;
  open?: boolean;
  fields: HyperOptionField[];
}
