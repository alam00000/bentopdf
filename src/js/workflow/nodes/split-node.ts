import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { splitPdf, parsePageRange } from '../../utils/pdf-operations';
import { PDFDocument } from 'pdf-lib';

export class SplitNode extends BaseWorkflowNode {
  readonly category = 'Organize & Manage' as const;
  readonly icon = 'ph-scissors';
  readonly description = 'Extract a range of pages';

  constructor() {
    super('Split PDF');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'Split PDF'));
    this.addControl(
      'pages',
      new ClassicPreset.InputControl('text', { initial: '1-3' })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Split PDF');
    const pagesControl = this.controls['pages'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    const rangeStr = pagesControl?.value || '1';

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const srcDoc = await PDFDocument.load(input.bytes);
        const totalPages = srcDoc.getPageCount();
        const indices = parsePageRange(rangeStr, totalPages);
        const resultBytes = await splitPdf(input.bytes, indices);
        const resultDoc = await PDFDocument.load(resultBytes);
        return {
          type: 'pdf',
          document: resultDoc,
          bytes: resultBytes,
          filename: input.filename.replace(/\.pdf$/i, '_split.pdf'),
        };
      }),
    };
  }
}
