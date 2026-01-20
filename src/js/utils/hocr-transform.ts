import {
  BBox,
  OcrLine,
  OcrPage,
  OcrWord,
  WordTransform,
  Baseline,
} from '@/types';

const BBOX_PATTERN = /bbox\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/;
const BASELINE_PATTERN = /baseline\s+([-+]?\d*\.?\d*)\s+([-+]?\d+)/;
const TEXTANGLE_PATTERN = /textangle\s+([-+]?\d*\.?\d*)/;

export function parseBBox(title: string): BBox | null {
  const match = title.match(BBOX_PATTERN);
  if (!match) return null;

  return {
    x0: parseInt(match[1], 10),
    y0: parseInt(match[2], 10),
    x1: parseInt(match[3], 10),
    y1: parseInt(match[4], 10),
  };
}

export function parseBaseline(title: string): Baseline {
  const match = title.match(BASELINE_PATTERN);
  if (!match) {
    return { slope: 0, intercept: 0 };
  }

  return {
    slope: parseFloat(match[1]) || 0,
    intercept: parseInt(match[2], 10) || 0,
  };
}

export function parseTextangle(title: string): number {
  const match = title.match(TEXTANGLE_PATTERN);
  if (!match) return 0;
  return parseFloat(match[1]) || 0;
}

export function getTextDirection(element: Element): 'ltr' | 'rtl' {
  const dir = element.getAttribute('dir');
  return dir === 'rtl' ? 'rtl' : 'ltr';
}

export function shouldInjectWordBreaks(element: Element): boolean {
  const lang = element.getAttribute('lang') || '';
  const cjkLangs = ['chi_sim', 'chi_tra', 'jpn', 'kor', 'zh', 'ja', 'ko'];
  return !cjkLangs.includes(lang);
}

export function normalizeText(text: string): string {
  return text.normalize('NFKC');
}

export function parseHocrDocument(hocrText: string): OcrPage {
  const parser = new DOMParser();
  const doc = parser.parseFromString(hocrText, 'text/html');

  let width = 0;
  let height = 0;
  const pageDiv = doc.querySelector('.ocr_page');
  if (pageDiv) {
    const title = pageDiv.getAttribute('title') || '';
    const bbox = parseBBox(title);
    if (bbox) {
      width = bbox.x1 - bbox.x0;
      height = bbox.y1 - bbox.y0;
    }
  }

  const lines: OcrLine[] = [];

  const lineClasses = [
    'ocr_line',
    'ocr_textfloat',
    'ocr_header',
    'ocr_caption',
  ];
  const lineSelectors = lineClasses.map((c) => `.${c}`).join(', ');
  const lineElements = doc.querySelectorAll(lineSelectors);

  if (lineElements.length > 0) {
    lineElements.forEach((lineEl) => {
      const line = parseHocrLine(lineEl);
      if (line && line.words.length > 0) {
        lines.push(line);
      }
    });
  } else {
    const wordElements = doc.querySelectorAll('.ocrx_word');
    if (wordElements.length > 0) {
      const words = parseWordsFromElements(wordElements);
      if (words.length > 0) {
        const allBBox = calculateBoundingBox(words.map((w) => w.bbox));
        lines.push({
          bbox: allBBox,
          baseline: { slope: 0, intercept: 0 },
          textangle: 0,
          words,
          direction: 'ltr',
          injectWordBreaks: true,
        });
      }
    }
  }

  return { width, height, dpi: 72, lines };
}

function parseHocrLine(lineElement: Element): OcrLine | null {
  const title = lineElement.getAttribute('title') || '';
  const bbox = parseBBox(title);

  if (!bbox) return null;

  const baseline = parseBaseline(title);
  const textangle = parseTextangle(title);

  const parent = lineElement.closest('.ocr_par') || lineElement.parentElement;
  const direction = parent ? getTextDirection(parent) : 'ltr';
  const injectWordBreaks = parent ? shouldInjectWordBreaks(parent) : true;
  const wordElements = lineElement.querySelectorAll('.ocrx_word');
  const words = parseWordsFromElements(wordElements);

  return {
    bbox,
    baseline,
    textangle,
    words,
    direction,
    injectWordBreaks,
  };
}

function parseWordsFromElements(wordElements: NodeListOf<Element>): OcrWord[] {
  const words: OcrWord[] = [];

  wordElements.forEach((wordEl) => {
    const title = wordEl.getAttribute('title') || '';
    const text = normalizeText((wordEl.textContent || '').trim());

    if (!text) return;

    const bbox = parseBBox(title);
    if (!bbox) return;

    const confMatch = title.match(/x_wconf\s+(\d+)/);
    const confidence = confMatch ? parseInt(confMatch[1], 10) : 0;

    words.push({
      text,
      bbox,
      confidence,
    });
  });

  return words;
}

function calculateBoundingBox(bboxes: BBox[]): BBox {
  if (bboxes.length === 0) {
    return { x0: 0, y0: 0, x1: 0, y1: 0 };
  }

  return {
    x0: Math.min(...bboxes.map((b) => b.x0)),
    y0: Math.min(...bboxes.map((b) => b.y0)),
    x1: Math.max(...bboxes.map((b) => b.x1)),
    y1: Math.max(...bboxes.map((b) => b.y1)),
  };
}

/**
 * Calculate the transformation parameters for drawing a word
 *
 * pdf-lib doesn't support horizontal text scaling (Tz operator),
 * we calculate a font size that makes the text width exactly match the word bbox width.
 *
 * @param word - The word to position
 * @param line - The line containing this word
 * @param pageHeight - Height of the page in pixels (for coordinate flip)
 * @param fontWidthFn - Function to calculate text width at a given font size
 * @returns Transform parameters for pdf-lib
 */
export function calculateWordTransform(
  word: OcrWord,
  line: OcrLine,
  pageHeight: number,
  fontWidthFn: (text: string, fontSize: number) => number
): WordTransform {
  const wordBBox = word.bbox;
  const wordWidth = wordBBox.x1 - wordBBox.x0;
  const wordHeight = wordBBox.y1 - wordBBox.y0;

  let fontSize = wordHeight;
  const maxIterations = 10;

  for (let i = 0; i < maxIterations; i++) {
    const currentWidth = fontWidthFn(word.text, fontSize);
    if (currentWidth <= 0) break;

    const ratio = wordWidth / currentWidth;
    const newFontSize = fontSize * ratio;

    if (Math.abs(newFontSize - fontSize) / fontSize < 0.01) {
      fontSize = newFontSize;
      break;
    }
    fontSize = newFontSize;
  }

  fontSize = Math.max(1, Math.min(fontSize, wordHeight * 2));

  const fontWidth = fontWidthFn(word.text, fontSize);
  const horizontalScale = fontWidth > 0 ? wordWidth / fontWidth : 1;

  const slopeAngle = Math.atan(line.baseline.slope) * (180 / Math.PI);
  const rotation = -line.textangle + slopeAngle;

  const x = wordBBox.x0;

  // pdf-lib draws text from baseline, so we position at word bottom
  const y = pageHeight - wordBBox.y1;

  return {
    x,
    y,
    fontSize,
    horizontalScale,
    rotation,
  };
}

export function calculateSpaceTransform(
  prevWord: OcrWord,
  nextWord: OcrWord,
  line: OcrLine,
  pageHeight: number,
  spaceWidthFn: (fontSize: number) => number
): { x: number; y: number; horizontalScale: number; fontSize: number } | null {
  const lineHeight = line.bbox.y1 - line.bbox.y0;
  const fontSize = Math.max(lineHeight + line.baseline.intercept, 1);

  const gapStart = prevWord.bbox.x1;
  const gapEnd = nextWord.bbox.x0;
  const gapWidth = gapEnd - gapStart;

  if (gapWidth <= 0) return null;

  const spaceWidth = spaceWidthFn(fontSize);
  if (spaceWidth <= 0) return null;

  const horizontalScale = gapWidth / spaceWidth;
  const baselineY = pageHeight - line.bbox.y1 - line.baseline.intercept;

  return {
    x: gapStart,
    y: baselineY,
    horizontalScale,
    fontSize,
  };
}
