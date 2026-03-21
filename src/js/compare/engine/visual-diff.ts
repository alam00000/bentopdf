import pixelmatch from 'pixelmatch';

import type { CompareVisualDiff } from '../types.ts';
import { VISUAL_DIFF as VISUAL_DIFF_CONFIG } from '../config.ts';

type FocusRegion = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function drawNormalized(
  sourceCanvas: HTMLCanvasElement,
  targetCanvas: HTMLCanvasElement
) {
  const context = targetCanvas.getContext('2d');
  if (!context) {
    throw new Error('Could not create comparison canvas context.');
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, targetCanvas.width, targetCanvas.height);

  const offsetX = Math.floor((targetCanvas.width - sourceCanvas.width) / 2);
  const offsetY = Math.floor((targetCanvas.height - sourceCanvas.height) / 2);
  context.drawImage(sourceCanvas, offsetX, offsetY);
}

export function renderVisualDiff(
  canvas1: HTMLCanvasElement,
  canvas2: HTMLCanvasElement,
  outputCanvas: HTMLCanvasElement,
  focusRegion?: FocusRegion
): CompareVisualDiff {
  const width = Math.max(canvas1.width, canvas2.width, 1);
  const height = Math.max(canvas1.height, canvas2.height, 1);
  const normalizedCanvas1 = createCanvas(width, height);
  const normalizedCanvas2 = createCanvas(width, height);

  drawNormalized(canvas1, normalizedCanvas1);
  drawNormalized(canvas2, normalizedCanvas2);

  outputCanvas.width = width;
  outputCanvas.height = height;

  const context1 = normalizedCanvas1.getContext('2d');
  const context2 = normalizedCanvas2.getContext('2d');
  const outputContext = outputCanvas.getContext('2d');

  if (!context1 || !context2 || !outputContext) {
    throw new Error('Could not create visual diff context.');
  }

  const image1 = context1.getImageData(0, 0, width, height);
  const image2 = context2.getImageData(0, 0, width, height);
  const diffImage = outputContext.createImageData(width, height);

  const mismatchPixels = pixelmatch(
    image1.data,
    image2.data,
    diffImage.data,
    width,
    height,
    {
      threshold: VISUAL_DIFF_CONFIG.PIXELMATCH_THRESHOLD,
      includeAA: false,
      alpha: VISUAL_DIFF_CONFIG.ALPHA,
      diffMask: false,
      diffColor: [...VISUAL_DIFF_CONFIG.DIFF_COLOR] as [number, number, number],
      diffColorAlt: [...VISUAL_DIFF_CONFIG.DIFF_COLOR_ALT] as [
        number,
        number,
        number,
      ],
    }
  );

  const overlayCanvas = createCanvas(width, height);
  const overlayContext = overlayCanvas.getContext('2d');

  if (!overlayContext) {
    throw new Error('Could not create visual diff overlay context.');
  }

  overlayContext.putImageData(diffImage, 0, 0);

  const region = focusRegion
    ? {
        x: Math.max(Math.floor(focusRegion.x), 0),
        y: Math.max(Math.floor(focusRegion.y), 0),
        width: Math.min(Math.ceil(focusRegion.width), width),
        height: Math.min(Math.ceil(focusRegion.height), height),
      }
    : { x: 0, y: 0, width, height };

  outputCanvas.width = Math.max(region.width, 1);
  outputCanvas.height = Math.max(region.height, 1);

  outputContext.fillStyle = '#ffffff';
  outputContext.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
  outputContext.drawImage(
    normalizedCanvas2,
    region.x,
    region.y,
    region.width,
    region.height,
    0,
    0,
    outputCanvas.width,
    outputCanvas.height
  );
  outputContext.globalAlpha = 0.9;
  outputContext.drawImage(
    overlayCanvas,
    region.x,
    region.y,
    region.width,
    region.height,
    0,
    0,
    outputCanvas.width,
    outputCanvas.height
  );
  outputContext.globalAlpha = 1;

  return {
    mismatchPixels,
    mismatchRatio: mismatchPixels / Math.max(width * height, 1),
    hasDiff: mismatchPixels > 0,
  };
}
