import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { PDFDocument } from 'pdf-lib';
import { loadPyMuPDF } from '../../utils/pymupdf-loader.js';

export class RasterizeNode extends BaseWorkflowNode {
  readonly category = 'Optimize & Repair' as const;
  readonly icon = 'ph-image';
  readonly description = 'Convert to image-based PDF';

  constructor() {
    super('Rasterize');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput(
      'pdf',
      new ClassicPreset.Output(pdfSocket, 'Rasterized PDF')
    );
    this.addControl(
      'rasterizeDpi',
      new ClassicPreset.InputControl('text', { initial: '150' })
    );
    this.addControl(
      'imageFormat',
      new ClassicPreset.InputControl('text', { initial: 'png' })
    );
    this.addControl(
      'grayscale',
      new ClassicPreset.InputControl('text', { initial: 'false' })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Rasterize');

    const getText = (key: string, fallback: string) => {
      const ctrl = this.controls[key] as
        | ClassicPreset.InputControl<'text'>
        | undefined;
      return ctrl?.value || fallback;
    };

    const dpi = Math.max(
      72,
      Math.min(600, parseInt(getText('rasterizeDpi', '150')) || 150)
    );
    const format = getText('imageFormat', 'png') === 'jpeg' ? 'jpeg' : 'png';
    const grayscale = getText('grayscale', 'false') === 'true';

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const pymupdf = await loadPyMuPDF();
        const blob = new Blob([new Uint8Array(input.bytes)], {
          type: 'application/pdf',
        });
        const rasterizedBlob = await pymupdf.rasterizePdf(blob, {
          dpi,
          format,
          grayscale,
          quality: 95,
        });

        const bytes = new Uint8Array(await rasterizedBlob.arrayBuffer());
        const document = await PDFDocument.load(bytes);

        return {
          type: 'pdf',
          document,
          bytes,
          filename: input.filename.replace(/\.pdf$/i, '_rasterized.pdf'),
        };
      }),
    };
  }
}
