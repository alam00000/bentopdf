import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { PDFDocument } from 'pdf-lib';
import { initializeQpdf } from '../../utils/helpers.js';

export class LinearizeNode extends BaseWorkflowNode {
  readonly category = 'Optimize & Repair' as const;
  readonly icon = 'ph-gauge';
  readonly description = 'Linearize PDF for fast web viewing';

  constructor() {
    super('Linearize');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput(
      'pdf',
      new ClassicPreset.Output(pdfSocket, 'Linearized PDF')
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Linearize');

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const qpdf = await initializeQpdf();
        const uid = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const inputPath = `/tmp/input_linearize_${uid}.pdf`;
        const outputPath = `/tmp/output_linearize_${uid}.pdf`;

        let resultBytes: Uint8Array;
        try {
          qpdf.FS.writeFile(inputPath, input.bytes);
          qpdf.callMain([inputPath, '--linearize', outputPath]);
          resultBytes = new Uint8Array(qpdf.FS.readFile(outputPath));
        } finally {
          try {
            qpdf.FS.unlink(inputPath);
          } catch {
            /* cleanup */
          }
          try {
            qpdf.FS.unlink(outputPath);
          } catch {
            /* cleanup */
          }
        }

        const document = await PDFDocument.load(resultBytes);

        return {
          type: 'pdf',
          document,
          bytes: resultBytes,
          filename: input.filename.replace(/\.pdf$/i, '_linearized.pdf'),
        };
      }),
    };
  }
}
