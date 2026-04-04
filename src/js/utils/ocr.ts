import Tesseract from 'tesseract.js';
import { PDFDocument, StandardFonts, rgb, PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { getFontForLanguage } from './font-loader.js';
import { OcrPage, OcrLine } from '@/types';
import {
  parseHocrDocument,
  calculateWordTransform,
  calculateSpaceTransform,
} from './hocr-transform.js';
import { getPDFDocument } from './helpers.js';
import { loadPdfDocument } from './load-pdf-document.js';
import { createConfiguredTesseractWorker } from './tesseract-runtime.js';

export interface OcrOptions {
  language: string;
  resolution: number;
  binarize: boolean;
  whitelist: string;
  embedFullFonts?: boolean;
  onProgress?: (status: string, progress: number) => void;
}

export interface OcrResult {
  pdfBytes: Uint8Array;
  pdfDoc: PDFDocument;
  fullText: string;
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
): void {
  ocrPage.lines.forEach(function (line: OcrLine) {
    const words = line.words;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const text = word.text.replace(
        /[\u0000-\u001F\u007F-\u009F\u200E\u200F\u202A-\u202E\uFEFF]/g,
        ''
      );

      if (!text.trim()) continue;

      const hasNonLatin = /[^\u0000-\u007F]/.test(text);
      const font = hasNonLatin ? primaryFont : latinFont;

      if (!font) {
        console.warn('Font not available for text: "' + text + '"');
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
        });
      } catch (error) {
        console.warn(`Could not draw text "${text}":`, error);
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
            });
          } catch {
            console.warn(`Could not draw space between words`);
          }
        }
      }
    }
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
    onProgress,
  } = options;
  const progress = onProgress || (() => {});

  const worker = await createConfiguredTesseractWorker(
    language,
    1,
    function (m: { status: string; progress: number }) {
      progress(m.status, m.progress || 0);
    }
  );

  await worker.setParameters({
    tessjs_create_hocr: '1',
    tessedit_pageseg_mode: Tesseract.PSM.AUTO,
  });

  if (whitelist) {
    await worker.setParameters({
      tessedit_char_whitelist: whitelist,
    });
  }

  const sourcePdfDoc = await loadPdfDocument(pdfBytes);
  const pdf = await getPDFDocument({ data: pdfBytes }).promise;
  const newPdfDoc = await PDFDocument.create();

  newPdfDoc.registerFontkit(fontkit);

  progress('Loading fonts...', 0);

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
  const hasIndic = selectedLangs.some((l) => indicLangs.includes(l));
  const hasLatin =
    selectedLangs.some((l) => !priorityLangs.includes(l)) ||
    selectedLangs.includes('eng');
  const isIndicPlusLatin = hasIndic && hasLatin && !hasCJK;

  let primaryFont: PDFFont;
  let latinFont: PDFFont;

  try {
    if (isIndicPlusLatin) {
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

  let fullText = '';

  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      progress(
        `Processing page ${i} of ${pdf.numPages}`,
        (i - 1) / pdf.numPages
      );

      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: resolution });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Failed to create canvas context');

      await page.render({ canvasContext: context, viewport, canvas }).promise;

      if (binarize) {
        binarizeCanvas(context);
      }

      const result = await worker.recognize(
        canvas,
        {},
        { text: true, hocr: true }
      );
      const data = result.data;

      canvas.width = 0;
      canvas.height = 0;

      const [copiedPage] = await newPdfDoc.copyPages(sourcePdfDoc, [i - 1]);
      newPdfDoc.addPage(copiedPage);

      if (data.hocr) {
        const ocrPage = parseHocrDocument(data.hocr);
        drawOcrTextLayer(
          copiedPage,
          ocrPage,
          viewport.height,
          primaryFont,
          latinFont
        );
      }

      fullText += data.text + '\n\n';
    }
  } finally {
    await worker.terminate();
  }

  const savedBytes = await newPdfDoc.save();

  return {
    pdfBytes: new Uint8Array(savedBytes),
    pdfDoc: newPdfDoc,
    fullText,
  };
}
