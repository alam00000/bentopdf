import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFRawStream,
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

vi.mock('rete', () => ({
  ClassicPreset: {
    Input: class {},
    Output: class {},
  },
}));

vi.mock('@/js/workflow/sockets', () => ({ pdfSocket: {} }));

vi.mock('@/js/workflow/nodes/base-node', () => ({
  BaseWorkflowNode: class {
    addInput() {}
    addOutput() {}
  },
}));

const { flattenAnnotations, flattenFormsInDoc } =
  await import('../js/utils/flatten-annotations.js');
const { removeUnreferencedObjects } =
  await import('../js/utils/load-pdf-document.js');
const { sanitizePdf } = await import('../js/utils/sanitize.js');
const { FlattenNode } = await import('../js/workflow/nodes/flatten-node.js');

const SECRETS = [
  'HIDDEN-VALUE',
  'NOVIEW-VALUE',
  'PASSWORD-SECRET',
  'GROUP-SECRET',
];

async function buildFormDocument(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([400, 400]);
  const form = doc.getForm();
  let y = 10;
  const addField = (name: string, value: string, flags?: number) => {
    const field = form.createTextField(name);
    field.setText(value);
    field.addToPage(page, { x: 10, y, width: 200, height: 20 });
    y += 30;
    if (flags !== undefined) {
      const widgets = field.acroField.getWidgets();
      widgets[widgets.length - 1].setFlags(flags);
    }
    return field;
  };

  addField('visible', 'VISIBLE-VALUE');
  addField('hiddenField', 'HIDDEN-VALUE', 2);
  addField('noViewField', 'NOVIEW-VALUE', 32 | 4);
  addField('group.secret', 'GROUP-SECRET', 2);

  const password = addField('pw', 'PASSWORD-SECRET');
  password.enablePassword();
  password.acroField.getWidgets()[0].dict.delete(PDFName.of('AP'));

  const multi = addField('multi', 'MULTI-VALUE');
  multi.addToPage(page, { x: 250, y: 10, width: 120, height: 20 });
  multi.acroField.getWidgets()[1].setFlags(2);

  const ctx = doc.context;
  const appearance = (text: string) =>
    ctx.register(
      ctx.flateStream(`BT /Helv 10 Tf (${text}) Tj ET`, {
        Type: 'XObject',
        Subtype: 'Form',
        BBox: [0, 0, 100, 20],
      })
    );
  const annots = page.node.Annots() as PDFArray;
  annots.push(
    ctx.register(
      ctx.obj({
        Type: 'Annot',
        Subtype: 'Square',
        Rect: [10, 300, 110, 320],
        F: 32 | 4,
        AP: { N: appearance('NOVIEW-ANNOT') },
      })
    )
  );
  annots.push(
    ctx.register(
      ctx.obj({
        Type: 'Annot',
        Subtype: 'Square',
        Rect: [10, 330, 110, 350],
        AP: { N: appearance('SHOWN-ANNOT') },
      })
    )
  );

  return doc.save();
}

function hex(text: string): string {
  return Buffer.from(text).toString('hex');
}

async function inspect(bytes: Uint8Array) {
  const doc = await PDFDocument.load(bytes, { updateMetadata: false });
  const streams: string[] = [];
  for (const [, object] of doc.context.enumerateIndirectObjects()) {
    if (object instanceof PDFRawStream) {
      streams.push(
        Buffer.from(decodePDFRawStream(object).decode()).toString('latin1')
      );
    }
  }
  const text = [Buffer.from(bytes).toString('latin1'), ...streams]
    .join('\n')
    .toLowerCase();
  const count = (value: string) =>
    text.split(value.toLowerCase()).length -
    1 +
    text.split(hex(value)).length -
    1;
  return { doc, count };
}

async function expectHiddenFieldsGone(bytes: Uint8Array) {
  const { doc, count } = await inspect(bytes);
  for (const secret of SECRETS) expect(count(secret)).toBe(0);
  expect(count('VISIBLE-VALUE')).toBe(1);
  expect(count('MULTI-VALUE')).toBe(1);
  const acroForm = doc.catalog.lookup(PDFName.of('AcroForm'));
  const fields =
    acroForm instanceof PDFDict
      ? acroForm.lookup(PDFName.of('Fields'), PDFArray)
      : undefined;
  expect(fields?.size() ?? 0).toBe(0);
  return count;
}

describe('flattenFormsInDoc', () => {
  it('does not draw hidden, no-view or password fields', async () => {
    const input = await buildFormDocument();
    const before = await inspect(input);
    for (const secret of SECRETS)
      expect(before.count(secret)).toBeGreaterThan(0);

    const doc = await PDFDocument.load(input);
    flattenFormsInDoc(doc);
    flattenAnnotations(doc);
    const bytes = await removeUnreferencedObjects(await doc.save());

    const count = await expectHiddenFieldsGone(bytes);
    expect(count('NOVIEW-ANNOT')).toBe(0);
    expect(count('SHOWN-ANNOT')).toBe(1);
  });

  it('is used by the sanitize flatten option', async () => {
    const { bytes } = await sanitizePdf(await buildFormDocument(), {
      flattenForms: true,
      removeMetadata: false,
      removeAnnotations: false,
      removeJavascript: false,
      removeEmbeddedFiles: false,
      removeLayers: false,
      removeLinks: false,
      removeStructureTree: false,
      removeMarkInfo: false,
      removeFonts: false,
    });
    await expectHiddenFieldsGone(bytes);
  });

  it('is used by the workflow flatten node', async () => {
    const node = new FlattenNode();
    const result = await node.data({
      pdf: [
        {
          type: 'pdf',
          document: await PDFDocument.create(),
          bytes: await buildFormDocument(),
          filename: 'form.pdf',
        },
      ],
    });
    const output = result.pdf;
    if (output.type !== 'pdf') throw new Error('Expected a single PDF');
    const count = await expectHiddenFieldsGone(output.bytes);
    expect(count('NOVIEW-ANNOT')).toBe(0);
  });
});
