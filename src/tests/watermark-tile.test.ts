import { describe, it, expect } from 'vitest';
import {
  computeTileCenters,
  addImageWatermark,
} from '../js/utils/pdf-operations';
import {
  PDFArray,
  PDFDocument,
  PDFName,
  PDFObject,
  PDFRawStream,
  PDFRef,
} from 'pdf-lib';
import { inflateSync } from 'node:zlib';

const PNG_1X1_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

function pngBytes(): Uint8Array {
  return new Uint8Array(Buffer.from(PNG_1X1_BASE64, 'base64'));
}

async function createTestPdf(pageCount: number): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    doc.addPage([612, 792]);
  }
  return new Uint8Array(await doc.save());
}

function resolve(doc: PDFDocument, ref?: PDFObject): PDFObject | undefined {
  if (ref instanceof PDFRef) {
    return doc.context.lookup(ref) as PDFObject | undefined;
  }
  return ref;
}

function decodeStream(doc: PDFDocument, ref?: PDFObject): string {
  const stream = resolve(doc, ref);
  if (!(stream instanceof PDFRawStream)) return '';
  const raw = Buffer.from(stream.contents);
  const filter = stream.dict.get(PDFName.of('Filter'));
  return filter?.toString().includes('FlateDecode')
    ? inflateSync(raw).toString('latin1')
    : raw.toString('latin1');
}

async function countDrawOpsPerPage(bytes: Uint8Array): Promise<number[]> {
  const doc = await PDFDocument.load(bytes);
  return doc.getPages().map((page) => {
    const contents = page.node.get(PDFName.of('Contents'));
    const resolved = doc.context.lookup(contents);
    const parts =
      resolved instanceof PDFArray
        ? resolved.asArray().map((entry) => decodeStream(doc, entry))
        : [decodeStream(doc, contents)];
    return parts.join('\n').match(/\/[^\s/[\]<>()]+\s+Do\b/g)?.length ?? 0;
  });
}

async function countDrawOps(bytes: Uint8Array): Promise<number> {
  const perPage = await countDrawOpsPerPage(bytes);
  return perPage.reduce((sum, n) => sum + n, 0);
}

describe('computeTileCenters', () => {
  const page = { pageWidth: 612, pageHeight: 792 };

  it('produces a single-row-and-column-aligned grid at angle 0', () => {
    const centers = computeTileCenters({
      ...page,
      itemWidth: 100,
      itemHeight: 100,
      angle: 0,
      gapX: 0,
      gapY: 0,
    });

    expect(centers.length).toBeGreaterThan(1);

    const xs = [...new Set(centers.map((c) => Math.round(c.x)))].sort(
      (a, b) => a - b
    );
    const ys = [...new Set(centers.map((c) => Math.round(c.y)))].sort(
      (a, b) => a - b
    );

    for (let i = 1; i < xs.length; i++) expect(xs[i] - xs[i - 1]).toBe(100);
    for (let i = 1; i < ys.length; i++) expect(ys[i] - ys[i - 1]).toBe(100);
    expect(centers.length).toBe(xs.length * ys.length);
  });

  it('covers the whole page including all four corners', () => {
    const centers = computeTileCenters({
      ...page,
      itemWidth: 200,
      itemHeight: 60,
      angle: 45,
      gapX: 0.2,
      gapY: 0.5,
    });

    const radius = Math.hypot(200, 60) / 2;
    const corners = [
      { x: 0, y: 0 },
      { x: 612, y: 0 },
      { x: 0, y: 792 },
      { x: 612, y: 792 },
    ];

    for (const corner of corners) {
      const nearest = Math.min(
        ...centers.map((c) => Math.hypot(c.x - corner.x, c.y - corner.y))
      );
      expect(nearest).toBeLessThanOrEqual(radius);
    }
  });

  it('keeps every tile within reach of the page', () => {
    const centers = computeTileCenters({
      ...page,
      itemWidth: 150,
      itemHeight: 50,
      angle: -45,
      gapX: 0.25,
      gapY: 0.75,
    });

    const cos = Math.abs(Math.cos((-45 * Math.PI) / 180));
    const sin = Math.abs(Math.sin((-45 * Math.PI) / 180));
    const halfExtentX = (cos * 150 + sin * 50) / 2;
    const halfExtentY = (sin * 150 + cos * 50) / 2;

    for (const c of centers) {
      expect(c.x).toBeGreaterThanOrEqual(-halfExtentX);
      expect(c.x).toBeLessThanOrEqual(612 + halfExtentX);
      expect(c.y).toBeGreaterThanOrEqual(-halfExtentY);
      expect(c.y).toBeLessThanOrEqual(792 + halfExtentY);
    }
  });

  it('is symmetric about the page center', () => {
    const centers = computeTileCenters({
      ...page,
      itemWidth: 120,
      itemHeight: 40,
      angle: 30,
      gapX: 0.5,
      gapY: 0.5,
    });

    const keys = new Set(
      centers.map((c) => `${c.x.toFixed(3)}:${c.y.toFixed(3)}`)
    );
    for (const c of centers) {
      const mirrorX = (612 - c.x).toFixed(3);
      const mirrorY = (792 - c.y).toFixed(3);
      expect(keys.has(`${mirrorX}:${mirrorY}`)).toBe(true);
    }
  });

  it('spaces tiles further apart as the gap grows', () => {
    const tight = computeTileCenters({
      ...page,
      itemWidth: 100,
      itemHeight: 40,
      angle: -45,
      gapX: 0,
      gapY: 0,
    });
    const loose = computeTileCenters({
      ...page,
      itemWidth: 100,
      itemHeight: 40,
      angle: -45,
      gapX: 1,
      gapY: 2,
    });

    expect(loose.length).toBeLessThan(tight.length);
    expect(loose.length).toBeGreaterThan(0);
  });

  it('treats negative gaps as zero', () => {
    const negative = computeTileCenters({
      ...page,
      itemWidth: 100,
      itemHeight: 40,
      angle: 0,
      gapX: -5,
      gapY: -5,
    });
    const zero = computeTileCenters({
      ...page,
      itemWidth: 100,
      itemHeight: 40,
      angle: 0,
      gapX: 0,
      gapY: 0,
    });

    expect(negative).toEqual(zero);
  });

  it('caps the tile count for tiny watermarks', () => {
    const centers = computeTileCenters({
      ...page,
      itemWidth: 1,
      itemHeight: 1,
      angle: 0,
      gapX: 0,
      gapY: 0,
    });

    expect(centers.length).toBeGreaterThan(0);
    expect(centers.length).toBeLessThanOrEqual(3000);
  });

  it('stays bounded for extreme aspect ratios', () => {
    const wide = computeTileCenters({
      ...page,
      itemWidth: 5000,
      itemHeight: 2,
      angle: 17,
      gapX: 0,
      gapY: 0,
    });
    const tall = computeTileCenters({
      ...page,
      itemWidth: 1,
      itemHeight: 5000,
      angle: 0,
      gapX: 0,
      gapY: 0,
    });

    for (const centers of [wide, tall]) {
      expect(centers.length).toBeGreaterThan(0);
      expect(centers.length).toBeLessThanOrEqual(3000);
      expect(
        centers.every((c) => Number.isFinite(c.x) && Number.isFinite(c.y))
      ).toBe(true);
    }
  });

  it('ignores a non-finite angle', () => {
    expect(
      computeTileCenters({
        ...page,
        itemWidth: 100,
        itemHeight: 40,
        angle: Number.NaN,
        gapX: 0,
        gapY: 0,
      })
    ).toEqual([]);
  });

  it('returns nothing for degenerate input', () => {
    expect(
      computeTileCenters({
        pageWidth: 0,
        pageHeight: 792,
        itemWidth: 10,
        itemHeight: 10,
        angle: 0,
        gapX: 0,
        gapY: 0,
      })
    ).toEqual([]);

    expect(
      computeTileCenters({
        ...page,
        itemWidth: 0,
        itemHeight: 10,
        angle: 0,
        gapX: 0,
        gapY: 0,
      })
    ).toEqual([]);

    expect(
      computeTileCenters({
        ...page,
        itemWidth: Number.NaN,
        itemHeight: 10,
        angle: 0,
        gapX: 0,
        gapY: 0,
      })
    ).toEqual([]);

    expect(
      computeTileCenters({
        ...page,
        itemWidth: -10,
        itemHeight: 10,
        angle: 0,
        gapX: 0,
        gapY: 0,
      })
    ).toEqual([]);
  });
});

describe('addImageWatermark tiling', () => {
  it('draws the watermark once per page in single mode', async () => {
    const result = await addImageWatermark(await createTestPdf(2), {
      imageBytes: pngBytes(),
      imageType: 'png',
      opacity: 0.3,
      angle: -45,
      scale: 100,
    });

    expect(await countDrawOps(result)).toBe(2);
  });

  it('repeats the watermark across each page in tile mode', async () => {
    const single = await addImageWatermark(await createTestPdf(1), {
      imageBytes: pngBytes(),
      imageType: 'png',
      opacity: 0.3,
      angle: -45,
      scale: 100,
    });
    const tiled = await addImageWatermark(await createTestPdf(1), {
      imageBytes: pngBytes(),
      imageType: 'png',
      opacity: 0.3,
      angle: -45,
      scale: 100,
      tile: true,
      tileGapX: 0.25,
      tileGapY: 0.75,
    });

    expect(await countDrawOps(single)).toBe(1);
    expect(await countDrawOps(tiled)).toBeGreaterThan(10);
  });

  it('only tiles the selected pages', async () => {
    const tiled = await addImageWatermark(await createTestPdf(3), {
      imageBytes: pngBytes(),
      imageType: 'png',
      opacity: 0.3,
      angle: 0,
      scale: 100,
      pageIndices: [1],
      tile: true,
      tileGapX: 0.25,
      tileGapY: 0.75,
    });

    const doc = await PDFDocument.load(tiled);
    expect(doc.getPageCount()).toBe(3);
    const perPage = await countDrawOpsPerPage(tiled);
    expect(perPage[0]).toBe(0);
    expect(perPage[1]).toBeGreaterThan(10);
    expect(perPage[2]).toBe(0);

    const untouched = await addImageWatermark(await createTestPdf(3), {
      imageBytes: pngBytes(),
      imageType: 'png',
      opacity: 0.3,
      angle: 0,
      scale: 100,
      pageIndices: [],
      tile: true,
    });
    expect(await countDrawOps(untouched)).toBe(0);
  });

  it('produces a loadable PDF with a bounded size when tiling', async () => {
    const tiled = await addImageWatermark(await createTestPdf(5), {
      imageBytes: pngBytes(),
      imageType: 'png',
      opacity: 0.2,
      angle: -45,
      scale: 20,
      tile: true,
      tileGapX: 0,
      tileGapY: 0,
    });

    const doc = await PDFDocument.load(tiled);
    expect(doc.getPageCount()).toBe(5);
    expect(tiled.byteLength).toBeLessThan(5 * 1024 * 1024);
  });
});
