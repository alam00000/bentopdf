import * as pdfjsLib from 'pdfjs-dist';
import type {
  ComparePageModel,
  ComparePagePair,
  ComparePageResult,
  CompareRectangle,
  CompareWordToken,
  CompareTextItem,
  RenderedPage,
  ComparisonPageLoad,
  DiffFocusRegion,
  CompareCaches,
  CompareRenderContext,
} from '../compare/types.ts';
import { extractPageModel } from '../compare/engine/extract-page-model.ts';
import { comparePageModelsAsync } from '../compare/engine/compare-page-models.ts';
import { renderVisualDiff } from '../compare/engine/visual-diff.ts';
import { recognizePageCanvas } from '../compare/engine/ocr-page.ts';
import { isLowQualityExtractedText } from '../compare/engine/text-normalization.ts';
import { COMPARE_RENDER, COMPARE_GEOMETRY } from '../compare/config.ts';

export function getElement<T extends HTMLElement>(id: string) {
  return document.getElementById(id) as T | null;
}

export function clearCanvas(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');
  canvas.width = 1;
  canvas.height = 1;
  context?.clearRect(0, 0, 1, 1);
}

export function renderMissingPage(
  canvas: HTMLCanvasElement,
  placeholderId: string,
  message: string
) {
  clearCanvas(canvas);
  const placeholder = getElement<HTMLDivElement>(placeholderId);
  if (placeholder) {
    placeholder.textContent = message;
    placeholder.classList.remove('hidden');
  }
}

export function hidePlaceholder(placeholderId: string) {
  const placeholder = getElement<HTMLDivElement>(placeholderId);
  placeholder?.classList.add('hidden');
}

export function getRenderScale(
  page: pdfjsLib.PDFPageProxy,
  container: HTMLElement,
  viewMode: 'overlay' | 'side-by-side',
  zoomLevel = 1.0
) {
  const baseViewport = page.getViewport({ scale: 1.0 });
  const availableWidth = Math.max(
    container.clientWidth - (viewMode === 'overlay' ? 96 : 56),
    320
  );
  const fitScale = availableWidth / Math.max(baseViewport.width, 1);
  const maxScale =
    viewMode === 'overlay'
      ? COMPARE_RENDER.MAX_SCALE_OVERLAY
      : COMPARE_RENDER.MAX_SCALE_SIDE;

  const baseScale = Math.min(Math.max(fitScale, 1.0), maxScale);
  return baseScale * zoomLevel;
}

export function getPageModelCacheKey(
  cacheKeyPrefix: 'left' | 'right',
  pageNum: number,
  scale: number
) {
  return `${cacheKeyPrefix}-${pageNum}-${scale.toFixed(3)}`;
}

function shouldUseOcrForModel(model: ComparePageModel) {
  return !model.hasText || isLowQualityExtractedText(model.plainText);
}

function rescaleRect(
  rect: CompareRectangle,
  scaleX: number,
  scaleY: number
): CompareRectangle {
  return {
    x: rect.x * scaleX,
    y: rect.y * scaleY,
    width: rect.width * scaleX,
    height: rect.height * scaleY,
  };
}

function rescaleWordToken(
  token: CompareWordToken,
  scaleX: number,
  scaleY: number
): CompareWordToken {
  return {
    ...token,
    rect: rescaleRect(token.rect, scaleX, scaleY),
  };
}

function rescaleTextItem(
  item: CompareTextItem,
  scaleX: number,
  scaleY: number
): CompareTextItem {
  return {
    ...item,
    rect: rescaleRect(item.rect, scaleX, scaleY),
    charMap: item.charMap?.map((c) => ({
      x: c.x * scaleX,
      width: c.width * scaleX,
    })),
    wordTokens: item.wordTokens?.map((t) =>
      rescaleWordToken(t, scaleX, scaleY)
    ),
    fragments: item.fragments?.map((f) => rescaleTextItem(f, scaleX, scaleY)),
  };
}

function rescalePageModel(
  model: ComparePageModel,
  cachedWidth: number,
  cachedHeight: number,
  targetWidth: number,
  targetHeight: number
): ComparePageModel {
  const scaleX = targetWidth / Math.max(cachedWidth, 1);
  const scaleY = targetHeight / Math.max(cachedHeight, 1);
  return {
    ...model,
    width: targetWidth,
    height: targetHeight,
    textItems: model.textItems.map((item) =>
      rescaleTextItem(item, scaleX, scaleY)
    ),
  };
}

function getOcrCacheKey(side: string, pageNum: number) {
  return `${side}-${pageNum}`;
}

export function buildDiffFocusRegion(
  comparison: ComparePageResult,
  leftCanvas: HTMLCanvasElement,
  rightCanvas: HTMLCanvasElement
): DiffFocusRegion | undefined {
  const leftOffsetX = Math.floor(
    (Math.max(leftCanvas.width, rightCanvas.width) - leftCanvas.width) / 2
  );
  const leftOffsetY = Math.floor(
    (Math.max(leftCanvas.height, rightCanvas.height) - leftCanvas.height) / 2
  );
  const rightOffsetX = Math.floor(
    (Math.max(leftCanvas.width, rightCanvas.width) - rightCanvas.width) / 2
  );
  const rightOffsetY = Math.floor(
    (Math.max(leftCanvas.height, rightCanvas.height) - rightCanvas.height) / 2
  );
  const bounds = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  };

  for (const change of comparison.changes) {
    for (const rect of change.beforeRects) {
      bounds.minX = Math.min(bounds.minX, rect.x + leftOffsetX);
      bounds.minY = Math.min(bounds.minY, rect.y + leftOffsetY);
      bounds.maxX = Math.max(bounds.maxX, rect.x + leftOffsetX + rect.width);
      bounds.maxY = Math.max(bounds.maxY, rect.y + leftOffsetY + rect.height);
    }

    for (const rect of change.afterRects) {
      bounds.minX = Math.min(bounds.minX, rect.x + rightOffsetX);
      bounds.minY = Math.min(bounds.minY, rect.y + rightOffsetY);
      bounds.maxX = Math.max(bounds.maxX, rect.x + rightOffsetX + rect.width);
      bounds.maxY = Math.max(bounds.maxY, rect.y + rightOffsetY + rect.height);
    }
  }

  if (!Number.isFinite(bounds.minX)) {
    return undefined;
  }

  const fullWidth = Math.max(leftCanvas.width, rightCanvas.width, 1);
  const fullHeight = Math.max(leftCanvas.height, rightCanvas.height, 1);
  const padding = COMPARE_GEOMETRY.FOCUS_REGION_PADDING;

  const x = Math.max(Math.floor(bounds.minX - padding), 0);
  const y = Math.max(Math.floor(bounds.minY - padding), 0);
  const maxX = Math.min(Math.ceil(bounds.maxX + padding), fullWidth);
  const maxY = Math.min(Math.ceil(bounds.maxY + padding), fullHeight);

  return {
    x,
    y,
    width: Math.max(
      maxX - x,
      Math.min(COMPARE_GEOMETRY.FOCUS_REGION_MIN_WIDTH, fullWidth)
    ),
    height: Math.max(
      maxY - y,
      Math.min(COMPARE_GEOMETRY.FOCUS_REGION_MIN_HEIGHT, fullHeight)
    ),
  };
}

export async function renderPage(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNum: number,
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  placeholderId: string,
  cacheKeyPrefix: 'left' | 'right',
  caches: CompareCaches,
  ctx: CompareRenderContext
): Promise<RenderedPage> {
  if (pageNum > pdfDoc.numPages) {
    renderMissingPage(
      canvas,
      placeholderId,
      `Page ${pageNum} does not exist in this PDF.`
    );
    return { model: null, exists: false };
  }

  const page = await pdfDoc.getPage(pageNum);

  const targetScale = getRenderScale(
    page,
    container,
    ctx.viewMode,
    ctx.zoomLevel
  );
  const scaledViewport = page.getViewport({ scale: targetScale });
  const dpr = window.devicePixelRatio || 1;
  const hiResViewport = page.getViewport({ scale: targetScale * dpr });

  hidePlaceholder(placeholderId);

  canvas.width = hiResViewport.width;
  canvas.height = hiResViewport.height;
  canvas.style.width = `${scaledViewport.width}px`;
  canvas.style.height = `${scaledViewport.height}px`;

  const cacheKey = getPageModelCacheKey(cacheKeyPrefix, pageNum, targetScale);
  const cachedModel = caches.pageModelCache.get(cacheKey);
  const modelPromise = cachedModel
    ? Promise.resolve(cachedModel)
    : extractPageModel(page, scaledViewport);
  const renderTask = page.render({
    canvasContext: canvas.getContext('2d')!,
    viewport: hiResViewport,
    canvas,
  }).promise;

  const [model] = await Promise.all([modelPromise, renderTask]);

  let finalModel = model;

  if (!cachedModel && ctx.useOcr && shouldUseOcrForModel(model)) {
    const ocrKey = getOcrCacheKey(cacheKeyPrefix, pageNum);
    const cachedOcr = caches.ocrModelCache.get(ocrKey);
    if (cachedOcr) {
      finalModel = rescalePageModel(
        cachedOcr.model,
        cachedOcr.width,
        cachedOcr.height,
        scaledViewport.width,
        scaledViewport.height
      );
      finalModel.pageNumber = pageNum;
    } else {
      ctx.showLoader(`Running OCR on page ${pageNum}...`);
      const ocrModel = await recognizePageCanvas(
        canvas,
        ctx.ocrLanguage,
        function (status, progress) {
          ctx.showLoader(`OCR: ${status}`, progress * 100);
        }
      );
      finalModel = {
        ...ocrModel,
        pageNumber: pageNum,
      };
      caches.ocrModelCache.set(ocrKey, {
        model: finalModel,
        width: scaledViewport.width,
        height: scaledViewport.height,
      });
    }
  }

  caches.pageModelCache.set(cacheKey, finalModel);

  return { model: finalModel, exists: true };
}

export async function loadComparisonPage(
  pdfDoc: pdfjsLib.PDFDocumentProxy | null,
  pageNum: number | null,
  side: 'left' | 'right',
  renderTarget:
    | {
        canvas: HTMLCanvasElement;
        container: HTMLElement;
        placeholderId: string;
      }
    | undefined,
  caches: CompareCaches,
  ctx: CompareRenderContext
): Promise<ComparisonPageLoad> {
  if (!pdfDoc || !pageNum) {
    if (renderTarget) {
      renderMissingPage(
        renderTarget.canvas,
        renderTarget.placeholderId,
        'No paired page for this side.'
      );
    }
    return { model: null, exists: false };
  }

  if (renderTarget) {
    return renderPage(
      pdfDoc,
      pageNum,
      renderTarget.canvas,
      renderTarget.container,
      renderTarget.placeholderId,
      side,
      caches,
      ctx
    );
  }

  const renderScale = COMPARE_RENDER.OFFLINE_SCALE;
  const cacheKey = getPageModelCacheKey(side, pageNum, renderScale);
  const cachedModel = caches.pageModelCache.get(cacheKey);
  if (cachedModel) {
    return { model: cachedModel, exists: true };
  }

  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: renderScale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Could not create offscreen comparison canvas.');
  }

  const extractedModel = await extractPageModel(page, viewport);
  await page.render({
    canvasContext: context,
    viewport,
    canvas,
  }).promise;

  let finalModel = extractedModel;
  if (ctx.useOcr && shouldUseOcrForModel(extractedModel)) {
    const ocrKey = getOcrCacheKey(side, pageNum);
    const cachedOcr = caches.ocrModelCache.get(ocrKey);
    if (cachedOcr) {
      finalModel = rescalePageModel(
        cachedOcr.model,
        cachedOcr.width,
        cachedOcr.height,
        viewport.width,
        viewport.height
      );
      finalModel.pageNumber = pageNum;
    } else {
      const ocrModel = await recognizePageCanvas(canvas, ctx.ocrLanguage);
      finalModel = {
        ...ocrModel,
        pageNumber: pageNum,
      };
      caches.ocrModelCache.set(ocrKey, {
        model: finalModel,
        width: viewport.width,
        height: viewport.height,
      });
    }
  }

  canvas.width = 0;
  canvas.height = 0;

  caches.pageModelCache.set(cacheKey, finalModel);
  return { model: finalModel, exists: true };
}

export async function computeComparisonForPair(
  pdfDoc1: pdfjsLib.PDFDocumentProxy | null,
  pdfDoc2: pdfjsLib.PDFDocumentProxy | null,
  pair: ComparePagePair,
  caches: CompareCaches,
  ctx: CompareRenderContext,
  options?: {
    renderTargets?: {
      left: {
        canvas: HTMLCanvasElement;
        container: HTMLElement;
        placeholderId: string;
      };
      right: {
        canvas: HTMLCanvasElement;
        container: HTMLElement;
        placeholderId: string;
      };
      diffCanvas?: HTMLCanvasElement;
    };
  }
) {
  const renderTargets = options?.renderTargets;
  const leftPage = await loadComparisonPage(
    pdfDoc1,
    pair.leftPageNumber,
    'left',
    renderTargets?.left,
    caches,
    ctx
  );
  const rightPage = await loadComparisonPage(
    pdfDoc2,
    pair.rightPageNumber,
    'right',
    renderTargets?.right,
    caches,
    ctx
  );

  const comparison = await comparePageModelsAsync(
    leftPage.model,
    rightPage.model
  );
  comparison.confidence = pair.confidence;

  if (
    renderTargets?.diffCanvas &&
    comparison.status !== 'left-only' &&
    comparison.status !== 'right-only'
  ) {
    const focusRegion = buildDiffFocusRegion(
      comparison,
      renderTargets.left.canvas,
      renderTargets.right.canvas
    );
    comparison.visualDiff = renderVisualDiff(
      renderTargets.left.canvas,
      renderTargets.right.canvas,
      renderTargets.diffCanvas,
      focusRegion
    );
  } else if (renderTargets?.diffCanvas) {
    clearCanvas(renderTargets.diffCanvas);
  }

  return comparison;
}

export function getComparisonCacheKey(pair: ComparePagePair, useOcr: boolean) {
  const leftKey = pair.leftPageNumber ? `left-${pair.leftPageNumber}` : 'none';
  const rightKey = pair.rightPageNumber
    ? `right-${pair.rightPageNumber}`
    : 'none';
  return `${leftKey}:${rightKey}:${useOcr ? 'ocr' : 'no-ocr'}`;
}
