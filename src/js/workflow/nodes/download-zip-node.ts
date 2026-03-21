import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { extractAllPdfs } from '../types';
import { downloadFile } from '../../utils/helpers.js';

export class DownloadZipNode extends BaseWorkflowNode {
  readonly category = 'Output' as const;
  readonly icon = 'ph-archive';
  readonly description = 'Download multiple PDFs as ZIP';

  constructor() {
    super('Download ZIP');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDFs', true));
    this.addControl(
      'filename',
      new ClassicPreset.InputControl('text', { initial: 'output.zip' })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const allInputs = Object.values(inputs).flat();
    const allPdfs = extractAllPdfs(allInputs);
    if (allPdfs.length === 0)
      throw new Error('No PDFs connected to Download ZIP node');

    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    const usedNames = new Set<string>();
    for (const pdf of allPdfs) {
      let name = pdf.filename || 'document.pdf';
      if (!name.toLowerCase().endsWith('.pdf')) name += '.pdf';
      let uniqueName = name;
      let counter = 1;
      while (usedNames.has(uniqueName)) {
        uniqueName = name.replace(/\.pdf$/i, `_${counter}.pdf`);
        counter++;
      }
      usedNames.add(uniqueName);
      zip.file(uniqueName, pdf.bytes);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });

    const filenameCtrl = this.controls['filename'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    const filename = filenameCtrl?.value || 'output.zip';
    downloadFile(zipBlob, filename);

    return {};
  }
}
