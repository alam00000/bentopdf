import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import type { ClassicPreset } from 'rete';
import type { HyperWasmResult } from 'hyper-compress-wasm';
import type { PDFData } from '../js/workflow/types';

const { compressWithHyper } = vi.hoisted(() => ({
  compressWithHyper: vi.fn(),
}));

vi.mock('../js/utils/compress.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../js/utils/compress.js')>()),
  compressWithHyper,
}));

vi.mock('../js/utils/load-pdf-document.js', async () => {
  const { PDFDocument: Doc } = await import('pdf-lib');
  return { loadPdfDocument: (bytes: Uint8Array) => Doc.load(bytes) };
});

const { CompressNode } = await import('../js/workflow/nodes/compress-node');

async function pdfInput(filename: string): Promise<PDFData> {
  const doc = await PDFDocument.create();
  doc.addPage();
  return { type: 'pdf', document: doc, bytes: await doc.save(), filename };
}

function setText(
  node: InstanceType<typeof CompressNode>,
  key: string,
  value: string
) {
  (node.controls[key] as ClassicPreset.InputControl<'text'>).setValue(value);
}

function setNumber(
  node: InstanceType<typeof CompressNode>,
  key: string,
  value: number
) {
  (node.controls[key] as ClassicPreset.InputControl<'number'>).setValue(value);
}

beforeEach(() => {
  compressWithHyper.mockReset();
  compressWithHyper.mockImplementation(
    async (pdf: ArrayBuffer): Promise<HyperWasmResult> => ({
      data: new Uint8Array(pdf),
      originalSize: pdf.byteLength,
      compressedSize: pdf.byteLength,
      signed: false,
      signaturesRemoved: false,
      pdfa: null,
      pdfaOutcome: 'none',
      metTarget: null,
      warnings: [],
    })
  );
});

describe('CompressNode', () => {
  it('compresses with the chosen level, grayscale and target size', async () => {
    const node = new CompressNode();
    setText(node, 'compressionLevel', 'high');
    setText(node, 'convertToGrayscale', 'true');
    setNumber(node, 'targetKilobytes', 500);

    const output = (await node.data({ pdf: [await pdfInput('report.pdf')] }))
      .pdf as PDFData;

    expect(compressWithHyper).toHaveBeenCalledWith(expect.any(ArrayBuffer), {
      preset: 'high',
      options: { grayscale: true },
      targetSizeBytes: 500 * 1024,
    });
    expect(output.filename).toBe('report_compressed.pdf');
    expect(output.document.getPageCount()).toBe(1);
  });

  it('maps a level from an older workflow and treats 0 KB as no target', async () => {
    const node = new CompressNode();
    setText(node, 'compressionLevel', 'extreme');

    await node.data({ pdf: [await pdfInput('scan.PDF')] });

    expect(compressWithHyper).toHaveBeenCalledWith(expect.any(ArrayBuffer), {
      preset: 'high',
      options: { grayscale: false },
      targetSizeBytes: undefined,
    });
  });

  it('sends a copy so the input PDF stays usable', async () => {
    const input = await pdfInput('a.pdf');
    const before = Array.from(input.bytes);

    await new CompressNode().data({ pdf: [input] });

    expect(compressWithHyper.mock.calls[0][0]).not.toBe(input.bytes.buffer);
    expect(Array.from(input.bytes)).toEqual(before);
  });
});
