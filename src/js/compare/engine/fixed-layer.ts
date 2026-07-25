import type { CompareTextItem } from '../types.ts';
import { COMPARE_FURNITURE } from '../config.ts';

const RAD_TO_DEG = 180 / Math.PI;

export function lineAngleDeg(radians: number): number {
  let deg = (radians * RAD_TO_DEG) % 180;
  if (deg < 0) deg += 180;
  return deg;
}

export function angularDistanceDeg(a: number, b: number): number {
  const diff = Math.abs(a - b) % 180;
  return Math.min(diff, 180 - diff);
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export interface ItemLayerSignal {
  scale: number;
  angleDeg: number;
  insideArtifact: boolean;
}

export function classifyItemLayers(
  signals: ItemLayerSignal[]
): Array<'body' | 'background'> {
  if (signals.length === 0) return [];

  const bodySignals = signals.filter((s) => !s.insideArtifact);
  const scalePool = (bodySignals.length ? bodySignals : signals).map(
    (s) => s.scale
  );
  const anglePool = (bodySignals.length ? bodySignals : signals).map(
    (s) => s.angleDeg
  );
  const medianScale = median(scalePool);
  const dominantAngle = median(anglePool);

  return signals.map((s) => {
    if (s.insideArtifact) return 'background';
    if (
      medianScale > 0 &&
      s.scale > medianScale * COMPARE_FURNITURE.FONT_SCALE_OUTLIER
    ) {
      return 'background';
    }
    if (
      angularDistanceDeg(s.angleDeg, dominantAngle) >
      COMPARE_FURNITURE.ROTATION_TOLERANCE_DEG
    ) {
      return 'background';
    }
    return 'body';
  });
}

export function itemPositionKey(
  item: CompareTextItem,
  quantize: number = COMPARE_FURNITURE.POSITION_QUANTIZE
): string {
  const qx = Math.round(item.rect.x / quantize);
  const qy = Math.round(item.rect.y / quantize);
  return `${qx}:${qy}:${item.normalizedText}`;
}

export function repeatedItemKeys(
  pages: Array<{ textItems: CompareTextItem[] }>
): Set<string> {
  const pageCount = pages.length;
  const threshold = Math.max(
    COMPARE_FURNITURE.REPEAT_MIN_PAGES,
    Math.ceil(pageCount * COMPARE_FURNITURE.REPEAT_PAGE_FRACTION)
  );

  const keyPages = new Map<string, Set<number>>();
  pages.forEach((page, pageIndex) => {
    const seen = new Set<string>();
    for (const item of page.textItems) {
      const key = itemPositionKey(item);
      if (seen.has(key)) continue;
      seen.add(key);
      let set = keyPages.get(key);
      if (!set) {
        set = new Set();
        keyPages.set(key, set);
      }
      set.add(pageIndex);
    }
  });

  const repeated = new Set<string>();
  for (const [key, set] of keyPages) {
    if (set.size >= threshold) repeated.add(key);
  }
  return repeated;
}
