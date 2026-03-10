import Tesseract from 'tesseract.js';

import type { ComparePageModel, CompareTextItem } from '../types.ts';
import { mergeIntoLines, sortCompareTextItems } from './extract-page-model.ts';
import {
  joinCompareTextItems,
  normalizeCompareText,
} from './text-normalization.ts';

type OcrWord = {
  text: string;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
};

export async function recognizePageCanvas(
  canvas: HTMLCanvasElement,
  language: string,
  onProgress?: (status: string, progress: number) => void
): Promise<ComparePageModel> {
  const result = await Tesseract.recognize(canvas, language, {
    logger(message) {
      onProgress?.(message.status, message.progress || 0);
    },
  });

  const ocrData = result.data as unknown as { words?: OcrWord[] };
  const words = ((ocrData.words || []) as OcrWord[])
    .map((word, index) => {
      const normalizedText = normalizeCompareText(word.text || '');
      if (!normalizedText) return null;

      const item: CompareTextItem = {
        id: `ocr-${index}-${normalizedText}`,
        text: word.text,
        normalizedText,
        rect: {
          x: word.bbox.x0,
          y: word.bbox.y0,
          width: Math.max(word.bbox.x1 - word.bbox.x0, 1),
          height: Math.max(word.bbox.y1 - word.bbox.y0, 1),
        },
        wordTokens: [
          {
            word: normalizedText,
            compareWord: normalizedText.toLowerCase(),
            rect: {
              x: word.bbox.x0,
              y: word.bbox.y0,
              width: Math.max(word.bbox.x1 - word.bbox.x0, 1),
              height: Math.max(word.bbox.y1 - word.bbox.y0, 1),
            },
          },
        ],
      };

      return item;
    })
    .filter((word): word is CompareTextItem => Boolean(word));

  const mergedItems = mergeIntoLines(sortCompareTextItems(words));

  return {
    pageNumber: 0,
    width: canvas.width,
    height: canvas.height,
    textItems: mergedItems,
    plainText: joinCompareTextItems(mergedItems),
    hasText: mergedItems.length > 0,
    source: 'ocr',
  };
}
