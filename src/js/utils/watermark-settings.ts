import type { PageWatermarkConfig } from '@/types';
import {
  getStoredItem,
  removeStoredItem,
  setStoredItem,
} from './safe-storage.js';

export const WATERMARK_SETTINGS_KEY = 'bentopdf.watermarkSettings';

// Image watermarks are left out: a data URL can exceed the storage quota and
// the File object cannot be serialized, so the image is re-picked each time.
const NUMBER_FIELDS = [
  'tileGapX',
  'tileGapY',
  'x',
  'y',
  'fontSize',
  'opacityText',
  'angleText',
  'imageScale',
  'opacityImage',
  'angleImage',
] as const;

export function serializeWatermarkSettings(
  config: PageWatermarkConfig
): string {
  const settings: Record<string, unknown> = {
    type: config.type,
    layout: config.layout,
    text: config.text,
    color: config.color,
  };
  for (const field of NUMBER_FIELDS) settings[field] = config[field];
  return JSON.stringify(settings);
}

export function parseWatermarkSettings(
  raw: string | null,
  defaults: PageWatermarkConfig
): PageWatermarkConfig | null {
  if (!raw) return null;

  let stored: unknown;
  try {
    stored = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!stored || typeof stored !== 'object') return null;
  const data = stored as Record<string, unknown>;

  const config: PageWatermarkConfig = {
    ...defaults,
    imageDataUrl: null,
    imageFile: null,
  };

  if (data.type === 'text' || data.type === 'image') config.type = data.type;
  if (data.layout === 'single' || data.layout === 'tile') {
    config.layout = data.layout;
  }
  if (typeof data.text === 'string') config.text = data.text;
  if (typeof data.color === 'string' && /^#[0-9a-f]{6}$/i.test(data.color)) {
    config.color = data.color;
  }
  for (const field of NUMBER_FIELDS) {
    const value = data[field];
    if (typeof value === 'number' && Number.isFinite(value)) {
      config[field] = value;
    }
  }
  config.x = Math.min(1, Math.max(0, config.x));
  config.y = Math.min(1, Math.max(0, config.y));

  return config;
}

export function saveWatermarkSettings(config: PageWatermarkConfig): void {
  setStoredItem(WATERMARK_SETTINGS_KEY, serializeWatermarkSettings(config));
}

export function loadWatermarkSettings(
  defaults: PageWatermarkConfig
): PageWatermarkConfig | null {
  return parseWatermarkSettings(
    getStoredItem(WATERMARK_SETTINGS_KEY),
    defaults
  );
}

export function hasWatermarkSettings(): boolean {
  return getStoredItem(WATERMARK_SETTINGS_KEY) !== null;
}

export function clearWatermarkSettings(): void {
  removeStoredItem(WATERMARK_SETTINGS_KEY);
}
