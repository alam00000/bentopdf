import type * as pdfjsLib from 'pdfjs-dist';
import type { LRUCache } from './lru-cache.ts';

export type CompareViewMode = 'overlay' | 'side-by-side';

export type ComparePdfExportMode = 'split' | 'alternating' | 'left' | 'right';

export interface RenderedPage {
  model: ComparePageModel | null;
  exists: boolean;
}

export interface ComparisonPageLoad {
  model: ComparePageModel | null;
  exists: boolean;
}

export interface DiffFocusRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OcrCacheEntry {
  model: ComparePageModel;
  width: number;
  height: number;
}

export interface CompareCaches {
  pageModelCache: LRUCache<string, ComparePageModel>;
  comparisonCache: LRUCache<string, ComparePageResult>;
  comparisonResultsCache: LRUCache<number, ComparePageResult>;
  ocrModelCache: LRUCache<string, OcrCacheEntry>;
}

export interface CompareRenderContext {
  useOcr: boolean;
  ocrLanguage: string;
  viewMode: CompareViewMode;
  zoomLevel: number;
  showLoader: (message: string, percent?: number) => void;
}

export interface CompareRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CharPosition {
  x: number;
  width: number;
}

export interface CompareWordToken {
  word: string;
  compareWord: string;
  rect: CompareRectangle;
  joinsWithPrevious?: boolean;
  fontName?: string;
  fontSize?: number;
}

export interface CompareTextItem {
  id: string;
  text: string;
  normalizedText: string;
  rect: CompareRectangle;
  fragments?: CompareTextItem[];
  charMap?: CharPosition[];
  wordTokens?: CompareWordToken[];
}

export interface ComparePageModel {
  pageNumber: number;
  width: number;
  height: number;
  textItems: CompareTextItem[];
  plainText: string;
  hasText: boolean;
  source: 'pdfjs' | 'ocr';
  annotations?: CompareAnnotation[];
  images?: CompareImageRef[];
}

export interface CompareAnnotation {
  id: string;
  subtype: string;
  rect: CompareRectangle;
  contents: string;
  title: string;
  color: string;
}

export interface CompareImageRef {
  id: string;
  rect: CompareRectangle;
  width: number;
  height: number;
}

export interface ComparePageSignature {
  pageNumber: number;
  plainText: string;
  hasText: boolean;
  tokenItems: CompareTextItem[];
}

export interface ComparePagePair {
  pairIndex: number;
  leftPageNumber: number | null;
  rightPageNumber: number | null;
  confidence: number;
}

export interface CompareVisualDiff {
  mismatchPixels: number;
  mismatchRatio: number;
  hasDiff: boolean;
}

export type CompareChangeType =
  | 'added'
  | 'removed'
  | 'modified'
  | 'moved'
  | 'style-changed'
  | 'page-added'
  | 'page-removed';

export type CompareContentCategory =
  | 'text'
  | 'image'
  | 'header-footer'
  | 'annotation'
  | 'formatting'
  | 'background';

export interface CompareTextChange {
  id: string;
  type: CompareChangeType;
  category: CompareContentCategory;
  description: string;
  beforeText: string;
  afterText: string;
  beforeRects: CompareRectangle[];
  afterRects: CompareRectangle[];
}

export interface CompareChangeSummary {
  added: number;
  removed: number;
  modified: number;
  moved: number;
  styleChanged: number;
}

export interface CompareCategorySummary {
  text: number;
  image: number;
  'header-footer': number;
  annotation: number;
  formatting: number;
  background: number;
}

export interface ComparePageResult {
  status: 'match' | 'changed' | 'left-only' | 'right-only';
  leftPageNumber: number | null;
  rightPageNumber: number | null;
  changes: CompareTextChange[];
  summary: CompareChangeSummary;
  categorySummary: CompareCategorySummary;
  visualDiff: CompareVisualDiff | null;
  confidence?: number;
  usedOcr?: boolean;
}

export type CompareFilterType =
  | 'added'
  | 'removed'
  | 'modified'
  | 'moved'
  | 'style-changed'
  | 'all';

export interface CompareCategoryFilterState {
  text: boolean;
  image: boolean;
  'header-footer': boolean;
  annotation: boolean;
  formatting: boolean;
  background: boolean;
}

export interface CompareState {
  pdfDoc1: pdfjsLib.PDFDocumentProxy | null;
  pdfDoc2: pdfjsLib.PDFDocumentProxy | null;
  currentPage: number;
  viewMode: CompareViewMode;
  isSyncScroll: boolean;
  currentComparison: ComparePageResult | null;
  activeChangeIndex: number;
  pagePairs: ComparePagePair[];
  activeFilter: CompareFilterType;
  categoryFilter: CompareCategoryFilterState;
  changeSearchQuery: string;
  useOcr: boolean;
  ocrLanguage: string;
  zoomLevel: number;
}
