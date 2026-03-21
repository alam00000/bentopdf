import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, extractAllPdfs } from '../types';
import { downloadFile } from '../../utils/helpers.js';

export class DownloadPDFNode extends BaseWorkflowNode {
  readonly category = 'Output' as const;
  readonly icon = 'ph-download-simple';
  readonly description = 'Download the resulting PDF';

  constructor() {
    super('Download PDF');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addControl(
      'filename',
      new ClassicPreset.InputControl('text', {
        initial: 'output.pdf',
      })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Download PDF');
    const allPdfs = extractAllPdfs(pdfInputs);

    const filenameControl = this.controls['filename'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    const filename = filenameControl?.value || 'output.pdf';

    if (allPdfs.length === 1) {
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
      downloadFile(zipBlob, filename.replace(/\.pdf$/i, '.zip'));
    }

    return {};
  }
}
