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

const { redactDocumentData } =
  await import('../js/utils/redact-document-data.js');

const SECRET = 'SECRET-4471';

async function buildDocument(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([300, 300]);
  const ctx = doc.context;
  doc.setTitle(`Report for ${SECRET}`);
  doc.setAuthor('Keep Author');

  doc.catalog.set(
    PDFName.of('Metadata'),
    ctx.register(
      ctx.flateStream(`<x:xmpmeta><dc:title>${SECRET}</dc:title></x:xmpmeta>`, {
        Type: 'Metadata',
        Subtype: 'XML',
      })
    )
  );

  const outlines = ctx.nextRef();
  const first = ctx.nextRef();
  const second = ctx.nextRef();
  ctx.assign(
    first,
    ctx.obj({
      Title: PDFString.of(`${SECRET} chapter`),
      Parent: outlines,
      Next: second,
    })
  );
  ctx.assign(
    second,
    ctx.obj({
      Title: PDFString.of('Keep chapter'),
      Parent: outlines,
      Prev: first,
    })
  );
  ctx.assign(
    outlines,
    ctx.obj({ Type: 'Outlines', First: first, Last: second, Count: 2 })
  );
  doc.catalog.set(PDFName.of('Outlines'), outlines);

  doc.catalog.set(
    PDFName.of('StructTreeRoot'),
    ctx.register(
      ctx.obj({
        Type: 'StructTreeRoot',
        K: ctx.obj({
          S: 'Figure',
          Alt: PDFHexString.fromText(`Photo of ${SECRET}`),
        }),
      })
    )
  );

  const secretNote = ctx.register(
    ctx.obj({
      Type: 'Annot',
      Subtype: 'Text',
      Rect: [10, 10, 30, 30],
      Contents: PDFString.of(`note about ${secret()}`),
    })
  );
  const keepNote = ctx.register(
    ctx.obj({
      Type: 'Annot',
      Subtype: 'Text',
      Rect: [40, 10, 60, 30],
      Contents: PDFString.of('keep note'),
    })
  );
  const appearance = ctx.register(
    ctx.flateStream(`BT /Helv 10 Tf (${SECRET}) Tj ET`, {
      Type: 'XObject',
      Subtype: 'Form',
      BBox: [0, 0, 100, 20],
    })
  );
  const widget = ctx.register(
    ctx.obj({
      Type: 'Annot',
      Subtype: 'Widget',
      FT: 'Tx',
      T: PDFString.of('ssn'),
      V: PDFString.of(SECRET),
      Rect: [10, 100, 110, 120],
      AP: { N: appearance },
    })
  );
  doc.catalog.set(PDFName.of('AcroForm'), ctx.obj({ Fields: [widget] }));
  page.node.set(PDFName.of('Annots'), ctx.obj([secretNote, keepNote, widget]));
  page.node.set(
    PDFName.of('Thumb'),
    ctx.register(ctx.flateStream(SECRET, { Width: 1, Height: 1 }))
  );

  await doc.attach(
    new Uint8Array(Buffer.from(`payroll ${SECRET}`)),
    'payroll.txt',
    {
      mimeType: 'text/plain',
    }
  );
  await doc.attach(new Uint8Array(Buffer.from('harmless')), 'readme.txt', {
    mimeType: 'text/plain',
  });

  return doc.save();
}

function secret() {
  return SECRET.toLowerCase();
}

function collectText(value: PDFObject, out: string[]) {
  if (value instanceof PDFString || value instanceof PDFHexString) {
    out.push(value.decodeText());
  } else if (value instanceof PDFDict) {
    for (const [, v] of value.entries()) collectText(v, out);
  } else if (value instanceof PDFArray) {
    for (const v of value.asArray()) collectText(v, out);
  }
}

async function allText(bytes: Uint8Array): Promise<string> {
  const doc = await PDFDocument.load(bytes, { updateMetadata: false });
  const out: string[] = [new TextDecoder('latin1').decode(bytes)];
  for (const [, object] of doc.context.enumerateIndirectObjects()) {
    if (object instanceof PDFRawStream) {
      collectText(object.dict, out);
      try {
        out.push(
          new TextDecoder('latin1').decode(decodePDFRawStream(object).decode())
        );
      } catch {
        continue;
      }
    } else {
      collectText(object, out);
    }
  }
  return out.join('\n');
}

describe('redactDocumentData', () => {
  it('removes the redacted text from every place outside the page content', async () => {
    const input = await buildDocument();
    expect((await allText(input)).toLowerCase()).toContain(
      SECRET.toLowerCase()
    );

    const output = await redactDocumentData(input, secret());
    const text = await allText(output);

    expect(text.toLowerCase()).not.toContain(SECRET.toLowerCase());
    expect(text).toContain('Keep chapter');
    expect(text).toContain('keep note');
    expect(text).toContain('Keep Author');
    expect(text).toContain('harmless');
    expect(text).toContain('readme.txt');

    const result = await PDFDocument.load(output, { updateMetadata: false });
    const annots = result.getPages()[0].node.Annots();
    expect(annots?.size()).toBe(2);
    expect(result.getPages()[0].node.get(PDFName.of('Thumb'))).toBeUndefined();
  });

  it('only drops thumbnails and leftovers when no search text is given', async () => {
    const input = await buildDocument();
    const output = await redactDocumentData(input);
    const result = await PDFDocument.load(output, { updateMetadata: false });
    expect(result.getPages()[0].node.get(PDFName.of('Thumb'))).toBeUndefined();
    expect(result.getTitle()).toBe(`Report for ${SECRET}`);
  });
});
