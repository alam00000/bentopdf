import { describe, it, expect } from 'vitest';
import {
  PDFDocument,
  PDFName,
  PDFDict,
  PDFArray,
  PDFNumber,
  PDFRef,
} from 'pdf-lib';
import { flattenAnnotations } from '../js/utils/flatten-annotations';

function createAppearanceStream(
  doc: PDFDocument,
  bbox: [number, number, number, number]
): PDFRef {
  const stream = doc.context.stream('0 0 1 rg 0 0 100 20 re f', {
    Type: 'XObject',
    Subtype: 'Form',
    BBox: bbox,
  });
  return doc.context.register(stream);
}

function addAnnotation(
  doc: PDFDocument,
  page: ReturnType<PDFDocument['getPage']>,
  opts: {
    subtype: string;
    rect: [number, number, number, number];
    appearance?: PDFRef;
    flags?: number;
    hidden?: boolean;
  }
): PDFRef {
  const annotDict = doc.context.obj({
    Type: 'Annot',
    Subtype: opts.subtype,
    Rect: opts.rect,
  });

  if (opts.flags !== undefined) {
    annotDict.set(PDFName.of('F'), PDFNumber.of(opts.flags));
  }
  if (opts.hidden) {
    const base = typeof opts.flags === 'number' ? opts.flags : 0;
    annotDict.set(PDFName.of('F'), PDFNumber.of(base | 0x02));
  }

  const annot = annotDict;

  if (opts.appearance) {
    const apDict = doc.context.obj({ N: opts.appearance });
    (annot as PDFDict).set(PDFName.of('AP'), apDict);
  }

  const annotRef = doc.context.register(annot);

  const pageNode = page.node;
  let annotsArr = pageNode.Annots();
  if (!annotsArr) {
    annotsArr = doc.context.obj([]) as PDFArray;
    pageNode.set(PDFName.of('Annots'), annotsArr);
  }
  annotsArr.push(annotRef);

  return annotRef;
}

function getAnnotCount(page: ReturnType<PDFDocument['getPage']>): number {
  const annots = page.node.Annots();
  return annots ? annots.asArray().length : 0;
}

async function roundTrip(doc: PDFDocument): Promise<PDFDocument> {
  const bytes = await doc.save();
  return PDFDocument.load(bytes);
}

describe('flattenAnnotations', () => {
  it('should be a no-op on a PDF with no annotations', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([612, 792]);

    flattenAnnotations(doc);

    const reloaded = await roundTrip(doc);
    expect(reloaded.getPageCount()).toBe(1);
    expect(getAnnotCount(reloaded.getPage(0))).toBe(0);
  });

  it('should flatten a FreeText annotation and remove it from Annots', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([612, 792]);
    const appRef = createAppearanceStream(doc, [0, 0, 100, 20]);

    addAnnotation(doc, page, {
      subtype: 'FreeText',
      rect: [72, 700, 172, 720],
      appearance: appRef,
    });

    expect(getAnnotCount(page)).toBe(1);

    flattenAnnotations(doc);

    expect(getAnnotCount(page)).toBe(0);

    const reloaded = await roundTrip(doc);
    expect(reloaded.getPageCount()).toBe(1);
    expect(getAnnotCount(reloaded.getPage(0))).toBe(0);
  });

  it('should flatten multiple annotation types', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([612, 792]);

    const app1 = createAppearanceStream(doc, [0, 0, 100, 20]);
    const app2 = createAppearanceStream(doc, [0, 0, 50, 50]);
    const app3 = createAppearanceStream(doc, [0, 0, 200, 30]);

    addAnnotation(doc, page, {
      subtype: 'FreeText',
      rect: [72, 700, 172, 720],
      appearance: app1,
    });
    addAnnotation(doc, page, {
      subtype: 'Stamp',
      rect: [200, 600, 250, 650],
      appearance: app2,
    });
    addAnnotation(doc, page, {
      subtype: 'Ink',
      rect: [100, 500, 300, 530],
      appearance: app3,
    });

    expect(getAnnotCount(page)).toBe(3);

    flattenAnnotations(doc);

    expect(getAnnotCount(page)).toBe(0);

    const reloaded = await roundTrip(doc);
    expect(getAnnotCount(reloaded.getPage(0))).toBe(0);
  });

  it('should preserve Widget annotations', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([612, 792]);
    const appRef = createAppearanceStream(doc, [0, 0, 100, 20]);

    addAnnotation(doc, page, {
      subtype: 'Widget',
      rect: [72, 700, 172, 720],
      appearance: appRef,
    });
    addAnnotation(doc, page, {
      subtype: 'FreeText',
      rect: [72, 600, 172, 620],
      appearance: appRef,
    });

    expect(getAnnotCount(page)).toBe(2);

    flattenAnnotations(doc);

    expect(getAnnotCount(page)).toBe(1);

    const reloaded = await roundTrip(doc);
    const remaining = reloaded.getPage(0).node.Annots()!.asArray();
    const remainingAnnot = reloaded.context.lookup(remaining[0]) as PDFDict;
    const subtype = remainingAnnot.get(PDFName.of('Subtype'));
    expect(subtype).toEqual(PDFName.of('Widget'));
  });

  it('should remove Popup annotations without rendering', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([612, 792]);

    addAnnotation(doc, page, {
      subtype: 'Popup',
      rect: [72, 700, 272, 800],
    });

    expect(getAnnotCount(page)).toBe(1);

    flattenAnnotations(doc);

    expect(getAnnotCount(page)).toBe(0);
  });

  it('should remove hidden annotations without rendering', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([612, 792]);
    const appRef = createAppearanceStream(doc, [0, 0, 100, 20]);

    addAnnotation(doc, page, {
      subtype: 'FreeText',
      rect: [72, 700, 172, 720],
      appearance: appRef,
      hidden: true,
    });

    expect(getAnnotCount(page)).toBe(1);

    flattenAnnotations(doc);

    expect(getAnnotCount(page)).toBe(0);

    const reloaded = await roundTrip(doc);
    expect(getAnnotCount(reloaded.getPage(0))).toBe(0);
  });

  it('should remove annotations that have no appearance stream', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([612, 792]);

    addAnnotation(doc, page, {
      subtype: 'Text',
      rect: [72, 700, 92, 720],
    });

    expect(getAnnotCount(page)).toBe(1);

    flattenAnnotations(doc);

    expect(getAnnotCount(page)).toBe(0);
  });

  it('should handle annotations with zero-area Rect', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([612, 792]);
    const appRef = createAppearanceStream(doc, [0, 0, 100, 20]);

    addAnnotation(doc, page, {
      subtype: 'FreeText',
      rect: [72, 700, 72, 700],
      appearance: appRef,
    });

    expect(getAnnotCount(page)).toBe(1);

    flattenAnnotations(doc);

    expect(getAnnotCount(page)).toBe(0);
  });

  it('should flatten annotations across multiple pages', async () => {
    const doc = await PDFDocument.create();
    const page1 = doc.addPage([612, 792]);
    const page2 = doc.addPage([612, 792]);
    const appRef = createAppearanceStream(doc, [0, 0, 100, 20]);

    addAnnotation(doc, page1, {
      subtype: 'FreeText',
      rect: [72, 700, 172, 720],
      appearance: appRef,
    });
    addAnnotation(doc, page2, {
      subtype: 'Stamp',
      rect: [100, 500, 200, 520],
      appearance: appRef,
    });

    flattenAnnotations(doc);

    expect(getAnnotCount(page1)).toBe(0);
    expect(getAnnotCount(page2)).toBe(0);

    const reloaded = await roundTrip(doc);
    expect(reloaded.getPageCount()).toBe(2);
    expect(getAnnotCount(reloaded.getPage(0))).toBe(0);
    expect(getAnnotCount(reloaded.getPage(1))).toBe(0);
  });

  it('should leave pages without annotations untouched', async () => {
    const doc = await PDFDocument.create();
    const page1 = doc.addPage([612, 792]);
    const page2 = doc.addPage([612, 792]);
    const appRef = createAppearanceStream(doc, [0, 0, 100, 20]);

    addAnnotation(doc, page1, {
      subtype: 'FreeText',
      rect: [72, 700, 172, 720],
      appearance: appRef,
    });

    flattenAnnotations(doc);

    expect(getAnnotCount(page1)).toBe(0);
    expect(page2.node.Annots()).toBeUndefined();
  });

  it('should handle mixed Widget + renderable + Popup annotations', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([612, 792]);
    const appRef = createAppearanceStream(doc, [0, 0, 100, 20]);

    addAnnotation(doc, page, {
      subtype: 'Widget',
      rect: [10, 10, 110, 30],
      appearance: appRef,
    });
    addAnnotation(doc, page, {
      subtype: 'FreeText',
      rect: [72, 700, 172, 720],
      appearance: appRef,
    });
    addAnnotation(doc, page, {
      subtype: 'Popup',
      rect: [200, 200, 400, 400],
    });
    addAnnotation(doc, page, {
      subtype: 'Highlight',
      rect: [50, 500, 150, 520],
      appearance: appRef,
    });

    expect(getAnnotCount(page)).toBe(4);

    flattenAnnotations(doc);

    expect(getAnnotCount(page)).toBe(1);

    const reloaded = await roundTrip(doc);
    expect(getAnnotCount(reloaded.getPage(0))).toBe(1);
  });

  it('should produce a valid PDF that can be re-loaded after flattening', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([612, 792]);
    const appRef = createAppearanceStream(doc, [0, 0, 200, 50]);

    addAnnotation(doc, page, {
      subtype: 'FreeText',
      rect: [50, 700, 250, 750],
      appearance: appRef,
    });
    addAnnotation(doc, page, {
      subtype: 'Stamp',
      rect: [300, 600, 500, 650],
      appearance: appRef,
    });

    flattenAnnotations(doc);

    const first = await roundTrip(doc);
    const secondBytes = await first.save();
    const second = await PDFDocument.load(secondBytes);

    expect(second.getPageCount()).toBe(1);
    expect(getAnnotCount(second.getPage(0))).toBe(0);
  });

  it('should handle inverted Rect coordinates (x2 < x1)', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([612, 792]);
    const appRef = createAppearanceStream(doc, [0, 0, 100, 20]);

    addAnnotation(doc, page, {
      subtype: 'FreeText',
      rect: [172, 720, 72, 700],
      appearance: appRef,
    });

    flattenAnnotations(doc);

    expect(getAnnotCount(page)).toBe(0);

    const reloaded = await roundTrip(doc);
    expect(reloaded.getPageCount()).toBe(1);
  });
});
