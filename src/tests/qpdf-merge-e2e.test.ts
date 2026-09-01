import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import createModule from '@neslinesli93/qpdf-wasm';
import { PDFDocument, degrees } from 'pdf-lib';
import type { MergeJob, QpdfInstanceExtended } from '@/types';
import { buildPdf } from './helpers/pdf-builder';
import {
  buildInterleaveSeries,
  mergeJobToPageSpec,
} from '@/js/utils/qpdf-merge-helpers';

/**
 * End-to-end semantics of the qpdf merge pipeline: the exact argv shape the
 * merge workers drive (`--empty --pages <file> <spec> … -- <out>`), verified
 * against the real qpdf-wasm runtime. The workers are thin executors; these
 * tests hold the semantics they rely on.
 */
describe('qpdf merge pipeline (real qpdf)', () => {
  let qpdf: QpdfInstanceExtended;

  async function makePdf(
    pageCount: number,
    widthBase: number
  ): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    for (let i = 0; i < pageCount; i++) doc.addPage([widthBase + i, 200]);
    return new Uint8Array(await doc.save());
  }

  async function makeRotatedPdf(
    rotations: number[],
    widthBase: number
  ): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    rotations.forEach((rot, i) => {
      const page = doc.addPage([widthBase + i, 200]);
      page.setRotation(degrees(rot));
    });
    return new Uint8Array(await doc.save());
  }

  function labeledPdf(pageCount: number, prefix: string): Uint8Array {
    const pageObjs = Array.from({ length: pageCount }, (_, i) => {
      const contentsRef = 3 + pageCount + i;
      return {
        body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${100 + i} 200] /Contents ${contentsRef} 0 R >>`,
      };
    });
    const contentsObjs = Array.from({ length: pageCount }, () => ({
      body: '<< /Length 0 >>',
      stream: new Uint8Array(0),
    }));
    const nums = Array.from(
      { length: pageCount },
      (_, i) => `${i} << /S /D /P (${prefix}) >>`
    ).join(' ');
    const labelRef = 3 + 2 * pageCount;
    const objects = [
      { body: `<< /Type /Catalog /Pages 2 0 R /PageLabels ${labelRef} 0 R >>` },
      {
        body: `<< /Type /Pages /Kids [${pageObjs.map((_, i) => `${i + 3} 0 R`).join(' ')}] /Count ${pageCount} >>`,
      },
      ...pageObjs,
      ...contentsObjs,
      { body: `<< /Nums [${nums}] >>` },
    ];
    return buildPdf(objects);
  }

  function mergeWithQpdf(
    files: Uint8Array[],
    specs: Array<string | null>
  ): Uint8Array {
    files.forEach((bytes, i) => qpdf.FS.writeFile(`/in${i}.pdf`, bytes));
    try {
      const args = ['--empty', '--pages'];
      for (let i = 0; i < files.length; i++) {
        args.push(`/in${i}.pdf`, specs[i] ?? '1-z');
      }
      args.push('--', '/out.pdf');
      const exitCode = qpdf.callMain(args);
      if (exitCode !== 0) {
        throw new Error(`qpdf merge failed (exit code ${exitCode})`);
      }
      const out = qpdf.FS.readFile('/out.pdf', { encoding: 'binary' });
      if (!out || out.length === 0) {
        throw new Error('qpdf merge produced an empty PDF');
      }
      return out;
    } finally {
      for (let i = 0; i < files.length; i++) {
        try {
          qpdf.FS.unlink(`/in${i}.pdf`);
        } catch {
          /* already gone */
        }
      }
      try {
        qpdf.FS.unlink('/out.pdf');
      } catch {
        /* already gone */
      }
    }
  }

  async function pageWidths(out: Uint8Array): Promise<number[]> {
    const doc = await PDFDocument.load(out);
    return doc.getPages().map((p) => Math.round(p.getWidth()));
  }

  async function pageRotations(out: Uint8Array): Promise<number[]> {
    const doc = await PDFDocument.load(out);
    return doc.getPages().map((p) => p.getRotation().angle);
  }

  function weaveSeries(
    files: Uint8Array[],
    series: ReturnType<typeof buildInterleaveSeries>
  ): { files: Uint8Array[]; specs: Array<string | null> } {
    // replay the worker's assembly: one <file> <page> term pair per step
    const wovenFiles: Uint8Array[] = [];
    const wovenSpecs: Array<string | null> = [];
    for (const step of series) {
      wovenFiles.push(files[step.fileIndex]);
      wovenSpecs.push(String(step.page));
    }
    return { files: wovenFiles, specs: wovenSpecs };
  }

  beforeAll(async () => {
    const wasmBinary = fs.readFileSync(
      path.resolve(
        process.cwd(),
        'node_modules/@neslinesli93/qpdf-wasm/dist/qpdf.wasm'
      )
    );
    qpdf = await (
      createModule as unknown as (o: object) => Promise<QpdfInstanceExtended>
    )({ wasmBinary, noInitialRun: true });
  });

  it('merges all pages of each file in file order', async () => {
    const a = await makePdf(3, 100);
    const b = await makePdf(2, 200);
    const out = mergeWithQpdf([a, b], ['1-z', '1-z']);
    expect(await pageWidths(out)).toEqual([100, 101, 102, 200, 201]);
  });

  it('applies specific, single, and range job specs in job order', async () => {
    const a = await makePdf(3, 100);
    const b = await makePdf(4, 200);
    const jobs: MergeJob[] = [
      { fileName: 'a.pdf', rangeType: 'specific', rangeString: '3,1' },
      { fileName: 'b.pdf', rangeType: 'range', startPage: 2, endPage: 4 },
      { fileName: 'b.pdf', rangeType: 'single', pageIndex: 0 },
    ];
    const out = mergeWithQpdf([a, b, b], jobs.map(mergeJobToPageSpec));
    expect(await pageWidths(out)).toEqual([102, 100, 201, 202, 203, 200]);
  });

  it('keeps page labels from every input file', async () => {
    const a = labeledPdf(2, 'A-');
    const b = labeledPdf(2, 'B-');
    const out = mergeWithQpdf([a, b], ['1-z', '1-z']);
    const text = new TextDecoder('latin1').decode(out);
    expect(text).toContain('/PageLabels');
    expect(text).toContain('/P (A-');
    expect(text).toContain('/P (B-');
  });

  it('keeps page labels through a non-contiguous interleave', async () => {
    const a = labeledPdf(2, 'A-');
    const b = labeledPdf(2, 'B-');
    const out = mergeWithQpdf([a, b, a, b], ['1', '1', '2', '2']);
    const text = new TextDecoder('latin1').decode(out);
    expect(text).toContain('/PageLabels');
    expect(text).toContain('/P (A-');
    expect(text).toContain('/P (B-');
  });

  it('preserves page rotation through merge and interleave', async () => {
    const a = await makeRotatedPdf([0, 90], 100);
    const b = await makeRotatedPdf([180, 270], 200);
    const merged = mergeWithQpdf([a, b], ['1-z', '1-z']);
    const rotated = await pageRotations(merged);
    expect(rotated).toEqual([0, 90, 180, 270]);

    const interleaved = mergeWithQpdf([a, b, a, b], ['1', '1', '2', '2']);
    expect(await pageRotations(interleaved)).toEqual([0, 180, 90, 270]);
  });

  it('interleaves pages A1,B1,C1,A2,B2… for uneven counts', async () => {
    const a = await makePdf(3, 100);
    const b = await makePdf(2, 200);
    const c = await makePdf(1, 300);
    const woven = weaveSeries([a, b, c], buildInterleaveSeries([3, 2, 1]));
    const out = mergeWithQpdf(woven.files, woven.specs);
    expect(await pageWidths(out)).toEqual([100, 200, 300, 101, 201, 102]);
  });

  it('fails with a specific exit-code error on corrupt input', async () => {
    const bad = new Uint8Array([1, 2, 3, 4]);
    const good = await makePdf(1, 100);
    expect(() => mergeWithQpdf([bad, good], ['1-z', '1-z'])).toThrow(
      /exit code 2/
    );
  });

  it('produces correct output across repeated merges on one runtime instance', async () => {
    const a = await makePdf(3, 100);
    const b = await makePdf(2, 200);
    const first = mergeWithQpdf([a, b], ['1-z', '1-z']);
    expect(await pageWidths(first)).toEqual([100, 101, 102, 200, 201]);

    const c = await makePdf(2, 300);
    const second = mergeWithQpdf([c, a], ['1-z', '1-z']);
    expect(await pageWidths(second)).toEqual([300, 301, 100, 101, 102]);

    const third = mergeWithQpdf([a, b], ['1-z', '1-z']);
    const decode = (bytes: Uint8Array) =>
      new TextDecoder('latin1').decode(bytes);
    expect(decode(third)).toEqual(decode(first));
  });

  it('stays usable after a failed merge on the same runtime instance', async () => {
    const bad = new Uint8Array([1, 2, 3, 4]);
    const good = await makePdf(1, 100);
    expect(() => mergeWithQpdf([bad, good], ['1-z', '1-z'])).toThrow(
      /exit code 2/
    );

    const out = mergeWithQpdf([good], ['1-z']);
    expect(await pageWidths(out)).toEqual([100]);
  });

  it('supports interleave and merge against the same runtime instance', async () => {
    const a = await makePdf(3, 100);
    const b = await makePdf(2, 200);
    const woven = weaveSeries([a, b], buildInterleaveSeries([3, 2]));
    const interleaved = mergeWithQpdf(woven.files, woven.specs);
    expect(await pageWidths(interleaved)).toEqual([100, 200, 101, 201, 102]);

    const merged = mergeWithQpdf([a, b], ['1-z', '1-z']);
    expect(await pageWidths(merged)).toEqual([100, 101, 102, 200, 201]);
  });
});
