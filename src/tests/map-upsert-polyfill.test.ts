import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type MapWithUpsert<K, V> = Map<K, V> & {
  getOrInsert(key: K, value: V): V;
  getOrInsertComputed(key: K, callback: (key: K) => V): V;
};

const getOrInsertDescriptor = Object.getOwnPropertyDescriptor(
  Map.prototype,
  'getOrInsert'
);
const getOrInsertComputedDescriptor = Object.getOwnPropertyDescriptor(
  Map.prototype,
  'getOrInsertComputed'
);

const restoreMethod = (
  name: 'getOrInsert' | 'getOrInsertComputed',
  descriptor: PropertyDescriptor | undefined
) => {
  if (descriptor) {
    Object.defineProperty(Map.prototype, name, descriptor);
  } else {
    Reflect.deleteProperty(Map.prototype, name);
  }
};

const importPolyfill = async () => {
  await import('../js/utils/map-upsert-polyfill');
};

describe('Map upsert polyfill', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    restoreMethod('getOrInsert', getOrInsertDescriptor);
    restoreMethod('getOrInsertComputed', getOrInsertComputedDescriptor);
    vi.resetModules();
  });

  it('preserves an existing native implementation', async () => {
    const nativeImplementation = vi.fn();
    Object.defineProperty(Map.prototype, 'getOrInsertComputed', {
      configurable: true,
      writable: true,
      value: nativeImplementation,
    });

    await importPolyfill();

    expect(
      Object.getOwnPropertyDescriptor(Map.prototype, 'getOrInsertComputed')
        ?.value
    ).toBe(nativeImplementation);
  });

  it('installs getOrInsertComputed when it is missing', async () => {
    Reflect.deleteProperty(Map.prototype, 'getOrInsertComputed');

    await importPolyfill();

    const descriptor = Object.getOwnPropertyDescriptor(
      Map.prototype,
      'getOrInsertComputed'
    );
    expect(typeof descriptor?.value).toBe('function');
    expect(descriptor?.enumerable).toBe(false);
  });

  it('returns an existing value without invoking the callback', async () => {
    Reflect.deleteProperty(Map.prototype, 'getOrInsertComputed');
    await importPolyfill();
    const map = new Map([['key', 'cached']]) as MapWithUpsert<string, string>;
    const callback = vi.fn(() => 'computed');

    expect(map.getOrInsertComputed('key', callback)).toBe('cached');
    expect(callback).not.toHaveBeenCalled();
  });

  it('computes, stores, and returns a missing value', async () => {
    Reflect.deleteProperty(Map.prototype, 'getOrInsertComputed');
    await importPolyfill();
    const map = new Map<string, string>() as MapWithUpsert<string, string>;
    const callback = vi.fn((key: string) => `${key}-value`);

    expect(map.getOrInsertComputed('missing', callback)).toBe('missing-value');
    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith('missing');
    expect(map.get('missing')).toBe('missing-value');
  });

  it('installs getOrInsert with matching get-or-insert behavior', async () => {
    Reflect.deleteProperty(Map.prototype, 'getOrInsert');
    await importPolyfill();
    const map = new Map([['existing', 'cached']]) as MapWithUpsert<
      string,
      string
    >;

    expect(map.getOrInsert('existing', 'replacement')).toBe('cached');
    expect(map.getOrInsert('missing', 'inserted')).toBe('inserted');
    expect(map.get('missing')).toBe('inserted');
  });

  it('loads before PDF.js so render can use the methods', () => {
    const mainSource = readFileSync(
      new URL('../js/main.ts', import.meta.url),
      'utf8'
    );
    const polyfillImport = "import './utils/map-upsert-polyfill.js';";
    const pdfjsImport = "import * as pdfjsLib from 'pdfjs-dist';";

    expect(mainSource.startsWith(polyfillImport)).toBe(true);
    expect(mainSource.indexOf(polyfillImport)).toBeLessThan(
      mainSource.indexOf(pdfjsImport)
    );
  });
});
