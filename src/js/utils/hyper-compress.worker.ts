import { compress, verifyPassword, HyperError } from 'hyper-compress-wasm';
import type { HyperCompressRequest, HyperCompressResponse } from '@/types';

const ENCRYPT_KEY = new TextEncoder().encode('/Encrypt');

function hasEncryptKey(bytes: Uint8Array): boolean {
  for (
    let i = bytes.indexOf(ENCRYPT_KEY[0]);
    i !== -1;
    i = bytes.indexOf(ENCRYPT_KEY[0], i + 1)
  ) {
    if (ENCRYPT_KEY.every((byte, j) => bytes[i + j] === byte)) return true;
  }
  return false;
}

async function opensWith(
  input: Uint8Array,
  password: string
): Promise<boolean> {
  return !hasEncryptKey(input) || verifyPassword(input, password);
}

self.onmessage = async (e: MessageEvent<HyperCompressRequest>) => {
  const request = e.data;
  const { id } = request;
  try {
    const input = new Uint8Array(request.bytes);
    if (request.type === 'verify') {
      const response: HyperCompressResponse = {
        id,
        type: 'verified',
        valid: await opensWith(input, request.password),
      };
      self.postMessage(response);
      return;
    }
    const { options } = request;
    const result = await compress(input, options);
    if (
      !result.signed &&
      result.compressedSize === result.originalSize &&
      !options.password &&
      !(await opensWith(input, ''))
    ) {
      throw new HyperError('decrypt_failed', 'wrong or missing password');
    }
    const response: HyperCompressResponse = { id, type: 'result', result };
    self.postMessage(response, { transfer: [result.data.buffer] });
  } catch (err) {
    const response: HyperCompressResponse = {
      id,
      type: 'error',
      code: err instanceof HyperError ? err.code : 'engine_error',
      message: err instanceof Error ? err.message : String(err),
    };
    self.postMessage(response);
  }
};
