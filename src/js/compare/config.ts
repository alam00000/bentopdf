export const COMPARE_COLORS = {
  added: { r: 34, g: 197, b: 94 },
  removed: { r: 239, g: 68, b: 68 },
  modified: { r: 245, g: 158, b: 11 },
  moved: { r: 168, g: 85, b: 247 },
  'style-changed': { r: 59, g: 130, b: 246 },
} as const;

export const HIGHLIGHT_OPACITY = 0.28;

export const COMPARE_GEOMETRY = {
  LINE_TOLERANCE_FACTOR: 0.6,
  MIN_LINE_TOLERANCE: 4,
  FOCUS_REGION_PADDING: 40,
  FOCUS_REGION_MIN_WIDTH: 320,
  FOCUS_REGION_MIN_HEIGHT: 200,
} as const;

export const COMPARE_RENDER = {
  OFFLINE_SCALE: 1.2,
  MAX_SCALE_OVERLAY: 2.5,
  MAX_SCALE_SIDE: 2.0,
  EXPORT_EXTRACT_SCALE: 1.0,
  SPLIT_GAP_PT: 2,
} as const;

export const COMPARE_TEXT = {
  DEFAULT_CHAR_WIDTH: 1,
  DEFAULT_SPACE_WIDTH: 0.33,
} as const;

export const VISUAL_DIFF = {
  PIXELMATCH_THRESHOLD: 0.12,
  ALPHA: 0.2,
  DIFF_COLOR: [239, 68, 68] as readonly [number, number, number],
  DIFF_COLOR_ALT: [34, 197, 94] as readonly [number, number, number],
} as const;

export const COMPARE_CACHE_MAX_SIZE = 50;
