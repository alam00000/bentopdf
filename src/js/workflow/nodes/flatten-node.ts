import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { flattenAnnotations } from '../../utils/flatten-annotations.js';
import { loadPdfDocument } from '../../utils/load-pdf-document.js';

export class FlattenNode extends BaseWorkflowNode {
  readonly category = 'Secure PDF' as const;
  readonly icon = 'ph-stack';
  readonly description = 'Flatten forms and annotations';

  constructor() {
    super('Flatten');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'Flattened PDF'));
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Flatten');

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const pdfDoc = await loadPdfDocument(input.bytes);

        try {
          const form = pdfDoc.getForm();
          form.flatten();
        } catch (err) {
          console.error('Flatten form error (may have no forms):', err);
        }

        try {
          flattenAnnotations(pdfDoc);
        } catch (err) {
          console.error('Flatten annotations error:', err);
        }

        const pdfBytes = await pdfDoc.save();
        return {
          type: 'pdf',
          document: pdfDoc,
          bytes: new Uint8Array(pdfBytes),
          filename: input.filename.replace(/\.pdf$/i, '_flattened.pdf'),
        };
      }),
    };
  }
}
