// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { flattenFreeTextToPageText } from '@/js/utils/freetext-flatten';
import {
  createEngine,
  modelOf,
  allText,
  type Engine,
} from './helpers/editcore-harness';
import { freeTextAnnotationPdf } from './helpers/editcore-fixtures';

const FPDF_ANNOT_FREETEXT = 3;

interface AnnotModule {
  _FPDFPage_GetAnnotCount: (page: number) => number;
  _FPDFPage_GetAnnot: (page: number, i: number) => number;
  _FPDFAnnot_GetSubtype: (annot: number) => number;
}

interface EngineWithModule extends Engine {
  M: AnnotModule;
  page: number;
}

describe('flattening FreeText annotations into page text', () => {
  let engine: EngineWithModule;

  beforeAll(async () => {
    engine = (await createEngine()) as EngineWithModule;
  });

  afterAll(() => {
    engine.close();
  });

  const freeTextCount = (bytes: Uint8Array): number => {
    engine.open(bytes);
    engine.loadPage(0);
    const M = engine.M;
    let n = 0;
    for (let i = 0; i < M._FPDFPage_GetAnnotCount(engine.page); i++) {
      const annot = M._FPDFPage_GetAnnot(engine.page, i);
      if (annot && M._FPDFAnnot_GetSubtype(annot) === FPDF_ANNOT_FREETEXT) n++;
    }
    return n;
  };

  it('converts an annotation into real page text', async () => {
    const source = freeTextAnnotationPdf([
      { rect: [72, 600, 400, 660], contents: 'Flattened annotation text' },
    ]);
    expect(freeTextCount(source)).toBe(1);

    const { bytes, flattened } = await flattenFreeTextToPageText(source, [], 1);
    expect(flattened).toBe(1);

    const model = modelOf(engine, bytes);
    expect(allText(model)).toContain('Flattened annotation text');
    expect(allText(model)).toContain('Existing page text');
  });

  it('removes the annotation it flattened', async () => {
    const source = freeTextAnnotationPdf([
      { rect: [72, 600, 400, 660], contents: 'Goes into the page' },
    ]);
    const { bytes } = await flattenFreeTextToPageText(source, [], 1);
    expect(freeTextCount(bytes)).toBe(0);
  });

  it('flattens every annotation on the page', async () => {
    const source = freeTextAnnotationPdf([
      { rect: [72, 600, 400, 640], contents: 'First note here' },
      { rect: [72, 500, 400, 540], contents: 'Second note here' },
      { rect: [72, 400, 400, 440], contents: 'Third note here' },
    ]);
    const { bytes, flattened } = await flattenFreeTextToPageText(source, [], 1);
    expect(flattened).toBe(3);

    const text = allText(modelOf(engine, bytes));
    expect(text).toContain('First note here');
    expect(text).toContain('Second note here');
    expect(text).toContain('Third note here');
  });

  it('leaves the document untouched when there is nothing to flatten', async () => {
    const source = freeTextAnnotationPdf([]);
    const result = await flattenFreeTextToPageText(source, [], 1);
    expect(result.flattened).toBe(0);
    expect(result.bytes).toBe(source);
  });

  it('skips annotations with empty contents', async () => {
    const source = freeTextAnnotationPdf([
      { rect: [72, 600, 400, 640], contents: '   ' },
      { rect: [72, 500, 400, 540], contents: 'Only this one counts' },
    ]);
    const { bytes, flattened } = await flattenFreeTextToPageText(source, [], 1);
    expect(flattened).toBe(1);
    expect(allText(modelOf(engine, bytes))).toContain('Only this one counts');
  });

  it('produces text that the editor can select and edit', async () => {
    const source = freeTextAnnotationPdf([
      { rect: [72, 600, 400, 660], contents: 'Editable after flatten' },
    ]);
    const { bytes } = await flattenFreeTextToPageText(source, [], 1);
    const model = modelOf(engine, bytes);
    const target = model.find((p) =>
      p.runs.some((r) => r.text.includes('Editable after flatten'))
    );
    expect(target).toBeDefined();
    expect(target?.editable).toBe(true);
    expect(target?.lockReason).toBe(0);
  });

  it('returns the original bytes when the document cannot be opened', async () => {
    const junk = new Uint8Array([1, 2, 3, 4, 5]);
    const result = await flattenFreeTextToPageText(junk, [], 1);
    expect(result.flattened).toBe(0);
    expect(result.bytes).toBe(junk);
  });
});
