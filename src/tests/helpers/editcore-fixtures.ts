import {
  buildPdf,
  buildTextPdf,
  textLine,
  escapePdfString,
} from './pdf-builder';

const LEADING = 14;

export function paragraphContent(
  lines: string[],
  x: number,
  topBaseline: number,
  size = 12,
  leading = LEADING,
  font = 'F1'
): string {
  return lines
    .map((t, i) => textLine(font, size, x, topBaseline - i * leading, t))
    .join('');
}

export const PARA_A = [
  'The quick brown fox jumps over the lazy dog and',
  'continues running through the quiet field until it',
  'finally rests beneath an old oak tree.',
];

export const PARA_B = [
  'A second paragraph starts well below the first one',
  'and has two lines of its own.',
];

export const A_TEXT = PARA_A.join(' ');
export const B_TEXT = PARA_B.join(' ');

export function twoParagraphPdf(): Uint8Array {
  return buildTextPdf({
    content:
      paragraphContent(PARA_A, 72, 700) + paragraphContent(PARA_B, 72, 620),
  });
}

export interface FreeTextSpec {
  rect: [number, number, number, number];
  contents: string;
  name?: string;
}

export function freeTextAnnotationPdf(annots: FreeTextSpec[]): Uint8Array {
  const body = new TextEncoder().encode(
    textLine('F1', 12, 72, 740, 'Existing page text')
  );
  const first = 6;
  const refs = annots.map((_, i) => `${first + i} 0 R`).join(' ');
  return buildPdf([
    { body: '<< /Type /Catalog /Pages 2 0 R >>' },
    { body: '<< /Type /Pages /Kids [3 0 R] /Count 1 >>' },
    {
      body:
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] ' +
        `/Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R /Annots [${refs}] >>`,
    },
    { body: `<< /Length ${body.length} >>`, stream: body },
    {
      body: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    },
    ...annots.map((a) => ({
      body:
        '<< /Type /Annot /Subtype /FreeText /F 4 ' +
        `/Rect [${a.rect.join(' ')}] ` +
        `/Contents (${escapePdfString(a.contents)}) ` +
        (a.name ? `/NM (${escapePdfString(a.name)}) ` : '') +
        '/DA (/Helv 12 Tf 0 g) >>',
    })),
  ]);
}
