import { describe, it, expect } from 'vitest';
import { PDFDocument, degrees } from 'pdf-lib';
import { rotateLandscapeToPortrait } from '../js/utils/pdf-operations';

async function createPdf(
  pages: { size: [number, number]; rotate?: number }[]
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (const { size, rotate } of pages) {
    const page = doc.addPage(size);
    if (rotate) page.setRotation(degrees(rotate));
  }
  return new Uint8Array(await doc.save());
}

async function rotations(bytes: Uint8Array): Promise<number[]> {
  const doc = await PDFDocument.load(bytes);
  return doc.getPages().map((p) => p.getRotation().angle);
}

describe('rotateLandscapeToPortrait', () => {
  it('rotates only landscape pages and keeps page order', async () => {
    const input = await createPdf([
      { size: [595, 842] },
      { size: [842, 595] },
      { size: [595, 842] },
    ]);
    const out = await rotateLandscapeToPortrait(input);
    expect(await rotations(out)).toEqual([0, 90, 0]);
  });

  it('treats a portrait media box with /Rotate 90 as landscape', async () => {
    const input = await createPdf([{ size: [595, 842], rotate: 90 }]);
    const out = await rotateLandscapeToPortrait(input);
    expect(await rotations(out)).toEqual([180]);
  });

  it('leaves a landscape media box with /Rotate 90 alone (already portrait)', async () => {
    const input = await createPdf([{ size: [842, 595], rotate: 90 }]);
    const out = await rotateLandscapeToPortrait(input);
    expect(await rotations(out)).toEqual([90]);
  });

  it('supports counter-clockwise direction', async () => {
    const input = await createPdf([{ size: [842, 595] }]);
    const out = await rotateLandscapeToPortrait(input, 270);
    expect(await rotations(out)).toEqual([270]);
  });

  it('does not touch square pages', async () => {
    const input = await createPdf([{ size: [600, 600] }]);
    const out = await rotateLandscapeToPortrait(input);
    expect(await rotations(out)).toEqual([0]);
  });
});
