import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { extractAllPdfs } from '../types';
import { mergePdfsCpdf } from '../../utils/merge-cpdf';
import { loadPdfDocument } from '../../utils/load-pdf-document.js';
import { wfError } from '../errors';

export class MergeNode extends BaseWorkflowNode {
  readonly category = 'Organize & Manage' as const;
  readonly icon = 'ph-browsers';
  readonly description = 'Combine multiple PDFs into one';

  constructor() {
    super('Merge PDFs');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDFs', true));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'Merged PDF'));
    this.addControl(
      'retainPageLabels',
      new ClassicPreset.InputControl('text', { initial: 'false' })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const allInputs = Object.values(inputs).flat();
    const allPdfs = extractAllPdfs(allInputs);
    if (allPdfs.length === 0)
      throw new Error(wfError('noPdfsConnected', { node: 'Merge' }));

    const filesToMerge = allPdfs.map((p, idx) => ({
      name: p.filename || `input-${idx}.pdf`,
      data: p.bytes.slice().buffer as ArrayBuffer,
    }));

    const retainCtrl = this.controls['retainPageLabels'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    const retainPageLabels = (retainCtrl?.value ?? 'false') === 'true';

    const mergedBytes = await mergePdfsCpdf(filesToMerge, { retainPageLabels });
    const mergedDoc = await loadPdfDocument(mergedBytes);

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
