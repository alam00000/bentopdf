import * as pdfjsLib from 'pdfjs-dist';

import type {
  CompareAnnotation,
  CompareImageRef,
  ComparePageModel,
  CompareTextItem,
  CharPosition,
  CompareWordToken,
} from '../types.ts';
import {
  joinCompareTextItems,
  normalizeCompareText,
  containsCJK,
  segmentCJKText,
} from './text-normalization.ts';

type PageTextItem = {
  str: string;
  width: number;
  height: number;
  transform: number[];
  dir: string;
  fontName: string;
  hasEOL: boolean;
};

type TextStyles = Record<string, { fontFamily?: string }>;

const measurementCanvas =
  typeof document !== 'undefined' ? document.createElement('canvas') : null;
const measurementContext = measurementCanvas
  ? measurementCanvas.getContext('2d')
  : null;
const textMeasurementCache: Map<string, number> | null = measurementContext
  ? new Map()
  : null;
let lastMeasurementFont = '';

import { COMPARE_TEXT, COMPARE_GEOMETRY } from '../config.ts';

const DEFAULT_CHAR_WIDTH = COMPARE_TEXT.DEFAULT_CHAR_WIDTH;
const DEFAULT_SPACE_WIDTH = COMPARE_TEXT.DEFAULT_SPACE_WIDTH;

function shouldJoinTokenWithPrevious(previous: string, current: string) {
  if (!previous) return false;
  if (/^[,.;:!?%)\]}]/.test(current)) return true;
  if (/^[''"'’”]/u.test(current)) return true;
  if (/[([{/"'“‘-]$/u.test(previous)) return true;
  return false;
}

function measureTextWidth(fontSpec: string, text: string): number {
  if (!measurementContext) {
    if (!text) return 0;
    if (text === ' ') return DEFAULT_SPACE_WIDTH;
    return text.length * DEFAULT_CHAR_WIDTH;
  }

  if (lastMeasurementFont !== fontSpec) {
    measurementContext.font = fontSpec;
    lastMeasurementFont = fontSpec;
  }

  const key = `${fontSpec}|${text}`;
  const cached = textMeasurementCache?.get(key);
  if (cached !== undefined) {
    return cached;
  }

  const width = measurementContext.measureText(text).width || 0;
  textMeasurementCache?.set(key, width);
  return width;
}

type FontNameMap = Map<string, string>;

function buildItemWordTokens(
  viewport: pdfjsLib.PageViewport,
  item: PageTextItem,
  fallbackRect: CompareTextItem['rect'],
  styles: TextStyles,
  fontNameMap: FontNameMap
): CompareWordToken[] {
  const rawText = item.str || '';
  if (!rawText.trim()) {
    return [];
  }

  const totalLen = Math.max(rawText.length, 1);
  const textStyle = item.fontName ? styles[item.fontName] : undefined;
  const fontFamily = textStyle?.fontFamily ?? 'sans-serif';
  const fontScale = Math.max(
    0.5,
    Math.hypot(item.transform[0], item.transform[1]) || 0
  );
  const fontSpec = `${fontScale}px ${fontFamily}`;

  const weights: number[] = new Array(totalLen);
  let runningText = '';
  let previousAdvance = 0;
  for (let index = 0; index < totalLen; index += 1) {
    runningText += rawText[index];
    const advance = measureTextWidth(fontSpec, runningText);
    let width = advance - previousAdvance;
    if (!Number.isFinite(width) || width <= 0) {
      width = rawText[index] === ' ' ? DEFAULT_SPACE_WIDTH : DEFAULT_CHAR_WIDTH;
    }
    weights[index] = width;
    previousAdvance = advance;
  }

  if (!Number.isFinite(previousAdvance) || previousAdvance <= 0) {
    for (let index = 0; index < totalLen; index += 1) {
      weights[index] =
        rawText[index] === ' ' ? DEFAULT_SPACE_WIDTH : DEFAULT_CHAR_WIDTH;
    }
  }

  const prefix: number[] = new Array(totalLen + 1);
  prefix[0] = 0;
  for (let index = 0; index < totalLen; index += 1) {
    prefix[index + 1] = prefix[index] + weights[index];
  }
  const totalWeight = prefix[totalLen] || 1;

  const rawX = item.transform[4];
  const rawY = item.transform[5];
  const transformed = [
    viewport.convertToViewportPoint(rawX, rawY),
    viewport.convertToViewportPoint(rawX + item.width, rawY),
    viewport.convertToViewportPoint(rawX, rawY + item.height),
    viewport.convertToViewportPoint(rawX + item.width, rawY + item.height),
  ];
  const xs = transformed.map(([x]) => x);
  const ys = transformed.map(([, y]) => y);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);

  const [baselineStart, baselineEnd, verticalEnd] = transformed;
  const baselineVector: [number, number] = [
    baselineEnd[0] - baselineStart[0],
    baselineEnd[1] - baselineStart[1],
  ];
  const verticalVector: [number, number] = [
    verticalEnd[0] - baselineStart[0],
    verticalEnd[1] - baselineStart[1],
  ];
  const hasOrientationVectors =
    Math.hypot(baselineVector[0], baselineVector[1]) > 1e-6 &&
    Math.hypot(verticalVector[0], verticalVector[1]) > 1e-6;

  const tokens: CompareWordToken[] = [];
  const wordRegex = /\S+/gu;
  let match: RegExpExecArray | null;
  let previousEnd = 0;

  while ((match = wordRegex.exec(rawText)) !== null) {
    const tokenText = match[0];
    const normalizedWord = normalizeCompareText(tokenText);
    if (!normalizedWord) {
      previousEnd = match.index + tokenText.length;
      continue;
    }

    const startIndex = match.index;
    const endIndex = startIndex + tokenText.length;
    const relStart = prefix[startIndex] / totalWeight;
    const relEnd = prefix[endIndex] / totalWeight;

    let wordLeft: number;
    let wordRight: number;
    let wordTop: number;
    let wordBottom: number;

    if (hasOrientationVectors) {
      const segStart: [number, number] = [
        baselineStart[0] + baselineVector[0] * relStart,
        baselineStart[1] + baselineVector[1] * relStart,
      ];
      const segEnd: [number, number] = [
        baselineStart[0] + baselineVector[0] * relEnd,
        baselineStart[1] + baselineVector[1] * relEnd,
      ];
      const cornerPoints: Array<[number, number]> = [
        segStart,
        [segStart[0] + verticalVector[0], segStart[1] + verticalVector[1]],
        [segEnd[0] + verticalVector[0], segEnd[1] + verticalVector[1]],
        segEnd,
      ];
      wordLeft = Math.min(...cornerPoints.map(([x]) => x));
      wordRight = Math.max(...cornerPoints.map(([x]) => x));
      wordTop = Math.min(...cornerPoints.map(([, y]) => y));
      wordBottom = Math.max(...cornerPoints.map(([, y]) => y));
    } else {
      const segLeft = left + (right - left) * relStart;
      const segRight = left + (right - left) * relEnd;
      wordLeft = Math.min(segLeft, segRight);
      wordRight = Math.max(segLeft, segRight);
      wordTop = top;
      wordBottom = bottom;
    }

    const width = Math.max(wordRight - wordLeft, 1);
    const height = Math.max(wordBottom - wordTop, fallbackRect.height);
    const gapText = rawText.slice(previousEnd, startIndex);

    const previousToken = tokens[tokens.length - 1];

    tokens.push({
      word: normalizedWord,
      compareWord: normalizedWord.toLowerCase(),
      rect: {
        x: Number.isFinite(wordLeft) ? wordLeft : fallbackRect.x,
        y: Number.isFinite(wordTop) ? wordTop : fallbackRect.y,
        width,
        height,
      },
      joinsWithPrevious:
        (gapText.length > 0 && !/\s/u.test(gapText)) ||
        (previousToken
          ? shouldJoinTokenWithPrevious(previousToken.word, normalizedWord)
          : false),
      fontName: fontNameMap.get(item.fontName) ?? item.fontName ?? undefined,
      fontSize: fontScale > 0 ? Math.round(fontScale * 100) / 100 : undefined,
    });

    previousEnd = endIndex;
  }

  if (!containsCJK(rawText)) return tokens;
  return tokens.flatMap(splitCJKWordToken);
}

function splitCJKWordToken(token: CompareWordToken): CompareWordToken[] {
  if (!containsCJK(token.word)) return [token];
  const segments = segmentCJKText(token.word);
  if (segments.length <= 1) return [token];

  const totalLen = token.word.length;
  const charWidth = token.rect.width / Math.max(totalLen, 1);
  let charOffset = 0;

  return segments.map((seg, i) => {
    const x = token.rect.x + charOffset * charWidth;
    const width = seg.length * charWidth;
    charOffset += seg.length;
    return {
      word: seg,
      compareWord: seg.toLowerCase(),
      rect: { x, y: token.rect.y, width, height: token.rect.height },
      joinsWithPrevious: i > 0 ? true : token.joinsWithPrevious,
      fontName: token.fontName,
      fontSize: token.fontSize,
    };
  });
}

function toRect(
  viewport: pdfjsLib.PageViewport,
  item: PageTextItem,
  index: number,
  styles: TextStyles,
  fontNameMap: FontNameMap
) {
  const normalizedText = normalizeCompareText(item.str);

  const transformed = pdfjsLib.Util.transform(
    viewport.transform,
    item.transform
  );
  const width = Math.max(item.width * viewport.scale, 1);
  const height = Math.max(
    Math.abs(transformed[3]) || item.height * viewport.scale,
    1
  );
  const x = transformed[4];
  const y = transformed[5] - height;

  const rect = {
    x,
    y,
    width,
    height,
  };

  return {
    id: `${index}-${normalizedText}`,
    text: item.str,
    normalizedText,
    rect,
    wordTokens: buildItemWordTokens(viewport, item, rect, styles, fontNameMap),
  } satisfies CompareTextItem;
}

export function sortCompareTextItems(items: CompareTextItem[]) {
  return [...items].sort((left, right) => {
    const lineTolerance = Math.max(
      Math.min(left.rect.height, right.rect.height) *
        COMPARE_GEOMETRY.LINE_TOLERANCE_FACTOR,
      COMPARE_GEOMETRY.MIN_LINE_TOLERANCE
    );
    const topDiff = left.rect.y - right.rect.y;

    if (Math.abs(topDiff) > lineTolerance) {
      return topDiff;
    }

    const xDiff = left.rect.x - right.rect.x;
    if (Math.abs(xDiff) > 1) {
      return xDiff;
    }

    return left.id.localeCompare(right.id);
  });
}

function averageCharacterWidth(item: CompareTextItem) {
  const compactText = item.normalizedText.replace(/\s+/g, '');
  return item.rect.width / Math.max(compactText.length, 1);
}

function shouldInsertSpaceBetweenItems(
  left: CompareTextItem,
  right: CompareTextItem
) {
  if (!left.normalizedText || !right.normalizedText) {
    return false;
  }

  if (/^[,.;:!?%)\]}]/.test(right.normalizedText)) {
    return false;
  }

  if (/^[''"'’”]/u.test(right.normalizedText)) {
    return false;
  }

  if (/[([{/"'“‘-]$/u.test(left.normalizedText)) {
    return false;
  }

  const gap = right.rect.x - (left.rect.x + left.rect.width);
  if (gap <= 0) {
    return false;
  }

  const leftWidth = averageCharacterWidth(left);
  const rightWidth = averageCharacterWidth(right);
  const threshold = Math.max(Math.min(leftWidth, rightWidth) * 0.45, 1.5);

  return gap >= threshold;
}

function mergeLineText(lineItems: CompareTextItem[]): {
  text: string;
  charMap: CharPosition[];
} {
  if (lineItems.length === 0) {
    return { text: '', charMap: [] };
  }

  const charMap: CharPosition[] = [];

  function pushFragChars(frag: CompareTextItem) {
    const fragText = frag.normalizedText;
    const fragCharWidth = frag.rect.width / Math.max(fragText.length, 1);
    for (let ci = 0; ci < fragText.length; ci++) {
      charMap.push({
        x: frag.rect.x + ci * fragCharWidth,
        width: fragCharWidth,
      });
    }
  }

  let merged = lineItems[0].normalizedText;
  pushFragChars(lineItems[0]);

  for (let index = 1; index < lineItems.length; index += 1) {
    const previous = lineItems[index - 1];
    const current = lineItems[index];

    if (shouldInsertSpaceBetweenItems(previous, current)) {
      const gap = current.rect.x - (previous.rect.x + previous.rect.width);
      charMap.push({
        x: previous.rect.x + previous.rect.width,
        width: Math.max(gap, 1),
      });
      merged += ` ${current.normalizedText}`;
    } else {
      merged += current.normalizedText;
    }
    pushFragChars(current);
  }

  return { text: normalizeCompareText(merged), charMap };
}

function mergeWordTokenRects(
  left: CompareWordToken,
  right: CompareWordToken
): CompareWordToken {
  const minX = Math.min(left.rect.x, right.rect.x);
  const minY = Math.min(left.rect.y, right.rect.y);
  const maxX = Math.max(
    left.rect.x + left.rect.width,
    right.rect.x + right.rect.width
  );
  const maxY = Math.max(
    left.rect.y + left.rect.height,
    right.rect.y + right.rect.height
  );

  return {
    word: `${left.word}${right.word}`,
    compareWord: `${left.compareWord}${right.compareWord}`,
    rect: {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    },
    fontName: left.fontName,
    fontSize: left.fontSize,
  };
}

function buildMergedWordTokens(lineItems: CompareTextItem[]) {
  if (
    !lineItems.some((item) => item.wordTokens && item.wordTokens.length > 0)
  ) {
    return undefined;
  }

  const mergedTokens: CompareWordToken[] = [];
  let previousItem: CompareTextItem | null = null;

  for (const item of lineItems) {
    const itemTokens =
      item.wordTokens && item.wordTokens.length > 0
        ? item.wordTokens
        : [
            {
              word: item.normalizedText,
              compareWord: item.normalizedText.toLowerCase(),
              rect: item.rect,
            } satisfies CompareWordToken,
          ];

    itemTokens.forEach((token, tokenIndex) => {
      const joinsAcrossItems =
        tokenIndex === 0 && previousItem
          ? !shouldInsertSpaceBetweenItems(previousItem, item)
          : false;
      const shouldJoin =
        mergedTokens.length > 0 &&
        (tokenIndex > 0 ? Boolean(token.joinsWithPrevious) : joinsAcrossItems);

      if (shouldJoin) {
        mergedTokens[mergedTokens.length - 1] = mergeWordTokenRects(
          mergedTokens[mergedTokens.length - 1],
          token
        );
      } else {
        mergedTokens.push({
          word: token.word,
          compareWord: token.compareWord,
          rect: token.rect,
          fontName: token.fontName,
          fontSize: token.fontSize,
        });
      }
    });

    previousItem = item;
  }

  return mergedTokens;
}

export function mergeIntoLines(
  sortedItems: CompareTextItem[]
): CompareTextItem[] {
  if (sortedItems.length === 0) return [];

  const lines: CompareTextItem[][] = [];
  let currentLine: CompareTextItem[] = [sortedItems[0]];

  for (let i = 1; i < sortedItems.length; i++) {
    const anchor = currentLine[0];
    const curr = sortedItems[i];
    const lineTolerance = Math.max(
      Math.min(anchor.rect.height, curr.rect.height) *
        COMPARE_GEOMETRY.LINE_TOLERANCE_FACTOR,
      COMPARE_GEOMETRY.MIN_LINE_TOLERANCE
    );

    if (Math.abs(curr.rect.y - anchor.rect.y) <= lineTolerance) {
      currentLine.push(curr);
    } else {
      lines.push(currentLine);
      currentLine = [curr];
    }
  }
  lines.push(currentLine);

  return lines.map((lineItems, lineIndex) => {
    const { text: normalizedText, charMap } = mergeLineText(lineItems);

    const minX = Math.min(...lineItems.map((item) => item.rect.x));
    const minY = Math.min(...lineItems.map((item) => item.rect.y));
    const maxX = Math.max(
      ...lineItems.map((item) => item.rect.x + item.rect.width)
    );
    const maxY = Math.max(
      ...lineItems.map((item) => item.rect.y + item.rect.height)
    );

    return {
      id: `line-${lineIndex}`,
      text: lineItems.map((item) => item.text).join(' '),
      normalizedText,
      rect: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      },
      fragments: lineItems,
      charMap,
      wordTokens: buildMergedWordTokens(lineItems),
    };
  });
}

function extractAnnotations(
  rawAnnotations: Array<Record<string, unknown>>,
  viewport: pdfjsLib.PageViewport
): CompareAnnotation[] {
  return rawAnnotations
    .filter((ann) => {
      const subtype = ann.subtype as string | undefined;
      return subtype && subtype !== 'Link' && subtype !== 'Widget';
    })
    .map((ann, index) => {
      const rawRect = ann.rect as number[] | undefined;
      let rect = { x: 0, y: 0, width: 0, height: 0 };
      if (rawRect && rawRect.length === 4) {
        const [p1, p2] = [
          viewport.convertToViewportPoint(rawRect[0], rawRect[1]),
          viewport.convertToViewportPoint(rawRect[2], rawRect[3]),
        ];
        const x = Math.min(p1[0], p2[0]);
        const y = Math.min(p1[1], p2[1]);
        rect = {
          x,
          y,
          width: Math.max(Math.abs(p2[0] - p1[0]), 1),
          height: Math.max(Math.abs(p2[1] - p1[1]), 1),
        };
      }
      const color = ann.color as number[] | undefined;
      return {
        id: `ann-${index}`,
        subtype: (ann.subtype as string) || 'Unknown',
        rect,
        contents: ((ann.contents as string) || '').trim(),
        title: ((ann.title as string) || '').trim(),
        color: color ? `rgb(${color.join(',')})` : '',
      };
    });
}

function extractImages(
  opList: { fnArray: number[]; argsArray: unknown[][] },
  viewport: pdfjsLib.PageViewport
): CompareImageRef[] {
  const OPS_PAINT_IMAGE = 85;
  const OPS_PAINT_INLINE_IMAGE = 84;
  const images: CompareImageRef[] = [];

  for (let i = 0; i < opList.fnArray.length; i++) {
    const op = opList.fnArray[i];
    if (op !== OPS_PAINT_IMAGE && op !== OPS_PAINT_INLINE_IMAGE) continue;

    const args = opList.argsArray[i];
    if (!args) continue;

    let imgWidth = 0;
    let imgHeight = 0;

    if (op === OPS_PAINT_INLINE_IMAGE && args[0]) {
      const imgData = args[0] as Record<string, unknown>;
      imgWidth = (imgData.width as number) || 0;
      imgHeight = (imgData.height as number) || 0;
    } else if (op === OPS_PAINT_IMAGE) {
      imgWidth = (args[1] as number) || 0;
      imgHeight = (args[2] as number) || 0;
    }

    if (imgWidth < 2 || imgHeight < 2) continue;

    const [vpX, vpY] = viewport.convertToViewportPoint(0, 0);
    const [vpX2, vpY2] = viewport.convertToViewportPoint(imgWidth, imgHeight);
    const x = Math.min(vpX, vpX2);
    const y = Math.min(vpY, vpY2);

    images.push({
      id: `img-${images.length}`,
      rect: {
        x,
        y,
        width: Math.abs(vpX2 - vpX) || imgWidth,
        height: Math.abs(vpY2 - vpY) || imgHeight,
      },
      width: imgWidth,
      height: imgHeight,
    });
  }

  return images;
}

export async function extractPageModel(
  page: pdfjsLib.PDFPageProxy,
  viewport: pdfjsLib.PageViewport
): Promise<ComparePageModel> {
  const [textContent, rawAnnotations, opList] = await Promise.all([
    page.getTextContent(),
    page
      .getAnnotations({ intent: 'any' })
      .catch(() => [] as Array<Record<string, unknown>>),
    page
      .getOperatorList()
      .catch(() => ({ fnArray: [] as number[], argsArray: [] as unknown[][] })),
  ]);
  const styles = textContent.styles ?? {};

  const fontNameMap: FontNameMap = new Map();
  const seenFonts = new Set<string>();
  for (const item of textContent.items) {
    if ('fontName' in item && typeof item.fontName === 'string') {
      seenFonts.add(item.fontName);
    }
  }
  for (const internalName of seenFonts) {
    try {
      if (page.commonObjs.has(internalName)) {
        const fontObj = page.commonObjs.get(internalName);
        if (fontObj?.name && typeof fontObj.name === 'string') {
          fontNameMap.set(internalName, fontObj.name);
        }
      }
    } catch (e) {
      console.warn(`Failed to resolve font name for "${internalName}"`, e);
    }
  }

  const rawItems = sortCompareTextItems(
    textContent.items
      .filter((item): item is PageTextItem => 'str' in item)
      .map((item, index) => toRect(viewport, item, index, styles, fontNameMap))
      .filter((item) => item.normalizedText.length > 0)
  );
  const textItems = mergeIntoLines(rawItems);

  return {
    pageNumber: page.pageNumber,
    width: viewport.width,
    height: viewport.height,
    textItems,
    plainText: joinCompareTextItems(textItems),
    hasText: textItems.length > 0,
    source: 'pdfjs',
    annotations: extractAnnotations(
      rawAnnotations as Array<Record<string, unknown>>,
      viewport
    ),
    images: extractImages(
      opList as { fnArray: number[]; argsArray: unknown[][] },
      viewport
    ),
  };
}
