import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { PDFDocument } from 'pdf-lib';

export class ReversePagesNode extends BaseWorkflowNode {
  readonly category = 'Organize & Manage' as const;
  readonly icon = 'ph-sort-descending';
  readonly description = 'Reverse page order';

  constructor() {
    super('Reverse Pages');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'Reversed PDF'));
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Reverse Pages');

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const srcDoc = await PDFDocument.load(input.bytes);
        const pageCount = srcDoc.getPageCount();
        const newDoc = await PDFDocument.create();
        const reversedIndices = Array.from(
          { length: pageCount },
          (_, i) => pageCount - 1 - i
        );
        const copiedPages = await newDoc.copyPages(srcDoc, reversedIndices);
        copiedPages.forEach((page) => newDoc.addPage(page));
        const pdfBytes = await newDoc.save();
        return {
          type: 'pdf',
          document: newDoc,
          bytes: new Uint8Array(pdfBytes),
          filename: input.filename.replace(/\.pdf$/i, '_reversed.pdf'),
        };
      }),
    };
  }
}
