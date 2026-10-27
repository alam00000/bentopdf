import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFObject,
  PDFRawStream,
  PDFRef,
  PDFString,
  decodePDFRawStream,
} from 'pdf-lib';

vi.mock('../js/utils/helpers.js', async () => {
  const { default: createModule } = await import('@neslinesli93/qpdf-wasm');
  const wasmPath = resolve(
    'node_modules/@neslinesli93/qpdf-wasm/dist/qpdf.wasm'
  );
  const options = {
    locateFile: () => wasmPath,
    wasmBinary: readFileSync(wasmPath),
    print: () => {},
    printErr: () => {},
  };
  const qpdf = await createModule(options);
  return { initializeQpdf: async () => qpdf };
});

const { sanitizePdf, defaultSanitizeOptions } =
  await import('../js/utils/sanitize.js');
const { parseContentOperations } =
  await import('../js/utils/pdf-content-tokens.js');

const NONE = {
  flattenForms: false,
  removeMetadata: false,
  removeAnnotations: false,
  removeJavascript: false,
  removeEmbeddedFiles: false,
  removeLayers: false,
  removeLinks: false,
  removeStructureTree: false,
  removeMarkInfo: false,
  removeFonts: false,
};

const latin1 = (bytes: Uint8Array) => Buffer.from(bytes).toString('latin1');

function collectText(value: PDFObject | undefined, out: string[]) {
  if (value instanceof PDFString || value instanceof PDFHexString) {
    out.push(value.decodeText());
  } else if (value instanceof PDFDict) {
    for (const [key, v] of value.entries()) {
      out.push(key.decodeText());
      collectText(v, out);
    }
  } else if (value instanceof PDFArray) {
    for (const v of value.asArray()) collectText(v, out);
  }
}

async function allText(bytes: Uint8Array): Promise<string> {
  const doc = await PDFDocument.load(bytes, { updateMetadata: false });
  const out: string[] = [latin1(bytes)];
  for (const [, object] of doc.context.enumerateIndirectObjects()) {
    if (object instanceof PDFRawStream) {
      collectText(object.dict, out);
      out.push(latin1(decodePDFRawStream(object).decode()));
    } else {
      collectText(object, out);
    }
  }
  return out.join('\n');
}

async function pageContent(doc: PDFDocument): Promise<string> {
  const contents = doc.getPages()[0].node.Contents();
  const streams =
    contents instanceof PDFArray ? contents.asArray() : [contents];
  return streams
    .map((item) => doc.context.lookup(item))
    .map((stream) =>
      stream instanceof PDFRawStream
        ? latin1(decodePDFRawStream(stream).decode())
        : ''
    )
    .join('\n');
}

function lookupDict(doc: PDFDocument, value: PDFObject | undefined) {
  const result = doc.context.lookup(value);
  return result instanceof PDFDict ? result : undefined;
}

async function buildActionDocument(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([300, 300]);
  const ctx = doc.context;

  const outlines = ctx.nextRef();
  const first = ctx.nextRef();
  const second = ctx.nextRef();
  ctx.assign(
    first,
    ctx.obj({
      Title: PDFString.of('Chapter one'),
      Parent: outlines,
      Next: second,
      A: ctx.register(
        ctx.obj({
          S: 'JavaScript',
          JS: PDFString.of("app.alert('outline-js')"),
        })
      ),
    })
  );
  ctx.assign(
    second,
    ctx.obj({
      Title: PDFString.of('Chapter two'),
      Parent: outlines,
      Prev: first,
      A: ctx.obj({
        S: 'Launch',
        F: PDFString.of('launch-calc.exe'),
      }),
    })
  );
  ctx.assign(
    outlines,
    ctx.obj({ Type: 'Outlines', First: first, Last: second, Count: 2 })
  );
  doc.catalog.set(PDFName.of('Outlines'), outlines);
  doc.catalog.set(
    PDFName.of('OpenAction'),
    ctx.obj([page.ref, PDFName.of('Fit')])
  );

  const nextJs = ctx.register(
    ctx.obj({ S: 'JavaScript', JS: PDFString.of("app.alert('next-js')") })
  );
  const link = ctx.register(
    ctx.obj({
      Type: 'Annot',
      Subtype: 'Link',
      Rect: [10, 10, 100, 30],
      A: ctx.obj({
        S: 'URI',
        URI: PDFString.of('https://example.com/keep'),
        Next: nextJs,
      }),
    })
  );
  const chained = ctx.register(
    ctx.obj({
      Type: 'Annot',
      Subtype: 'Link',
      Rect: [10, 40, 100, 60],
      A: ctx.obj({
        S: 'SubmitForm',
        F: PDFString.of('https://submit-url.example'),
        Next: ctx.obj({
          S: 'URI',
          URI: PDFString.of('https://example.com/after-submit'),
        }),
      }),
    })
  );
  const importData = ctx.register(
    ctx.obj({
      Type: 'Annot',
      Subtype: 'Link',
      Rect: [10, 70, 100, 90],
      A: ctx.obj({ S: 'ImportData', F: PDFString.of('import-data.fdf') }),
    })
  );

  const appearance = ctx.register(
    ctx.flateStream('0 0 1 rg 0 0 80 20 re f', {
      Type: 'XObject',
      Subtype: 'Form',
      BBox: [0, 0, 80, 20],
    })
  );
  const parentField = ctx.nextRef();
  const childField = ctx.register(
    ctx.obj({
      Type: 'Annot',
      Subtype: 'Widget',
      FT: 'Tx',
      T: PDFString.of('child'),
      Parent: parentField,
      Rect: [10, 100, 90, 120],
      P: page.ref,
      AP: { N: appearance },
      AA: {
        K: ctx.obj({
          S: 'JavaScript',
          JS: PDFString.of("app.alert('nested-aa-js')"),
        }),
      },
    })
  );
  ctx.assign(
    parentField,
    ctx.obj({ T: PDFString.of('parent'), Kids: [childField] })
  );
  const xfa = ctx.register(
    ctx.flateStream('<xdp:xdp><script>xfa-script</script></xdp:xdp>')
  );
  doc.catalog.set(
    PDFName.of('AcroForm'),
    ctx.obj({ Fields: [parentField], XFA: xfa })
  );

  page.node.set(
    PDFName.of('Annots'),
    ctx.obj([link, chained, importData, childField])
  );
  return doc.save();
}

async function buildMetadataDocument(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([300, 300]);
  const ctx = doc.context;
  const xmp = (text: string) =>
    ctx.register(
      ctx.flateStream(`<x:xmpmeta>${text}</x:xmpmeta>`, {
        Type: 'Metadata',
        Subtype: 'XML',
      })
    );

  const image = ctx.register(
    ctx.stream(new Uint8Array([0, 128, 255, 64]), {
      Type: 'XObject',
      Subtype: 'Image',
      Width: 2,
      Height: 2,
      ColorSpace: 'DeviceGray',
      BitsPerComponent: 8,
      Metadata: xmp('image-xmp-secret'),
    })
  );
  const form = ctx.register(
    ctx.flateStream('0 0 1 rg 0 0 10 10 re f', {
      Type: 'XObject',
      Subtype: 'Form',
      BBox: [0, 0, 10, 10],
      Metadata: xmp('form-xmp-secret'),
      PieceInfo: { App: { Private: PDFString.of('form-piece-secret') } },
    })
  );
  page.node.set(
    PDFName.of('Resources'),
    ctx.obj({ XObject: { Im1: image, Fm1: form } })
  );
  page.node.set(
    PDFName.of('Contents'),
    ctx.register(ctx.flateStream('q 100 0 0 100 0 0 cm /Im1 Do Q q /Fm1 Do Q'))
  );
  page.node.set(PDFName.of('Metadata'), xmp('page-xmp-secret'));
  page.node.set(
    PDFName.of('PieceInfo'),
    ctx.obj({ App: { Private: PDFString.of('page-piece-secret') } })
  );
  page.node.set(
    PDFName.of('Thumb'),
    ctx.register(
      ctx.flateStream('thumb-secret-pixels', {
        Width: 1,
        Height: 1,
        ColorSpace: 'DeviceGray',
        BitsPerComponent: 8,
      })
    )
  );
  doc.catalog.set(
    PDFName.of('PieceInfo'),
    ctx.obj({ App: { Private: PDFString.of('catalog-piece-secret') } })
  );
  doc.catalog.set(PDFName.of('Metadata'), xmp('catalog-xmp-secret'));
  return doc.save();
}

const PAGE_CONTENT = [
  'q',
  '/OC /MCon BDC 0 0 1 rg 10 10 50 50 re f',
  'BT /F1 12 Tf 20 200 Td (ON-LAYER-TEXT) Tj ET',
  'BI /W 4 /H 1 /BPC 8 /CS /G ID \x20EI\x80 EI',
  'EMC',
  '/OC /MCoff BDC 1 0 0 rg 100 100 m 200 200 l S',
  'q 0 0 10 10 re W n Q',
  'BT /F1 12 Tf 20 220 Td (OFF-LAYER-TEXT EMC (inner) \\) tail) Tj',
  '<4f46462d484558> Tj % EMC in a comment',
  '/Span <</ActualText (OFF-ACTUAL)>> BDC (x) Tj EMC ET',
  'BI /W 2 /H 1 /BPC 8 /CS /G ID \x10\xff EI',
  '/ImOff Do',
  'EMC',
  '/OC /MCmd BDC BT /F1 12 Tf 20 240 Td (OCMD-HIDDEN-TEXT) Tj ET EMC',
  '/OC /MCve BDC BT /F1 12 Tf 20 260 Td (VE-HIDDEN-TEXT) Tj ET EMC',
  '/FmOff Do',
  '/FmOn Do',
  '/ImOff Do',
  'Q',
].join('\n');

async function buildLayerDocument(content = PAGE_CONTENT): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([300, 300]);
  const ctx = doc.context;

  const on = ctx.register(ctx.obj({ Type: 'OCG', Name: PDFString.of('On') }));
  const off = ctx.register(ctx.obj({ Type: 'OCG', Name: PDFString.of('Off') }));
  const ocmd = ctx.register(
    ctx.obj({ Type: 'OCMD', OCGs: [on, off], P: 'AllOn' })
  );
  const ocmdVe = ctx.register(
    ctx.obj({
      Type: 'OCMD',
      OCGs: [on],
      VE: [PDFName.of('And'), on, [PDFName.of('Not'), on]],
    })
  );
  doc.catalog.set(
    PDFName.of('OCProperties'),
    ctx.obj({ OCGs: [on, off], D: { Order: [on, off], ON: [on], OFF: [off] } })
  );

  const font = ctx.register(
    ctx.obj({ Type: 'Font', Subtype: 'Type1', BaseFont: 'Helvetica' })
  );
  const formOff = ctx.register(
    ctx.flateStream('BT /F1 12 Tf (FORM-OFF-TEXT) Tj ET', {
      Type: 'XObject',
      Subtype: 'Form',
      BBox: [0, 0, 300, 300],
      OC: off,
      Resources: { Font: { F1: font } },
    })
  );
  const formOn = ctx.register(
    ctx.flateStream(
      'BT /F1 12 Tf (FORM-ON-TEXT) Tj ET /OC /P0 BDC BT /F1 12 Tf (FORM-NESTED-OFF) Tj ET EMC',
      {
        Type: 'XObject',
        Subtype: 'Form',
        BBox: [0, 0, 300, 300],
        OC: on,
        Resources: { Font: { F1: font }, Properties: { P0: off } },
      }
    )
  );
  const imageOff = ctx.register(
    ctx.stream('IMAGE-OFF-PIXELS', {
      Type: 'XObject',
      Subtype: 'Image',
      Width: 4,
      Height: 4,
      ColorSpace: 'DeviceGray',
      BitsPerComponent: 8,
      OC: off,
    })
  );

  page.node.set(
    PDFName.of('Resources'),
    ctx.obj({
      Font: { F1: font },
      Properties: { MCon: on, MCoff: off, MCmd: ocmd, MCve: ocmdVe },
      XObject: { FmOff: formOff, FmOn: formOn, ImOff: imageOff },
    })
  );
  page.node.set(PDFName.of('Contents'), ctx.register(ctx.flateStream(content)));

  const square = (text: string, oc: PDFRef) =>
    ctx.register(
      ctx.obj({
        Type: 'Annot',
        Subtype: 'Square',
        Rect: [10, 10, 50, 50],
        Contents: PDFString.of(text),
        OC: oc,
      })
    );
  page.node.set(
    PDFName.of('Annots'),
    ctx.obj([square('annot-off-layer', off), square('annot-on-layer', on)])
  );
  return doc.save();
}

describe('sanitize remove JavaScript', () => {
  it('removes every reachable script, launch, submit and XFA but keeps links', async () => {
    const input = await buildActionDocument();
    const before = await allText(input);
    for (const secret of [
      'outline-js',
      'launch-calc.exe',
      'next-js',
      'nested-aa-js',
      'xfa-script',
      'submit-url',
      'import-data.fdf',
    ]) {
      expect(before).toContain(secret);
    }

    const { bytes } = await sanitizePdf(input, {
      ...NONE,
      removeJavascript: true,
    });
    const after = await allText(bytes);
    for (const secret of [
      'outline-js',
      'launch-calc.exe',
      'next-js',
      'nested-aa-js',
      'xfa-script',
      'submit-url',
      'import-data.fdf',
      'JavaScript',
      'XFA',
    ]) {
      expect(after).not.toContain(secret);
    }
    expect(after).toContain('https://example.com/keep');
    expect(after).toContain('https://example.com/after-submit');
    expect(after).toContain('Chapter one');
    expect(after).toContain('Chapter two');

    const doc = await PDFDocument.load(bytes, { updateMetadata: false });
    const annots = doc.getPages()[0].node.Annots()!;
    const linkAction = lookupDict(
      doc,
      lookupDict(doc, annots.get(0))?.get(PDFName.of('A'))
    );
    expect(linkAction?.get(PDFName.of('S'))).toBe(PDFName.of('URI'));
    expect(linkAction?.has(PDFName.of('Next'))).toBe(false);
    const promoted = lookupDict(
      doc,
      lookupDict(doc, annots.get(1))?.get(PDFName.of('A'))
    );
    expect(promoted?.get(PDFName.of('S'))).toBe(PDFName.of('URI'));
    expect(doc.catalog.get(PDFName.of('OpenAction'))).toBeInstanceOf(PDFArray);
  });
});

describe('sanitize remove metadata', () => {
  it('drops page, XObject and catalog metadata, piece info and thumbnails', async () => {
    const input = await buildMetadataDocument();
    const secrets = [
      'image-xmp-secret',
      'form-xmp-secret',
      'form-piece-secret',
      'page-xmp-secret',
      'page-piece-secret',
      'thumb-secret-pixels',
      'catalog-piece-secret',
      'catalog-xmp-secret',
    ];
    const before = await allText(input);
    for (const secret of secrets) expect(before).toContain(secret);

    const { bytes } = await sanitizePdf(input, {
      ...NONE,
      removeMetadata: true,
    });
    const after = await allText(bytes);
    for (const secret of secrets) expect(after).not.toContain(secret);

    const doc = await PDFDocument.load(bytes, { updateMetadata: false });
    const xObjects = doc
      .getPages()[0]
      .node.Resources()
      ?.lookup(PDFName.of('XObject'), PDFDict);
    expect(xObjects?.has(PDFName.of('Im1'))).toBe(true);
    expect(xObjects?.has(PDFName.of('Fm1'))).toBe(true);
  });
});

describe('sanitize remove layers', () => {
  it('removes content in hidden layers and keeps visible layers', async () => {
    const input = await buildLayerDocument();
    const { bytes } = await sanitizePdf(input, {
      ...NONE,
      removeLayers: true,
    });

    const doc = await PDFDocument.load(bytes, { updateMetadata: false });
    expect(doc.catalog.has(PDFName.of('OCProperties'))).toBe(false);

    const content = await pageContent(doc);
    expect(content).toContain('(ON-LAYER-TEXT) Tj');
    expect(content).toContain('0 0 1 rg 10 10 50 50 re f');
    expect(content).toContain('BI /W 4 /H 1 /BPC 8 /CS /G ID \x20EI\x80 EI');
    expect(content).toContain('/FmOn Do');
    expect(content).toMatch(/0 0 10 10 re\s+W\s+n/);
    for (const hidden of [
      'OFF-LAYER-TEXT',
      'inner',
      'tail',
      '4f46462d484558',
      'OFF-ACTUAL',
      'OCMD-HIDDEN-TEXT',
      'VE-HIDDEN-TEXT',
      '200 200 l',
      '/FmOff',
      '/ImOff',
      '\x10\xff',
    ]) {
      expect(content).not.toContain(hidden);
    }
    expect(content.match(/\bq\b/g)?.length).toBe(
      content.match(/\bQ\b/g)?.length
    );

    const text = await allText(bytes);
    expect(text).toContain('FORM-ON-TEXT');
    expect(text).toContain('annot-on-layer');
    for (const hidden of [
      'FORM-OFF-TEXT',
      'FORM-NESTED-OFF',
      'IMAGE-OFF-PIXELS',
      'annot-off-layer',
      'OCMD',
    ]) {
      expect(text).not.toContain(hidden);
    }
    expect(doc.getPages()[0].node.Annots()?.size()).toBe(1);
  });

  it('removes hidden layers with the default options', async () => {
    const { bytes } = await sanitizePdf(
      await buildLayerDocument(),
      defaultSanitizeOptions
    );
    const doc = await PDFDocument.load(bytes, { updateMetadata: false });
    expect(doc.catalog.has(PDFName.of('OCProperties'))).toBe(false);
    const text = await allText(bytes);
    expect(text).toContain('ON-LAYER-TEXT');
    expect(text).toContain('FORM-ON-TEXT');
    for (const hidden of [
      'OFF-LAYER-TEXT',
      'OCMD-HIDDEN-TEXT',
      'FORM-OFF-TEXT',
      'FORM-NESTED-OFF',
      'IMAGE-OFF-PIXELS',
    ]) {
      expect(text).not.toContain(hidden);
    }
  });

  it('keeps the layers when hidden content cannot be parsed safely', async () => {
    const input = await buildLayerDocument(
      'BT /F1 12 Tf /OC /MCoff BDC (UNPARSABLE-OFF Tj EMC ET'
    );
    const { bytes, skipped } = await sanitizePdf(input, {
      ...NONE,
      removeLayers: true,
    });
    expect(skipped).toEqual(['remove layers']);
    const doc = await PDFDocument.load(bytes, { updateMetadata: false });
    expect(doc.catalog.has(PDFName.of('OCProperties'))).toBe(true);
    const properties = doc
      .getPages()[0]
      .node.Resources()
      ?.lookup(PDFName.of('Properties'), PDFDict);
    expect(properties?.has(PDFName.of('MCoff'))).toBe(true);
  });
});

describe('sanitize remove layers edge cases', () => {
  it('uses page resources for forms without their own and ignores missing content streams', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([300, 300]);
    const ctx = doc.context;
    const off = ctx.register(
      ctx.obj({ Type: 'OCG', Name: PDFString.of('Off') })
    );
    doc.catalog.set(
      PDFName.of('OCProperties'),
      ctx.obj({ OCGs: [off], D: { OFF: [off] } })
    );
    const font = ctx.register(
      ctx.obj({ Type: 'Font', Subtype: 'Type1', BaseFont: 'Helvetica' })
    );
    const bareForm = ctx.register(
      ctx.flateStream(
        'BT /F1 12 Tf (FORM-VISIBLE-TEXT) Tj ET /OC /MCoff BDC BT /F1 12 Tf (INHERITED-OFF-TEXT) Tj ET EMC',
        { Type: 'XObject', Subtype: 'Form', BBox: [0, 0, 300, 300] }
      )
    );
    page.node.set(
      PDFName.of('Resources'),
      ctx.obj({
        Font: { F1: font },
        Properties: { MCoff: off },
        XObject: { FmBare: bareForm },
      })
    );
    page.node.set(
      PDFName.of('Contents'),
      ctx.obj([ctx.register(ctx.flateStream('/FmBare Do')), ctx.nextRef()])
    );

    const { bytes, skipped } = await sanitizePdf(await doc.save(), {
      ...NONE,
      removeLayers: true,
    });
    expect(skipped).toEqual([]);
    const text = await allText(bytes);
    expect(text).not.toContain('INHERITED-OFF-TEXT');
    expect(text).toContain('FORM-VISIBLE-TEXT');
    const result = await PDFDocument.load(bytes, { updateMetadata: false });
    expect(result.catalog.has(PDFName.of('OCProperties'))).toBe(false);
  });
});

describe('content stream tokenizer', () => {
  it('handles strings, comments, dictionaries and inline images', () => {
    const source =
      '/OC /L1 BDC (a\\) EMC (b)) Tj <45 4d 43> Tj % EMC\n' +
      '[(x) -20 (EMC)] TJ /P <</MCID 3 /Alt (EMC)>> BDC EMC ' +
      'BI /W 4 /H 1 /CS /G /BPC 8 ID \x00EI\x7f EI EMC ' +
      'BI /W 4 /H 1 /CS /G /BPC 8 /F /AHx ID 00ff00ff> EI EMC';
    const bytes = new Uint8Array([...source].map((c) => c.charCodeAt(0)));
    const ops = parseContentOperations(bytes);
    expect(ops.map((op) => op.operator)).toEqual([
      'BDC',
      'Tj',
      'Tj',
      'TJ',
      'BDC',
      'EMC',
      'BI',
      'EMC',
      'BI',
      'EMC',
    ]);
    expect(ops[4].operands[1].kind).toBe('dict');
  });

  it('rejects content it cannot tokenize', () => {
    const encode = (text: string) =>
      new Uint8Array([...text].map((c) => c.charCodeAt(0)));
    expect(() => parseContentOperations(encode('(open Tj'))).toThrow();
    expect(() => parseContentOperations(encode('<</A 1 BDC'))).toThrow();
    expect(() => parseContentOperations(encode('BI /W 1 ID \x00'))).toThrow();
    expect(() => parseContentOperations(encode('<zz> Tj'))).toThrow();
    expect(() =>
      parseContentOperations(encode('BI /F /Fl ID x EI\x00\x01 EI'))
    ).toThrow();
    expect(() =>
      parseContentOperations(encode('BI /W 9 /H 1 /CS /G /BPC 8 ID ab EI'))
    ).toThrow();
  });
});
