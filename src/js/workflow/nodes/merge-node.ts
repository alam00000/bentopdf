import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { extractAllPdfs } from '../types';
import { mergePdfs } from '../../utils/pdf-operations';
import { PDFDocument } from 'pdf-lib';

export class MergeNode extends BaseWorkflowNode {
  readonly category = 'Organize & Manage' as const;
  readonly icon = 'ph-browsers';
  readonly description = 'Combine multiple PDFs into one';

  constructor() {
    super('Merge PDFs');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDFs', true));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'Merged PDF'));
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const allInputs = Object.values(inputs).flat();
    const allPdfs = extractAllPdfs(allInputs);
    if (allPdfs.length === 0)
      throw new Error('No PDFs connected to Merge node');

    const mergedBytes = await mergePdfs(allPdfs.map((p) => p.bytes));
    const mergedDoc = await PDFDocument.load(mergedBytes);

    return {
      pdf: {
        type: 'pdf',
        document: mergedDoc,
        bytes: mergedBytes,
        filename: 'merged.pdf',
      },
    };
  }
}
