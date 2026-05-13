import type { UserConfig } from 'vite';
import { afterEach, describe, expect, it } from 'vitest';
import viteConfig from '../../vite.config';

const ORIGINAL_ENV = { ...process.env };

function loadConfig(): UserConfig {
  if (typeof viteConfig !== 'function') {
    throw new Error('Expected Vite config to export a config factory');
  }

  return viteConfig({
    command: 'serve',
    mode: 'test',
    isPreview: false,
    isSsrBuild: false,
  });
}

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('Vite devcontainer host binding', () => {
  it('binds dev and preview servers to all interfaces by default', () => {
    delete process.env.VITE_DEV_HOST;
    delete process.env.VITE_PREVIEW_HOST;

    const config = loadConfig();

    expect(config.server?.host).toBe('0.0.0.0');
    expect(config.preview?.host).toBe('0.0.0.0');
  });

  it('allows host overrides for loopback-only development', () => {
    process.env.VITE_DEV_HOST = 'localhost';
    process.env.VITE_PREVIEW_HOST = 'localhost';

    const config = loadConfig();

    expect(config.server?.host).toBe('localhost');
    expect(config.preview?.host).toBe('localhost');
  });
});

describe('Vite dependency optimizer defaults', () => {
  it('keeps JSZip pre-bundled for default dev server entries', () => {
    delete process.env.VITE_ENABLE_DEP_OPTIMIZER;

    const config = loadConfig();

    expect(config.optimizeDeps).toMatchObject({
      noDiscovery: true,
      include: ['jszip'],
    });
  });
});
