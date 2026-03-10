import * as pdfjsLib from 'pdfjs-dist';

import type { ComparePageSignature, CompareTextItem } from '../types.ts';
import {
  joinNormalizedText,
  normalizeCompareText,
} from './text-normalization.ts';

type SignatureTextItem = {
  str: string;
  dir: string;
  transform: number[];
  width: number;
  height: number;
  fontName: string;
  hasEOL: boolean;
};

function tokenToItem(token: string, index: number): CompareTextItem {
  return {
    id: `token-${index}-${token}`,
    text: token,
    normalizedText: token,
    rect: { x: 0, y: 0, width: 0, height: 0 },
  };
}

export async function extractPageSignature(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number
): Promise<ComparePageSignature> {
  const page = await pdfDoc.getPage(pageNumber);
  const textContent = await page.getTextContent();
  const tokens = textContent.items
    .filter((item): item is SignatureTextItem => 'str' in item)
    .map((item) => normalizeCompareText(item.str))
    .filter(Boolean);

  const limitedTokens = tokens.slice(0, 500);

  return {
    pageNumber,
    plainText: joinNormalizedText(limitedTokens),
    hasText: limitedTokens.length > 0,
    tokenItems: limitedTokens.map((token, index) => tokenToItem(token, index)),
  };
}

export async function extractDocumentSignatures(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  onProgress?: (pageNumber: number, totalPages: number) => void
) {
  const signatures: ComparePageSignature[] = [];

  for (let pageNumber = 1; pageNumber <= pdfDoc.numPages; pageNumber += 1) {
    onProgress?.(pageNumber, pdfDoc.numPages);
    signatures.push(await extractPageSignature(pdfDoc, pageNumber));
  }

  return signatures;
}
