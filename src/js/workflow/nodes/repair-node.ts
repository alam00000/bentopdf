import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { PDFDocument } from 'pdf-lib';
import { initializeQpdf } from '../../utils/helpers.js';

export class RepairNode extends BaseWorkflowNode {
  readonly category = 'Optimize & Repair' as const;
  readonly icon = 'ph-wrench';
  readonly description = 'Repair corrupted PDF';

  constructor() {
    super('Repair');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'Repaired PDF'));
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Repair');

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const qpdf = await initializeQpdf();
        const uid = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const inputPath = `/tmp/input_repair_${uid}.pdf`;
        const outputPath = `/tmp/output_repair_${uid}.pdf`;

        let repairedData: Uint8Array;
        try {
          qpdf.FS.writeFile(inputPath, input.bytes);
          qpdf.callMain([inputPath, '--decrypt', outputPath]);

          repairedData = qpdf.FS.readFile(outputPath, { encoding: 'binary' });
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

        const resultBytes = new Uint8Array(repairedData);
        const resultDoc = await PDFDocument.load(resultBytes, {
          ignoreEncryption: true,
          throwOnInvalidObject: false,
        });

        return {
          type: 'pdf',
          document: resultDoc,
          bytes: resultBytes,
          filename: input.filename.replace(/\.pdf$/i, '_repaired.pdf'),
        };
      }),
    };
  }
}
