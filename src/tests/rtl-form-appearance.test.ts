import { describe, it, expect } from 'vitest';
import { PDFDocument, PDFHexString, PDFName } from 'pdf-lib';
import {
  fixRtlFormAppearances,
  textNeedsRtlFix,
  toVisualOrder,
  visualLines,
  wrapRanges,
} from '../js/utils/rtl-form-appearance';

describe('rtl-form-appearance', () => {
  it('only targets Hebrew values', () => {
    expect(textNeedsRtlFix('שלום')).toBe(true);
    expect(textNeedsRtlFix('Hello 123')).toBe(false);
    expect(textNeedsRtlFix('')).toBe(false);
    expect(textNeedsRtlFix(undefined)).toBe(false);
  });

  it('reorders pure Hebrew right-to-left', () => {
    const { visual, rtl } = toVisualOrder('שלום');
    expect(rtl).toBe(true);
    expect(visual).toBe('םולש');
  });

  it('keeps numbers and Latin runs left-to-right inside Hebrew', () => {
    expect(toVisualOrder('דירה 12').visual).toBe('12 הריד');
    expect(toVisualOrder('מייל: a@b.co').visual).toBe('a@b.co :ליימ');
  });

  it('mirrors brackets in RTL text', () => {
    expect(toVisualOrder('קומה (2)').visual).toBe('(2) המוק');
  });

  it('leaves LTR paragraphs alone', () => {
    const { visual, rtl } = toVisualOrder('Name: שי');
    expect(rtl).toBe(false);
    expect(visual).toBe('Name: יש');
  });

  it('keeps vowel marks after their letter in visual order', () => {
    // בָּא: bet + dagesh + qamats, then alef.
    expect(toVisualOrder('בָּא').visual).toBe('אבָּ');
  });
});

describe('wrapping', () => {
  const maxLen = (n: number) => (t: string) => t.length <= n;

  it('breaks between words and drops the break spaces', () => {
    expect(wrapRanges('aaa bbb ccc', maxLen(7))).toEqual([
      [0, 7],
      [8, 11],
    ]);
  });

  it('splits a token wider than the line', () => {
    expect(wrapRanges('abcdefghij', maxLen(4))).toEqual([
      [0, 4],
      [4, 8],
      [8, 10],
    ]);
  });

  it('keeps an empty paragraph as one empty line', () => {
    expect(wrapRanges('', maxLen(4))).toEqual([[0, 0]]);
  });

  it('resolves bidi per paragraph, not per wrapped line', () => {
    // The second line starts with Latin, but belongs to an RTL paragraph.
    const p = 'שלום abc def';
    const lines = visualLines(p, [
      [0, 4],
      [5, 12],
    ]);
    expect(lines.map((l) => l.rtl)).toEqual([true, true]);
    expect(lines[0].visual).toBe('םולש');
    expect(lines[1].visual).toBe('abc def');
    // On its own the same text would resolve as an LTR paragraph.
    expect(toVisualOrder('abc def').rtl).toBe(false);
  });
});

// The font loader is only reached when something needs redrawing.
async function needsFonts(bytes: Uint8Array, originalLength?: number) {
  let called = false;
  const out = await fixRtlFormAppearances(
    bytes,
    async () => {
      called = true;
      throw new Error('stop');
    },
    { originalLength }
  );
  expect(out).toBe(bytes);
  return called;
}

describe('fixRtlFormAppearances FreeText detection', () => {
  // `withAppearance` adds one that draws text with an embedded font.
  async function pdfWithFreeText(text: string, withAppearance = false) {
    const d = await PDFDocument.create();
    const page = d.addPage();
    const annot = d.context.obj({
      Type: 'Annot',
      Subtype: 'FreeText',
      Rect: [20, 20, 200, 60],
      DA: PDFHexString.fromText('/Helv 12 Tf 0 g'),
      Contents: PDFHexString.fromText(text),
    });
    if (withAppearance) {
      const font = d.context.obj({
        Type: 'Font',
        Subtype: 'TrueType',
        BaseFont: 'Embedded',
        FontDescriptor: {
          Type: 'FontDescriptor',
          FontFile2: d.context.register(d.context.stream('')),
        },
      });
      const ap = d.context.stream('BT /F1 12 Tf 2 6 Td <0001> Tj ET', {
        Type: 'XObject',
        Subtype: 'Form',
        BBox: [20, 20, 200, 60],
        Resources: { Font: { F1: font } },
      });
      annot.set(PDFName.of('AP'), d.context.obj({ N: d.context.register(ap) }));
    }
    page.node.set(
      PDFName.of('Annots'),
      d.context.obj([d.context.register(annot)])
    );
    return d.save();
  }

  it('picks up Hebrew "Add text" annotations without an appearance', async () => {
    expect(await needsFonts(await pdfWithFreeText('שלומי'))).toBe(true);
  });

  it('leaves English-only annotations alone', async () => {
    expect(await needsFonts(await pdfWithFreeText('Hello'))).toBe(false);
  });

  it('repairs annotations the save did not write if they have no appearance', async () => {
    // Otherwise their text is invisible elsewhere and lost when flattening.
    const bytes = await pdfWithFreeText('שלומי');
    expect(await needsFonts(bytes, bytes.length)).toBe(true);
  });

  it('keeps an annotation with a usable appearance', async () => {
    const bytes = await pdfWithFreeText('שלומי', true);
    expect(await needsFonts(bytes, bytes.length)).toBe(false);
  });
});

describe('fixRtlFormAppearances field selection', () => {
  // A Hebrew text field whose appearance draws text with an embedded font,
  // as a form that was already filled correctly would have. `content` lets a
  // test swap in an appearance that draws nothing.
  async function pdfWithFilledField(
    content = 'BT /F1 12 Tf 2 6 Td <0001> Tj ET',
    nestedContent = ''
  ) {
    const d = await PDFDocument.create();
    const page = d.addPage();
    const field = d.getForm().createTextField('name');
    field.addToPage(page, { x: 20, y: 20, width: 200, height: 24 });
    field.acroField.dict.set(PDFName.of('V'), PDFHexString.fromText('שלום'));
    const fontFile = d.context.register(d.context.stream(''));
    const font = d.context.obj({
      Type: 'Font',
      Subtype: 'TrueType',
      BaseFont: 'Embedded',
      FontDescriptor: { Type: 'FontDescriptor', FontFile2: fontFile },
    });
    // /Im1 is an image (never text); /Fm1 is a form XObject whose content
    // the test chooses.
    const image = d.context.register(
      d.context.stream('', {
        Type: 'XObject',
        Subtype: 'Image',
        Width: 1,
        Height: 1,
        ColorSpace: 'DeviceGray',
        BitsPerComponent: 8,
      })
    );
    const nested = d.context.register(
      d.context.stream(nestedContent, {
        Type: 'XObject',
        Subtype: 'Form',
        BBox: [0, 0, 200, 24],
        // F2 is a standard font that isn't embedded.
        Resources: {
          Font: {
            F1: font,
            F2: { Type: 'Font', Subtype: 'Type1', BaseFont: 'Helvetica' },
          },
        },
      })
    );
    const ap = d.context.register(
      d.context.stream(content, {
        Type: 'XObject',
        Subtype: 'Form',
        BBox: [0, 0, 200, 24],
        Resources: { Font: { F1: font }, XObject: { Im1: image, Fm1: nested } },
      })
    );
    field.acroField.getWidgets()[0].setNormalAppearance(ap);
    return d.save({ updateFieldAppearances: false });
  }

  it('keeps an untouched field with a usable appearance', async () => {
    const bytes = await pdfWithFilledField();
    expect(await needsFonts(bytes, bytes.length)).toBe(false);
  });

  it('repairs an untouched field whose appearance draws no text', async () => {
    for (const content of [
      '',
      '/Tx BMC EMC',
      // A background image is not the field's text.
      'q /Im1 Do Q /Tx BMC EMC',
      // Nor is a form XObject that only paints a box.
      'q /Fm1 Do Q /Tx BMC EMC',
    ]) {
      const bytes = await pdfWithFilledField(content, '0 0 10 10 re f');
      expect(await needsFonts(bytes, bytes.length)).toBe(true);
    }
  });

  it('keeps an untouched field whose text is drawn by a nested form', async () => {
    const bytes = await pdfWithFilledField(
      '/Tx BMC q /Fm1 Do Q EMC',
      'BT /F1 12 Tf 2 6 Td <0001> Tj ET'
    );
    expect(await needsFonts(bytes, bytes.length)).toBe(false);
  });

  it('repairs a field whose nested form draws with a non-embedded font', async () => {
    const bytes = await pdfWithFilledField(
      '/Tx BMC q /Fm1 Do Q EMC',
      'BT /F2 12 Tf 2 6 Td (x) Tj ET'
    );
    expect(await needsFonts(bytes, bytes.length)).toBe(true);
  });

  it('redraws every Hebrew field when it cannot tell what changed', async () => {
    expect(await needsFonts(await pdfWithFilledField())).toBe(true);
  });
});
