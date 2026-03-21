import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { extractAllPdfs } from '../types';
import { downloadFile } from '../../utils/helpers.js';

export class DownloadNode extends BaseWorkflowNode {
  readonly category = 'Output' as const;
  readonly icon = 'ph-download-simple';
  readonly description = 'Download as PDF or ZIP automatically';

  constructor() {
    super('Download');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF', true));
    this.addControl(
      'filename',
      new ClassicPreset.InputControl('text', {
        initial: 'output',
      })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const allInputs = Object.values(inputs).flat();
    const allPdfs = extractAllPdfs(allInputs);
    if (allPdfs.length === 0)
      throw new Error('No PDFs connected to Download node');

    const filenameControl = this.controls['filename'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    const baseName = filenameControl?.value || 'output';

    if (allPdfs.length === 1) {
      const filename = baseName.toLowerCase().endsWith('.pdf')
        ? baseName
        : `${baseName}.pdf`;
      const blob = new Blob([new Uint8Array(allPdfs[0].bytes)], {
        type: 'application/pdf',
      });
      downloadFile(blob, filename);
    } else {
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
      const zipFilename = baseName.toLowerCase().endsWith('.zip')
        ? baseName
        : `${baseName}.zip`;
      downloadFile(zipBlob, zipFilename);
    }

    return {};
  }
}
