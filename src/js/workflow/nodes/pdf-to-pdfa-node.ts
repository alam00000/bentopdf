import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { PDFDocument } from 'pdf-lib';
import { loadGhostscript } from '../../utils/ghostscript-dynamic-loader.js';
import { loadPyMuPDF } from '../../utils/pymupdf-loader.js';

export class PdfToPdfANode extends BaseWorkflowNode {
  readonly category = 'Optimize & Repair' as const;
  readonly icon = 'ph-archive';
  readonly description = 'Convert PDF to PDF/A for archiving';

  constructor() {
    super('PDF to PDF/A');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'PDF/A'));
    this.addControl(
      'level',
      new ClassicPreset.InputControl('text', { initial: 'PDF/A-2b' })
    );
    this.addControl(
      'preFlatten',
      new ClassicPreset.InputControl('text', { initial: 'false' })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'PDF to PDF/A');

    const getText = (key: string, fallback: string) => {
      const ctrl = this.controls[key] as
        | ClassicPreset.InputControl<'text'>
        | undefined;
      return ctrl?.value || fallback;
    };

    const level = getText('level', 'PDF/A-2b');
    const preFlatten = getText('preFlatten', 'false') === 'true';

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        let pdfBytes = input.bytes;

        if (preFlatten) {
          const pymupdf = await loadPyMuPDF();
          const blob = new Blob([new Uint8Array(pdfBytes)], {
            type: 'application/pdf',
          });
          const flattenedBlob = await pymupdf.rasterizePdf(blob, {
            dpi: 300,
            format: 'png',
          });
          pdfBytes = new Uint8Array(await flattenedBlob.arrayBuffer());
        }

        const gs = await loadGhostscript();
        const pdfBuffer = pdfBytes.buffer.slice(
          pdfBytes.byteOffset,
          pdfBytes.byteOffset + pdfBytes.byteLength
        );
        const resultBuffer = await gs.convertToPDFA(
          pdfBuffer as ArrayBuffer,
          level
        );

        const bytes = new Uint8Array(resultBuffer);
        const document = await PDFDocument.load(bytes);

        return {
          type: 'pdf',
          document,
          bytes,
          filename: input.filename.replace(/\.pdf$/i, '_pdfa.pdf'),
        };
      }),
    };
  }
}
