import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, extractAllPdfs } from '../types';
import { downloadFile } from '../../utils/helpers.js';
import { loadPyMuPDF } from '../../utils/pymupdf-loader.js';

export class PdfToTextNode extends BaseWorkflowNode {
  readonly category = 'Output' as const;
  readonly icon = 'ph-text-aa';
  readonly description = 'Extract text from PDF';

  constructor() {
    super('PDF to Text');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
  }

  private async extractText(bytes: Uint8Array): Promise<string> {
    const pymupdf = await loadPyMuPDF();
    const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
    return pymupdf.pdfToText(blob);
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'PDF to Text');
    const allPdfs = extractAllPdfs(pdfInputs);

    if (allPdfs.length === 1) {
      const text = await this.extractText(allPdfs[0].bytes);
      const blob = new Blob([text], { type: 'text/plain' });
      const name = allPdfs[0].filename.replace(/\.pdf$/i, '') + '.txt';
      downloadFile(blob, name);
    } else {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      for (const pdf of allPdfs) {
        const text = await this.extractText(pdf.bytes);
        const name = pdf.filename.replace(/\.pdf$/i, '') + '.txt';
        zip.file(name, text);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadFile(zipBlob, 'text_files.zip');
    }

    return {};
  }
}
