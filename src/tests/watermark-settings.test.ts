import { describe, it, expect, beforeEach } from 'vitest';
import type { PageWatermarkConfig } from '@/types';
import {
  WATERMARK_SETTINGS_KEY,
  clearWatermarkSettings,
  hasWatermarkSettings,
  loadWatermarkSettings,
  parseWatermarkSettings,
  saveWatermarkSettings,
  serializeWatermarkSettings,
} from '@/js/utils/watermark-settings';

const defaults: PageWatermarkConfig = {
  type: 'text',
  layout: 'single',
  tileGapX: 25,
  tileGapY: 75,
  x: 0.5,
  y: 0.5,
  text: '',
  fontSize: 72,
  color: '#888888',
  opacityText: 0.3,
  angleText: -45,
  imageDataUrl: null,
  imageFile: null,
  imageScale: 100,
  opacityImage: 0.3,
  angleImage: 0,
};

const custom: PageWatermarkConfig = {
  ...defaults,
  type: 'image',
  layout: 'tile',
  tileGapX: 40,
  x: 0.2,
  y: 0.9,
  text: 'CONFIDENTIAL',
  fontSize: 48,
  color: '#ff0000',
  opacityText: 0.6,
  angleText: 30,
  imageDataUrl: 'data:image/png;base64,AAAA',
  imageFile: new File(['x'], 'logo.png', { type: 'image/png' }),
  imageScale: 150,
};

describe('serializeWatermarkSettings', () => {
  it('should leave out the image data', () => {
    const stored = JSON.parse(serializeWatermarkSettings(custom));
    expect(stored).not.toHaveProperty('imageDataUrl');
    expect(stored).not.toHaveProperty('imageFile');
    expect(stored.text).toBe('CONFIDENTIAL');
  });
});

describe('parseWatermarkSettings', () => {
  it('should restore every saved setting', () => {
    const restored = parseWatermarkSettings(
      serializeWatermarkSettings(custom),
      defaults
    );
    expect(restored).toEqual({
      ...custom,
      imageDataUrl: null,
      imageFile: null,
    });
  });

  it('should return null when nothing is stored or the data is unreadable', () => {
    expect(parseWatermarkSettings(null, defaults)).toBeNull();
    expect(parseWatermarkSettings('not json', defaults)).toBeNull();
    expect(parseWatermarkSettings('42', defaults)).toBeNull();
  });

  it('should fall back to defaults for missing or invalid fields', () => {
    const restored = parseWatermarkSettings(
      JSON.stringify({
        text: 'DRAFT',
        type: 'video',
        layout: 'grid',
        color: 'red',
        fontSize: 'big',
        angleText: Number.NaN,
      }),
      defaults
    );
    expect(restored).toEqual({ ...defaults, text: 'DRAFT' });
  });

  it('should keep the position on the page', () => {
    const restored = parseWatermarkSettings(
      JSON.stringify({ x: -3, y: 7 }),
      defaults
    );
    expect(restored?.x).toBe(0);
    expect(restored?.y).toBe(1);
  });
});

describe('save, load and clear', () => {
  beforeEach(() => localStorage.clear());

  it('should round-trip through localStorage', () => {
    saveWatermarkSettings(custom);
    expect(localStorage.getItem(WATERMARK_SETTINGS_KEY)).not.toBeNull();
    expect(loadWatermarkSettings(defaults)?.text).toBe('CONFIDENTIAL');
  });

  it('should forget the settings after clearing', () => {
    saveWatermarkSettings(custom);
    clearWatermarkSettings();
    expect(loadWatermarkSettings(defaults)).toBeNull();
  });

  it('should report whether settings are saved', () => {
    expect(hasWatermarkSettings()).toBe(false);
    saveWatermarkSettings(custom);
    expect(hasWatermarkSettings()).toBe(true);
    clearWatermarkSettings();
    expect(hasWatermarkSettings()).toBe(false);
  });
});
