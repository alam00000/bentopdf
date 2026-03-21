import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { PDFDocument } from 'pdf-lib';
import { convertFontsToOutlines } from '../../utils/ghostscript-loader.js';

export class FontToOutlineNode extends BaseWorkflowNode {
  readonly category = 'Optimize & Repair' as const;
  readonly icon = 'ph-text-outdent';
  readonly description = 'Convert fonts to vector outlines';

  constructor() {
    super('Font to Outline');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'Outlined PDF'));
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Font to Outline');

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const resultBytes = await convertFontsToOutlines(
          new Uint8Array(input.bytes)
        );
        const bytes = new Uint8Array(resultBytes);
        const document = await PDFDocument.load(bytes);

        return {
          type: 'pdf',
          document,
          bytes,
          filename: input.filename.replace(/\.pdf$/i, '_outline.pdf'),
        };
      }),
    };
  }
}
