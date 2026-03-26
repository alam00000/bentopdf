import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import type {
  CompareCaches,
  ComparePagePair,
  CompareTextChange,
  ComparePdfExportMode,
} from '../types.ts';
import {
  COMPARE_CACHE_MAX_SIZE,
  COMPARE_COLORS,
  HIGHLIGHT_OPACITY,
  COMPARE_RENDER,
} from '../config.ts';
import { downloadFile } from '../../utils/helpers.ts';
import { computeComparisonForPair } from '../../logic/compare-render.ts';
import { LRUCache } from '../lru-cache.ts';
import { loadPdfDocument } from '../../utils/load-pdf-document.js';

const HIGHLIGHT_COLORS: Record<
  string,
  { r: number; g: number; b: number; opacity: number }
> = {
  added: {
    r: COMPARE_COLORS.added.r / 255,
    g: COMPARE_COLORS.added.g / 255,
    b: COMPARE_COLORS.added.b / 255,
    opacity: HIGHLIGHT_OPACITY,
  },
  removed: {
    r: COMPARE_COLORS.removed.r / 255,
    g: COMPARE_COLORS.removed.g / 255,
    b: COMPARE_COLORS.removed.b / 255,
    opacity: HIGHLIGHT_OPACITY,
  },
  'page-removed': {
    r: COMPARE_COLORS.removed.r / 255,
    g: COMPARE_COLORS.removed.g / 255,
    b: COMPARE_COLORS.removed.b / 255,
    opacity: HIGHLIGHT_OPACITY,
  },
  modified: {
    r: COMPARE_COLORS.modified.r / 255,
    g: COMPARE_COLORS.modified.g / 255,
    b: COMPARE_COLORS.modified.b / 255,
    opacity: HIGHLIGHT_OPACITY,
  },
  moved: {
    r: COMPARE_COLORS.moved.r / 255,
    g: COMPARE_COLORS.moved.g / 255,
    b: COMPARE_COLORS.moved.b / 255,
    opacity: HIGHLIGHT_OPACITY,
  },
  'style-changed': {
    r: COMPARE_COLORS['style-changed'].r / 255,
    g: COMPARE_COLORS['style-changed'].g / 255,
    b: COMPARE_COLORS['style-changed'].b / 255,
    opacity: HIGHLIGHT_OPACITY,
  },
};

const EXTRACT_SCALE = COMPARE_RENDER.OFFLINE_SCALE;

function drawHighlights(
  page: ReturnType<PDFDocument['getPage']>,
  pageHeight: number,
  changes: CompareTextChange[],
  side: 'before' | 'after'
) {
  for (const change of changes) {
    const rects = side === 'before' ? change.beforeRects : change.afterRects;
    const color = HIGHLIGHT_COLORS[change.type];
    if (!color) continue;
    for (const rect of rects) {
      page.drawRectangle({
        x: rect.x / EXTRACT_SCALE,
        y: pageHeight - rect.y / EXTRACT_SCALE - rect.height / EXTRACT_SCALE,
        width: rect.width / EXTRACT_SCALE,
        height: rect.height / EXTRACT_SCALE,
        color: rgb(color.r, color.g, color.b),
        opacity: color.opacity,
      });
    }
  }
}

export async function exportComparePdf(
  mode: ComparePdfExportMode,
  pdfDoc1: pdfjsLib.PDFDocumentProxy | null,
  pdfDoc2: pdfjsLib.PDFDocumentProxy | null,
  pairs: ComparePagePair[],
  onProgress?: (message: string, percent: number) => void,
  options?: {
    overlayOpacity?: number;
    includeChange?: (change: CompareTextChange) => boolean;
    useOcr?: boolean;
    ocrLanguage?: string;
    showOverlayDocument?: boolean;
  }
) {
  if (!pdfDoc1 && !pdfDoc2) {
    throw new Error('At least one PDF document is required for export.');
  }
  if (!pairs || pairs.length === 0) {
    throw new Error('No page pairs to export.');
  }

  const outDoc = await PDFDocument.create();

  const [bytes1, bytes2] = await Promise.all([
    pdfDoc1?.getData(),
    pdfDoc2?.getData(),
  ]);

  const [libDoc1, libDoc2] = await Promise.all([
    bytes1 ? loadPdfDocument(bytes1, { ignoreEncryption: true }) : null,
    bytes2 ? loadPdfDocument(bytes2, { ignoreEncryption: true }) : null,
  ]);

  const includeChange = options?.includeChange ?? (() => true);
  const overlayOpacity = options?.overlayOpacity ?? 0.5;
  const showOverlayDocument = options?.showOverlayDocument ?? true;
  const exportCaches: CompareCaches = {
    pageModelCache: new LRUCache(COMPARE_CACHE_MAX_SIZE),
    comparisonCache: new LRUCache(COMPARE_CACHE_MAX_SIZE),
    comparisonResultsCache: new LRUCache(COMPARE_CACHE_MAX_SIZE),
    ocrModelCache: new LRUCache(COMPARE_CACHE_MAX_SIZE),
  };
  const renderContext = {
    useOcr: options?.useOcr ?? true,
    ocrLanguage: options?.ocrLanguage ?? 'eng',
    viewMode: mode === 'overlay' ? 'overlay' : 'side-by-side',
    zoomLevel: 1,
    showLoader: (message: string, percent?: number) => {
      onProgress?.(message, percent ?? 0);
    },
  } as const;

  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    onProgress?.(
      `Rendering page ${i + 1} of ${pairs.length}...`,
      Math.round(((i + 1) / pairs.length) * 100)
    );

    const leftPdjsPage =
      pair.leftPageNumber && pdfDoc1
        ? await pdfDoc1.getPage(pair.leftPageNumber)
        : null;
    const rightPdjsPage =
      pair.rightPageNumber && pdfDoc2
        ? await pdfDoc2.getPage(pair.rightPageNumber)
        : null;

    const comparison = await computeComparisonForPair(
      pdfDoc1,
      pdfDoc2,
      pair,
      exportCaches,
      renderContext
    );
    const changes = comparison.changes.filter(includeChange);

    if (mode === 'overlay') {
      const leftViewport = leftPdjsPage?.getViewport({ scale: 1.0 }) ?? null;
      const rightViewport = rightPdjsPage?.getViewport({ scale: 1.0 }) ?? null;
      const pageWidth = leftViewport?.width ?? rightViewport?.width;
      const pageHeight = leftViewport?.height ?? rightViewport?.height;

      if (!pageWidth || !pageHeight) {
        continue;
      }

      const outPage = outDoc.addPage([pageWidth, pageHeight]);

      if (pair.leftPageNumber && libDoc1) {
        const [copied] = await outDoc.copyPages(libDoc1, [
          pair.leftPageNumber - 1,
        ]);
        const embedded = await outDoc.embedPage(copied);
        outPage.drawPage(embedded, {
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
        });
      }

      if (pair.rightPageNumber && libDoc2) {
        const shouldDrawRightPage = !pair.leftPageNumber || showOverlayDocument;
        if (shouldDrawRightPage) {
          const [copied] = await outDoc.copyPages(libDoc2, [
            pair.rightPageNumber - 1,
          ]);
          const embedded = await outDoc.embedPage(copied);
          outPage.drawPage(embedded, {
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight,
            opacity:
              pair.leftPageNumber && pair.rightPageNumber && showOverlayDocument
                ? overlayOpacity
                : 1,
          });
        }
      }

      if (changes.length) {
        for (const change of changes) {
          const color = HIGHLIGHT_COLORS[change.type];
          if (!color) continue;
          for (const rect of [...change.beforeRects, ...change.afterRects]) {
            outPage.drawRectangle({
              x: rect.x / EXTRACT_SCALE,
              y:
                pageHeight -
                rect.y / EXTRACT_SCALE -
                rect.height / EXTRACT_SCALE,
              width: rect.width / EXTRACT_SCALE,
              height: rect.height / EXTRACT_SCALE,
              color: rgb(color.r, color.g, color.b),
              opacity: color.opacity,
            });
          }
        }
      }

      await new Promise((r) => setTimeout(r, 0));
      continue;
    }

    if (mode === 'split') {
      const refPage = leftPdjsPage || rightPdjsPage;
      const vp = refPage!.getViewport({ scale: 1.0 });
      const gap = COMPARE_RENDER.SPLIT_GAP_PT;
      const totalW = vp.width * 2 + gap;
      const outPage = outDoc.addPage([totalW, vp.height]);

      if (pair.leftPageNumber && libDoc1) {
        const [copied] = await outDoc.copyPages(libDoc1, [
          pair.leftPageNumber - 1,
        ]);
        const embedded = await outDoc.embedPage(copied);
        outPage.drawPage(embedded, {
          x: 0,
          y: 0,
          width: vp.width,
          height: vp.height,
        });
      }
      if (pair.rightPageNumber && libDoc2) {
        const [copied] = await outDoc.copyPages(libDoc2, [
          pair.rightPageNumber - 1,
        ]);
        const embedded = await outDoc.embedPage(copied);
        outPage.drawPage(embedded, {
          x: vp.width + gap,
          y: 0,
          width: vp.width,
          height: vp.height,
        });
      }

      if (changes.length) {
        for (const change of changes) {
          const color = HIGHLIGHT_COLORS[change.type];
          if (!color) continue;
          for (const rect of change.beforeRects) {
            outPage.drawRectangle({
              x: rect.x / EXTRACT_SCALE,
              y:
                vp.height -
                rect.y / EXTRACT_SCALE -
                rect.height / EXTRACT_SCALE,
              width: rect.width / EXTRACT_SCALE,
              height: rect.height / EXTRACT_SCALE,
              color: rgb(color.r, color.g, color.b),
              opacity: color.opacity,
            });
          }
          for (const rect of change.afterRects) {
            outPage.drawRectangle({
              x: vp.width + gap + rect.x / EXTRACT_SCALE,
              y:
                vp.height -
                rect.y / EXTRACT_SCALE -
                rect.height / EXTRACT_SCALE,
              width: rect.width / EXTRACT_SCALE,
              height: rect.height / EXTRACT_SCALE,
              color: rgb(color.r, color.g, color.b),
              opacity: color.opacity,
            });
          }
        }
      }
    } else if (mode === 'alternating') {
      if (pair.leftPageNumber && libDoc1) {
        const [copied] = await outDoc.copyPages(libDoc1, [
          pair.leftPageNumber - 1,
        ]);
        const embedded = outDoc.addPage(copied);
        const { height } = embedded.getSize();
        if (changes.length) drawHighlights(embedded, height, changes, 'before');
      }
      if (pair.rightPageNumber && libDoc2) {
        const [copied] = await outDoc.copyPages(libDoc2, [
          pair.rightPageNumber - 1,
        ]);
        const embedded = outDoc.addPage(copied);
        const { height } = embedded.getSize();
        if (changes.length) drawHighlights(embedded, height, changes, 'after');
      }
    } else if (mode === 'left') {
      if (pair.leftPageNumber && libDoc1) {
        const [copied] = await outDoc.copyPages(libDoc1, [
          pair.leftPageNumber - 1,
        ]);
        const embedded = outDoc.addPage(copied);
        const { height } = embedded.getSize();
        if (changes.length) drawHighlights(embedded, height, changes, 'before');
      }
    } else {
      if (pair.rightPageNumber && libDoc2) {
        const [copied] = await outDoc.copyPages(libDoc2, [
          pair.rightPageNumber - 1,
        ]);
        const embedded = outDoc.addPage(copied);
        const { height } = embedded.getSize();
        if (changes.length) drawHighlights(embedded, height, changes, 'after');
      }
    }

    await new Promise((r) => setTimeout(r, 0));
  }

  const pdfBytes = await outDoc.save();
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], {
    type: 'application/pdf',
  });
  downloadFile(blob, 'bentopdf-compare-export.pdf');
}
