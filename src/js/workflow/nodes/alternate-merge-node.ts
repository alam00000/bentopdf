import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { extractAllPdfs } from '../types';
import { interleavePdfs } from '../../utils/alternate-merge.js';
import { loadPdfDocument } from '../../utils/load-pdf-document.js';
import { wfError } from '../errors';

export class AlternateMergeNode extends BaseWorkflowNode {
  readonly category = 'Organize & Manage' as const;
  readonly icon = 'ph-shuffle';
  readonly description = 'Interleave pages from multiple PDFs';

  constructor() {
    super('Alternate Merge');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDFs', true));
    this.addOutput(
      'pdf',
      new ClassicPreset.Output(pdfSocket, 'Interleaved PDF')
    );
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
    if (allPdfs.length < 2) {
      throw new Error(wfError('alternateMergeNeedsTwo'));
    }

    const filesToMerge = allPdfs.map((p) => ({
      name: p.filename,
      data: p.bytes.slice().buffer as ArrayBuffer,
    }));

    const retainCtrl = this.controls['retainPageLabels'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    const retainPageLabels = (retainCtrl?.value ?? 'false') === 'true';

    const mergedBytes = await interleavePdfs(filesToMerge, {
      retainPageLabels,
    });
    const document = await loadPdfDocument(mergedBytes);

    return {
      pdf: {
        type: 'pdf',
        document,
        bytes: mergedBytes,
        filename: 'alternated-mixed.pdf',
      },
    };
  }
}
