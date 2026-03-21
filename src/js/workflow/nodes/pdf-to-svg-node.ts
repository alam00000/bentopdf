import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, extractAllPdfs } from '../types';
import { downloadFile } from '../../utils/helpers.js';
import { loadPyMuPDF } from '../../utils/pymupdf-loader.js';

export class PdfToSvgNode extends BaseWorkflowNode {
  readonly category = 'Output' as const;
  readonly icon = 'ph-file-code';
  readonly description = 'Convert PDF pages to SVG';

  constructor() {
    super('PDF to SVG');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'PDF to SVG');
    const allPdfs = extractAllPdfs(pdfInputs);
    const pymupdf = await loadPyMuPDF();

    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    for (const pdf of allPdfs) {
      const blob = new Blob([new Uint8Array(pdf.bytes)], {
        type: 'application/pdf',
      });
      const doc = await pymupdf.open(blob);
      try {
        const pageCount = doc.pageCount;
        const prefix =
          allPdfs.length > 1 ? pdf.filename.replace(/\.pdf$/i, '') + '/' : '';
        for (let i = 0; i < pageCount; i++) {
          const page = doc.getPage(i);
          const svg = page.toSvg();
          zip.file(`${prefix}page_${i + 1}.svg`, svg);
        }
      } finally {
        doc.close();
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadFile(zipBlob, 'svg_pages.zip');

    return {};
  }
}
