import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { deletePdfPages, parseDeletePages } from '../../utils/pdf-operations';
import { PDFDocument } from 'pdf-lib';

export class DeletePagesNode extends BaseWorkflowNode {
  readonly category = 'Organize & Manage' as const;
  readonly icon = 'ph-trash';
  readonly description = 'Remove specific pages';

  constructor() {
    super('Delete Pages');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'PDF'));
    this.addControl(
      'pages',
      new ClassicPreset.InputControl('text', { initial: '1' })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Delete Pages');
    const pagesControl = this.controls['pages'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    const deleteStr = pagesControl?.value || '';

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const srcDoc = await PDFDocument.load(input.bytes);
        const totalPages = srcDoc.getPageCount();
        const pagesToDelete = parseDeletePages(deleteStr, totalPages);
        const resultBytes = await deletePdfPages(input.bytes, pagesToDelete);
        const resultDoc = await PDFDocument.load(resultBytes);
        return {
          type: 'pdf',
          document: resultDoc,
          bytes: resultBytes,
          filename: input.filename.replace(/\.pdf$/i, '_trimmed.pdf'),
        };
      }),
    };
  }
}
