import type Tesseract from 'tesseract.js';
import type { ComparePageModel, CompareTextItem } from '../types.ts';
import { mergeIntoLines, sortCompareTextItems } from './extract-page-model.ts';
import {
  joinCompareTextItems,
  normalizeCompareText,
} from './text-normalization.ts';
import { createConfiguredTesseractWorker } from '../../utils/tesseract-runtime.js';

type OcrWord = Tesseract.Word;
type OcrRecognizeResult = Tesseract.RecognizeResult;
type OcrPageWithWords = Tesseract.Page & { words: OcrWord[] };

export async function recognizePageCanvas(
  canvas: HTMLCanvasElement,
  language: string,
  onProgress?: (status: string, progress: number) => void
): Promise<ComparePageModel> {
  const worker = await createConfiguredTesseractWorker(
    language,
    1,
    (message) => {
      onProgress?.(message.status, message.progress || 0);
    }
  );

  let result: OcrRecognizeResult;
  try {
    result = await worker.recognize(canvas);
  } finally {
    await worker.terminate();
  }

  const words = (result.data as OcrPageWithWords).words
    .map((word, index) => {
      const normalizedText = normalizeCompareText(word.text);
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
