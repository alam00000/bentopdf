import { describe, it, expect } from 'vitest';
import { PDFDocument, PDFHexString, PDFName } from 'pdf-lib';
import {
  fixRtlFormAppearances,
  textNeedsRtlFix,
  toVisualOrder,
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

  it('keeps the paragraph direction when a wrapped line starts with Latin', () => {
    const { rtl } = toVisualOrder('abc שלום', 'rtl');
    expect(rtl).toBe(true);
    expect(toVisualOrder('abc שלום').rtl).toBe(false);
  });
});

describe('fixRtlFormAppearances FreeText detection', () => {
  async function pdfWithFreeText(text: string) {
    const d = await PDFDocument.create();
    const page = d.addPage();
    const annot = d.context.register(
      d.context.obj({
        Type: 'Annot',
        Subtype: 'FreeText',
        Rect: [20, 20, 200, 60],
        DA: PDFHexString.fromText('/Helv 12 Tf 0 g'),
        Contents: PDFHexString.fromText(text),
      })
    );
    page.node.set(PDFName.of('Annots'), d.context.obj([annot]));
    return d.save();
  }

  // The font loader is only reached when something needs redrawing.
  async function needsFonts(bytes: Uint8Array) {
    let called = false;
    const out = await fixRtlFormAppearances(bytes, async () => {
      called = true;
      throw new Error('stop');
    });
    expect(out).toBe(bytes);
    return called;
  }

  it('picks up Hebrew "Add text" annotations without an appearance', async () => {
    expect(await needsFonts(await pdfWithFreeText('שלומי'))).toBe(true);
  });

  it('leaves English-only annotations alone', async () => {
    expect(await needsFonts(await pdfWithFreeText('Hello'))).toBe(false);
  });
});
