export interface OcrWord {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  confidence: number;
}

export interface OcrState {
  file: File | null;
  searchablePdfBytes: Uint8Array | null;
}

export interface BBox {
  x0: number; // left
  y0: number; // top (in hOCR coordinate system, origin at top-left)
  x1: number; // right
  y1: number; // bottom
}

export interface Baseline {
  slope: number;
  intercept: number;
}

export interface OcrLine {
  bbox: BBox;
  baseline: Baseline;
  textangle: number;
  words: OcrWord[];
  direction: 'ltr' | 'rtl';
  injectWordBreaks: boolean;
}

export interface OcrPage {
  width: number;
  height: number;
  dpi: number;
  lines: OcrLine[];
}

export interface WordTransform {
  x: number;
  y: number;
  fontSize: number;
  horizontalScale: number;
  rotation: number;
}
