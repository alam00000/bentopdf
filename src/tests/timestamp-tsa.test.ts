import { describe, it, expect } from 'vitest';
import {
  TIMESTAMP_TSA_PRESETS,
  isAllowedTsaUrl,
  isValidTsaRequestUrl,
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

  it('should default to an allowed HTTPS authority for unproxied deployments', () => {
    const defaultUrl = TIMESTAMP_TSA_PRESETS[0].url;
    expect(new URL(defaultUrl).protocol).toBe('https:');
    expect(isAllowedTsaUrl(defaultUrl)).toBe(true);
  });

  it('should retain every provider URL and the remaining relative order', () => {
    expect(TIMESTAMP_TSA_PRESETS).toEqual([
      { label: 'FreeTSA', url: 'https://freetsa.org/tsr' },
      { label: 'DigiCert', url: 'http://timestamp.digicert.com' },
      { label: 'Sectigo', url: 'http://timestamp.sectigo.com' },
      { label: 'SSL.com', url: 'http://ts.ssl.com' },
      { label: 'MeSign', url: 'http://tsa.mesign.com' },
    ]);
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
