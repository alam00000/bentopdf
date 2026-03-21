import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { PDFDocument, PDFName } from 'pdf-lib';

export class RemoveAnnotationsNode extends BaseWorkflowNode {
  readonly category = 'Edit & Annotate' as const;
  readonly icon = 'ph-eraser';
  readonly description = 'Strip all annotations';

  constructor() {
    super('Remove Annotations');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'Clean PDF'));
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Remove Annotations');

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const pdfDoc = await PDFDocument.load(input.bytes);
        const pages = pdfDoc.getPages();

        for (const page of pages) {
          const annots = page.node.Annots();
          if (annots) {
            page.node.delete(PDFName.of('Annots'));
          }
        }

        const pdfBytes = await pdfDoc.save();
        return {
          type: 'pdf',
          document: pdfDoc,
          bytes: new Uint8Array(pdfBytes),
          filename: input.filename.replace(/\.pdf$/i, '_clean.pdf'),
        };
      }),
    };
  }
}
