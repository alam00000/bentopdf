import Tesseract from 'tesseract.js';
import { PDFDocument, StandardFonts, rgb, PDFFont, degrees } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { getFontForLanguage } from './font-loader.js';
import { languageToFontFamily } from '../config/font-mappings.js';
import { OcrPage, OcrLine } from '@/types';
import {
  parseHocrDocument,
  calculateWordTransform,
  calculateSpaceTransform,
  scaleOcrPageToPdfPoints,
} from './hocr-transform.js';
import { getPDFDocument } from './helpers.js';
import { loadPdfDocument } from './load-pdf-document.js';
import { createConfiguredTesseractWorker } from './tesseract-runtime.js';

import { trText } from '../i18n/i18n.js';

export interface OcrOptions {
  language: string;
  resolution: number;
  binarize: boolean;
  whitelist: string;
  embedFullFonts?: boolean;
  psm?: Tesseract.PSM;
  perPageTimeoutMs?: number;
  onProgress?: (status: string, progress: number) => void;
}

export interface OcrWarning {
  page: number;
  kind: 'recognize-timeout' | 'recognize-error' | 'draw-error' | 'page-error';
  message: string;
}

export interface OcrResult {
  pdfBytes: Uint8Array;
  pdfDoc: PDFDocument;
  fullText: string;
  warnings: OcrWarning[];
}

function binarizeCanvas(ctx: CanvasRenderingContext2D) {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const brightness =
      0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const color = brightness > 128 ? 255 : 0;
    data[i] = data[i + 1] = data[i + 2] = color;
  }
  ctx.putImageData(imageData, 0, 0);
}

function drawOcrTextLayer(
  page: ReturnType<typeof PDFDocument.prototype.addPage>,
  ocrPage: OcrPage,
  pageHeight: number,
  primaryFont: PDFFont,
  latinFont: PDFFont
): { droppedWords: number; droppedSpaces: number } {
  let droppedWords = 0;
  let droppedSpaces = 0;
  ocrPage.lines.forEach(function (line: OcrLine) {
    const words =
      line.direction === 'rtl' ? [...line.words].reverse() : line.words;
    const lineRotation = degrees(
      -line.textangle + Math.atan(line.baseline.slope) * (180 / Math.PI)
    );

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const text = word.text.replace(/[\p{Cc}\p{Cf}]/gu, '');

      if (!text.trim()) continue;

      const hasNonLatin = /[^\p{ASCII}]/u.test(text);
      const font = hasNonLatin ? primaryFont : latinFont;

      if (!font) {
        droppedWords++;
        continue;
      }

      const transform = calculateWordTransform(
        word,
        line,
        pageHeight,
        (txt: string, size: number) => {
          try {
            return font.widthOfTextAtSize(txt, size);
          } catch {
            return 0;
          }
        }
      );

      if (transform.fontSize <= 0) continue;

      try {
        page.drawText(text, {
          x: transform.x,
          y: transform.y,
          font,
          size: transform.fontSize,
          color: rgb(0, 0, 0),
          opacity: 0,
          rotate: lineRotation,
        });
      } catch {
        droppedWords++;
      }

      if (line.injectWordBreaks && i < words.length - 1) {
        const nextWord = words[i + 1];
        const spaceTransform = calculateSpaceTransform(
          word,
          nextWord,
          line,
          pageHeight,
          (size: number) => {
            try {
              return font.widthOfTextAtSize(' ', size);
            } catch {
              return 0;
            }
          }
        );

        if (spaceTransform && spaceTransform.horizontalScale > 0.1) {
          try {
            page.drawText(' ', {
              x: spaceTransform.x,
              y: spaceTransform.y,
              font,
              size: spaceTransform.fontSize,
              color: rgb(0, 0, 0),
              opacity: 0,
              rotate: lineRotation,
            });
          } catch {
            droppedSpaces++;
          }
        }
      }
    }
  });
  return { droppedWords, droppedSpaces };
}

const DEFAULT_PER_PAGE_TIMEOUT_MS = 5 * 60 * 1000;
const PDF_CLEANUP_INTERVAL_PAGES = 25;

function recognizeWithTimeout(
  worker: Tesseract.Worker,
  canvas: HTMLCanvasElement,
  timeoutMs: number
): Promise<Tesseract.RecognizeResult> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const error = new Error(
        trText('OCR recognize timed out after {{timeoutMs}}ms', { timeoutMs })
      );
      error.name = 'OcrTimeoutError';
      reject(error);
    }, timeoutMs);
    worker
      .recognize(canvas, {}, { text: true, hocr: true })
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export async function performOcr(
  pdfBytes: Uint8Array | ArrayBuffer,
  options: OcrOptions
): Promise<OcrResult> {
  const {
    language,
    resolution,
    binarize,
    whitelist,
    embedFullFonts,
    psm,
    perPageTimeoutMs,
    onProgress,
  } = options;
  const progress = onProgress || (() => {});
  const pageTimeoutMs = perPageTimeoutMs ?? DEFAULT_PER_PAGE_TIMEOUT_MS;
  const warnings: OcrWarning[] = [];

  const worker = await createConfiguredTesseractWorker(
    language,
    1,
    function (m: { status: string; progress: number }) {
      progress(m.status, m.progress || 0);
    }
  );

  let fullText = '';
  let newPdfDoc: PDFDocument | undefined;

  try {
    await worker.setParameters({
      tessedit_pageseg_mode: psm ?? Tesseract.PSM.AUTO,
    });

    if (whitelist) {
      await worker.setParameters({
        tessedit_char_whitelist: whitelist,
      });
    }

    const sourcePdfDoc = await loadPdfDocument(pdfBytes);
    const pdf = await getPDFDocument({ data: pdfBytes }).promise;
    newPdfDoc = await PDFDocument.create();

    newPdfDoc.registerFontkit(fontkit);

    progress(trText('Loading fonts...'), 0);

    const selectedLangs = language.split('+');
    const cjkLangs = ['jpn', 'chi_sim', 'chi_tra', 'kor'];
    const indicLangs = [
      'hin',
      'ben',
      'guj',
      'kan',
      'mal',
      'ori',
      'pan',
      'tam',
      'tel',
      'sin',
    ];
    const priorityLangs = [...cjkLangs, ...indicLangs, 'ara', 'rus', 'ukr'];

    const primaryLang =
      selectedLangs.find((l) => priorityLangs.includes(l)) ||
      selectedLangs[0] ||
      'eng';

    const hasCJK = selectedLangs.some((l) => cjkLangs.includes(l));
    const hasLatin =
      selectedLangs.some((l) => !priorityLangs.includes(l)) ||
      selectedLangs.includes('eng');
    const primaryFontFamily = languageToFontFamily[primaryLang] ?? 'Noto Sans';
    const latinFontFamily = languageToFontFamily['eng'] ?? 'Noto Sans';
    const sharesLatinFamily = primaryFontFamily === latinFontFamily;
    const needsSeparateLatinFont =
      priorityLangs.includes(primaryLang) &&
      hasLatin &&
      !hasCJK &&
      !sharesLatinFamily;

    let primaryFont: PDFFont;
    let latinFont: PDFFont;

    try {
      if (needsSeparateLatinFont) {
        const [scriptFontBytes, latinFontBytes] = await Promise.all([
          getFontForLanguage(primaryLang),
          getFontForLanguage('eng'),
        ]);
        primaryFont = await newPdfDoc.embedFont(scriptFontBytes, {
          subset: !embedFullFonts,
        });
        latinFont = await newPdfDoc.embedFont(latinFontBytes, {
          subset: !embedFullFonts,
        });
      } else {
        const fontBytes = await getFontForLanguage(primaryLang);
        primaryFont = await newPdfDoc.embedFont(fontBytes, {
          subset: !embedFullFonts,
        });
        latinFont = primaryFont;
      }
    } catch (e) {
      console.error('Font loading failed, falling back to Helvetica', e);
      primaryFont = await newPdfDoc.embedFont(StandardFonts.Helvetica);
      latinFont = primaryFont;
    }

    for (let i = 1; i <= pdf.numPages; i++) {
      progress(
        trText('Processing page {{i}} of {{numPages}}', {
          i,
          numPages: pdf.numPages,
        }),
        (i - 1) / pdf.numPages
      );

      const pdfJsPage = await pdf.getPage(i);
      try {
        const viewport = pdfJsPage.getViewport({ scale: resolution });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');
        if (!context)
          throw new Error(trText('Failed to create canvas context'));

        await pdfJsPage.render({ canvasContext: context, viewport, canvas })
          .promise;

        if (binarize) {
          binarizeCanvas(context);
        }

        let pageText = '';
        let pageHocr = '';
        try {
          const result = await recognizeWithTimeout(
            worker,
            canvas,
            pageTimeoutMs
          );
          pageText = result.data.text ?? '';
          pageHocr = result.data.hocr ?? '';
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          warnings.push({
            page: i,
            kind:
              err instanceof Error && err.name === 'OcrTimeoutError'
                ? 'recognize-timeout'
                : 'recognize-error',
            message,
          });
        }

        canvas.width = 0;
        canvas.height = 0;

        const [copiedPage] = await newPdfDoc.copyPages(sourcePdfDoc, [i - 1]);
        newPdfDoc.addPage(copiedPage);

        if (pageHocr) {
          const ocrPage = parseHocrDocument(pageHocr);
          const pdfPageWidth = copiedPage.getWidth();
          const pdfPageHeight = copiedPage.getHeight();
          scaleOcrPageToPdfPoints(ocrPage, pdfPageWidth, pdfPageHeight);
          const drawStats = drawOcrTextLayer(
            copiedPage,
            ocrPage,
            pdfPageHeight,
            primaryFont,
            latinFont
          );
          if (drawStats.droppedWords > 0 || drawStats.droppedSpaces > 0) {
            warnings.push({
              page: i,
              kind: 'draw-error',
              message: `${drawStats.droppedWords} word(s) and ${drawStats.droppedSpaces} space(s) failed to render in the text layer`,
            });
          }
        }

        fullText += pageText + '\n\n';
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        warnings.push({ page: i, kind: 'page-error', message });
      } finally {
        pdfJsPage.cleanup();
      }

      if (i % PDF_CLEANUP_INTERVAL_PAGES === 0) {
        pdf.cleanup();
      }
    }
  } finally {
    await worker.terminate();
  }

  if (!newPdfDoc) {
    throw new Error(trText('OCR aborted before any page was processed'));
  }

  const savedBytes = await newPdfDoc.save();

  return {
    pdfBytes: new Uint8Array(savedBytes),
    pdfDoc: newPdfDoc,
    fullText,
    warnings,
  };
}
