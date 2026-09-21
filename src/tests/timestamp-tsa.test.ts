import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  DEFAULT_TIMESTAMP_TSA_PRESETS,
  TIMESTAMP_TSA_PRESETS,
  isAllowedTsaUrl,
  isValidTsaRequestUrl,
  parseTsaEndpoints,
  resolveTimestampTsaPresets,
  type TimestampTsaPreset,
} from '@/js/config/timestamp-tsa';

describe('Timestamp TSA Presets', () => {
  it('should be a non-empty array', () => {
    expect(Array.isArray(TIMESTAMP_TSA_PRESETS)).toBe(true);
    expect(TIMESTAMP_TSA_PRESETS.length).toBeGreaterThan(0);
  });

  it('should contain only objects with label and url strings', () => {
    for (const preset of TIMESTAMP_TSA_PRESETS) {
      expect(typeof preset.label).toBe('string');
      expect(preset.label.length).toBeGreaterThan(0);
      expect(typeof preset.url).toBe('string');
      expect(preset.url.length).toBeGreaterThan(0);
    }
  });

  it('should have unique labels', () => {
    const labels = TIMESTAMP_TSA_PRESETS.map((p) => p.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('should have unique URLs', () => {
    const urls = TIMESTAMP_TSA_PRESETS.map((p) => p.url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('should have valid URL formats', () => {
    for (const preset of TIMESTAMP_TSA_PRESETS) {
      expect(() => new URL(preset.url)).not.toThrow();
    }
  });

  it('should include well-known TSA providers', () => {
    const labels = TIMESTAMP_TSA_PRESETS.map((p) => p.label);
    expect(labels).toContain('DigiCert');
    expect(labels).toContain('Sectigo');
  });

  it('should satisfy the TimestampTsaPreset interface', () => {
    const preset: TimestampTsaPreset = TIMESTAMP_TSA_PRESETS[0];
    expect(preset).toHaveProperty('label');
    expect(preset).toHaveProperty('url');
  });
});

describe('isAllowedTsaUrl', () => {
  it('accepts every built-in preset URL', () => {
    for (const preset of TIMESTAMP_TSA_PRESETS) {
      expect(isAllowedTsaUrl(preset.url)).toBe(true);
    }
  });

  it('rejects arbitrary attacker-controlled hosts', () => {
    expect(isAllowedTsaUrl('https://attacker.example.com/steal-tsr')).toBe(
      false
    );
    expect(isAllowedTsaUrl('http://attacker.example.com')).toBe(false);
  });

  it('rejects look-alike hosts that merely contain a preset host', () => {
    expect(isAllowedTsaUrl('https://timestamp.digicert.com.attacker.com')).toBe(
      false
    );
    expect(isAllowedTsaUrl('https://freetsa.org.attacker.com/tsr')).toBe(false);
  });

  it('rejects userinfo tricks that resolve to another host', () => {
    expect(isAllowedTsaUrl('https://freetsa.org@attacker.com')).toBe(false);
  });

  it('rejects non-http(s) schemes and non-string values', () => {
    expect(isAllowedTsaUrl('javascript:alert(1)')).toBe(false);
    expect(isAllowedTsaUrl('file:///etc/passwd')).toBe(false);
    expect(isAllowedTsaUrl('data:text/plain,hi')).toBe(false);
    expect(isAllowedTsaUrl('not a url')).toBe(false);
    expect(isAllowedTsaUrl(null)).toBe(false);
    expect(isAllowedTsaUrl(undefined)).toBe(false);
    expect(isAllowedTsaUrl(1234)).toBe(false);
    expect(isAllowedTsaUrl({ url: 'https://freetsa.org/tsr' })).toBe(false);
  });
});

describe('isValidTsaRequestUrl', () => {
  it('accepts well-formed http and https URLs', () => {
    expect(isValidTsaRequestUrl('http://timestamp.digicert.com')).toBe(true);
    expect(isValidTsaRequestUrl('https://tsa.example.org/tsr')).toBe(true);
  });

  it('rejects dangerous schemes, malformed input, and non-strings', () => {
    expect(isValidTsaRequestUrl('javascript:alert(1)')).toBe(false);
    expect(isValidTsaRequestUrl('data:text/plain,hi')).toBe(false);
    expect(isValidTsaRequestUrl('file:///etc/passwd')).toBe(false);
    expect(isValidTsaRequestUrl('')).toBe(false);
    expect(isValidTsaRequestUrl('   ')).toBe(false);
    expect(isValidTsaRequestUrl(42)).toBe(false);
    expect(isValidTsaRequestUrl(null)).toBe(false);
  });
});

describe('parseTsaEndpoints', () => {
  it('returns an empty list when nothing is configured', () => {
    expect(parseTsaEndpoints(undefined)).toEqual([]);
    expect(parseTsaEndpoints('')).toEqual([]);
    expect(parseTsaEndpoints('   ')).toEqual([]);
    expect(parseTsaEndpoints(',, ,')).toEqual([]);
  });

  it('labels a bare URL with its hostname', () => {
    expect(parseTsaEndpoints('https://tsa.example.org/tsr')).toEqual([
      { label: 'tsa.example.org', url: 'https://tsa.example.org/tsr' },
    ]);
  });

  it('accepts "Label=URL" entries and keeps the given label', () => {
    expect(parseTsaEndpoints('My TSA=https://tsa.example.org/tsr')).toEqual([
      { label: 'My TSA', url: 'https://tsa.example.org/tsr' },
    ]);
  });

  it('parses several comma-separated entries and trims whitespace', () => {
    expect(
      parseTsaEndpoints(
        ' A=https://a.example.org/tsr , https://b.example.org , '
      )
    ).toEqual([
      { label: 'A', url: 'https://a.example.org/tsr' },
      { label: 'b.example.org', url: 'https://b.example.org' },
    ]);
  });

  it('drops duplicate URLs, keeping the first entry', () => {
    expect(
      parseTsaEndpoints(
        'First=https://tsa.example.org/tsr,Second=https://tsa.example.org/tsr'
      )
    ).toEqual([{ label: 'First', url: 'https://tsa.example.org/tsr' }]);
  });

  it('skips malformed and non-http(s) entries with a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      expect(
        parseTsaEndpoints(
          'not a url,javascript:alert(1),file:///etc/passwd,https://ok.example.org'
        )
      ).toEqual([{ label: 'ok.example.org', url: 'https://ok.example.org' }]);
      expect(warn).toHaveBeenCalledTimes(3);
    } finally {
      warn.mockRestore();
    }
  });
});

describe('resolveTimestampTsaPresets', () => {
  it('falls back to the built-in providers when unset', () => {
    expect(resolveTimestampTsaPresets({})).toEqual([
      ...DEFAULT_TIMESTAMP_TSA_PRESETS,
    ]);
    expect(resolveTimestampTsaPresets({ VITE_TSA_ENDPOINTS: '' })).toEqual([
      ...DEFAULT_TIMESTAMP_TSA_PRESETS,
    ]);
  });

  it('falls back to the built-in providers when every entry is unusable', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      expect(
        resolveTimestampTsaPresets({ VITE_TSA_ENDPOINTS: 'nonsense' })
      ).toEqual([...DEFAULT_TIMESTAMP_TSA_PRESETS]);
    } finally {
      warn.mockRestore();
    }
  });

  it('replaces the built-in providers when configured', () => {
    expect(
      resolveTimestampTsaPresets({
        VITE_TSA_ENDPOINTS: 'Mine=https://tsa.example.org/tsr',
      })
    ).toEqual([{ label: 'Mine', url: 'https://tsa.example.org/tsr' }]);
  });

  it('does not hand out the shared default objects', () => {
    const resolved = resolveTimestampTsaPresets({});
    resolved[0].label = 'mutated';
    expect(DEFAULT_TIMESTAMP_TSA_PRESETS[0].label).not.toBe('mutated');
  });
});

describe('configured TSA endpoints at module scope', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('drives the preset list and the import allow-list together', async () => {
    vi.stubEnv('VITE_TSA_ENDPOINTS', 'Mine=https://tsa.example.org/tsr');
    vi.resetModules();
    const freshModule = await import('@/js/config/timestamp-tsa');

    expect(freshModule.TIMESTAMP_TSA_PRESETS).toEqual([
      { label: 'Mine', url: 'https://tsa.example.org/tsr' },
    ]);
    // A workflow saved against the configured TSA must survive sanitization...
    expect(freshModule.isAllowedTsaUrl('https://tsa.example.org/tsr')).toBe(
      true
    );
    // ...while providers this build no longer offers are rejected.
    expect(freshModule.isAllowedTsaUrl('http://timestamp.digicert.com')).toBe(
      false
    );
  });
});
