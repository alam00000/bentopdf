import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { PDFDocument } from 'pdf-lib';
import { loadPyMuPDF } from '../../utils/pymupdf-loader.js';

export class DeskewNode extends BaseWorkflowNode {
  readonly category = 'Optimize & Repair' as const;
  readonly icon = 'ph-perspective';
  readonly description = 'Straighten skewed PDF pages';

  constructor() {
    super('Deskew');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'Deskewed PDF'));
    this.addControl(
      'skewThreshold',
      new ClassicPreset.InputControl('text', { initial: '0.5' })
    );
    this.addControl(
      'processingDpi',
      new ClassicPreset.InputControl('text', { initial: '150' })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Deskew');

    const getText = (key: string, fallback: string) => {
      const ctrl = this.controls[key] as
        | ClassicPreset.InputControl<'text'>
        | undefined;
      return ctrl?.value || fallback;
    };
    const threshold = parseFloat(getText('skewThreshold', '0.5'));
    const dpi = parseInt(getText('processingDpi', '150')) || 150;

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const pymupdf = await loadPyMuPDF();
        const blob = new Blob([new Uint8Array(input.bytes)], {
          type: 'application/pdf',
        });
        const { pdf: resultPdf } = await pymupdf.deskewPdf(blob, {
          threshold,
          dpi,
        });

        const bytes = new Uint8Array(await resultPdf.arrayBuffer());
        const document = await PDFDocument.load(bytes);

        return {
          type: 'pdf',
          document,
          bytes,
          filename: input.filename.replace(/\.pdf$/i, '_deskewed.pdf'),
        };
      }),
    };
  }
}
