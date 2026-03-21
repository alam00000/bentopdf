import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { PDFData, SocketData, MultiPDFData } from '../types';
import { PDFDocument } from 'pdf-lib';
import { loadPyMuPDF } from '../../utils/pymupdf-loader.js';

export class XpsToPdfNode extends BaseWorkflowNode {
  readonly category = 'Input' as const;
  readonly icon = 'ph-scan';
  readonly description = 'Upload XPS/OXPS documents and convert to PDF';

  private files: File[] = [];

  constructor() {
    super('XPS Input');
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'PDF'));
  }

  async addFiles(fileList: File[]): Promise<void> {
    for (const file of fileList) {
      const name = file.name.toLowerCase();
      if (name.endsWith('.xps') || name.endsWith('.oxps')) {
        this.files.push(file);
      }
    }
  }

  removeFile(index: number): void {
    this.files.splice(index, 1);
  }
  hasFile(): boolean {
    return this.files.length > 0;
  }
  getFileCount(): number {
    return this.files.length;
  }
  getFilenames(): string[] {
    return this.files.map((f) => f.name);
  }
  getFilename(): string {
    if (this.files.length === 0) return '';
    if (this.files.length === 1) return this.files[0].name;
    return `${this.files.length} XPS files`;
  }

  async data(
    _inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    if (this.files.length === 0)
      throw new Error('No XPS files uploaded in XPS Input node');

    const pymupdf = await loadPyMuPDF();
    const results: PDFData[] = [];
    for (const file of this.files) {
      const blob = await pymupdf.convertToPdf(file, { filetype: 'xps' });
      const bytes = new Uint8Array(await blob.arrayBuffer());
      const document = await PDFDocument.load(bytes);
      results.push({
        type: 'pdf',
        document,
        bytes,
        filename: file.name.replace(/\.(xps|oxps)$/i, '.pdf'),
      });
    }

    if (results.length === 1) return { pdf: results[0] };
    return { pdf: { type: 'multi-pdf', items: results } as MultiPDFData };
  }
}
