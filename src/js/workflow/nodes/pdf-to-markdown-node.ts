import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, extractAllPdfs } from '../types';
import { downloadFile } from '../../utils/helpers.js';
import { loadPyMuPDF } from '../../utils/pymupdf-loader.js';

export class PdfToMarkdownNode extends BaseWorkflowNode {
  readonly category = 'Output' as const;
  readonly icon = 'ph-markdown-logo';
  readonly description = 'Extract text from PDF as Markdown';

  constructor() {
    super('PDF to Markdown');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
  }

  private async extractMarkdown(bytes: Uint8Array): Promise<string> {
    const pymupdf = await loadPyMuPDF();
    const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
    return pymupdf.pdfToMarkdown(blob, { includeImages: false });
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'PDF to Markdown');
    const allPdfs = extractAllPdfs(pdfInputs);

    if (allPdfs.length === 1) {
      const markdown = await this.extractMarkdown(allPdfs[0].bytes);
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const name = allPdfs[0].filename.replace(/\.pdf$/i, '') + '.md';
      downloadFile(blob, name);
    } else {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      for (const pdf of allPdfs) {
        const markdown = await this.extractMarkdown(pdf.bytes);
        const name = pdf.filename.replace(/\.pdf$/i, '') + '.md';
        zip.file(name, markdown);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadFile(zipBlob, 'markdown_files.zip');
    }

    return {};
  }
}
