import { describe, it, expect } from 'vitest';
import {
  TIMESTAMP_TSA_PRESETS,
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
