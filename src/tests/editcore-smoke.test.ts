// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  createEngine,
  modelOf,
  paragraphText,
  allText,
  runsFrom,
  type Engine,
} from './helpers/editcore-harness';
import { twoParagraphPdf, A_TEXT, B_TEXT } from './helpers/editcore-fixtures';

describe('vendored editcore engine', () => {
  let engine: Engine;

  beforeAll(async () => {
    engine = await createEngine();
  });

  afterAll(() => {
    engine.close();
  });

  it('loads the vendored wasm and builds a page model', () => {
    const model = modelOf(engine, twoParagraphPdf());
    expect(model).toHaveLength(2);
    expect(paragraphText(model[0])).toBe(A_TEXT);
    expect(paragraphText(model[1])).toBe(B_TEXT);
  });

  it('reports paragraphs as editable', () => {
    for (const p of modelOf(engine, twoParagraphPdf())) {
      expect(p.editable).toBe(true);
      expect(p.lockReason).toBe(0);
    }
  });

  it('commits an edit into the page model', () => {
    const model = modelOf(engine, twoParagraphPdf());
    const target = model[0];
    engine.commitParagraph(
      target.id,
      runsFrom(target, paragraphText(target).replace('quick', 'quicks')),
      target.format
    );
    const after = engine.buildModel();
    expect(paragraphText(after[0])).toBe(A_TEXT.replace('quick', 'quicks'));
    expect(paragraphText(after[1])).toBe(B_TEXT);
  });

  it('splices an edit back into a re-openable document', async () => {
    const model = modelOf(engine, twoParagraphPdf());
    const target = model[0];
    engine.commitParagraph(
      target.id,
      runsFrom(target, paragraphText(target).replace('quick', 'quicks')),
      target.format
    );

    const saved = await engine.saveSpliced();
    expect(saved).toBeTruthy();
    expect(saved!.length).toBeGreaterThan(0);
    expect(new TextDecoder().decode(saved!.subarray(0, 5))).toBe('%PDF-');

    const text = allText(modelOf(engine, saved!));
    expect(text).toContain('The quicks brown fox');
    expect(text).toContain(B_TEXT);
  });

  it('splices a deletion back into the document', async () => {
    const model = modelOf(engine, twoParagraphPdf());
    engine.deleteParagraph(model[0].id);
    const saved = await engine.saveSpliced();
    expect(saved).toBeTruthy();

    const text = allText(modelOf(engine, saved!));
    expect(text).toContain(B_TEXT);
    expect(text).not.toContain('The quick brown fox');
  });
});
