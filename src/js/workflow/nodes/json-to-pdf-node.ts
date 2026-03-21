import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { PDFData, SocketData, MultiPDFData } from '../types';
import { PDFDocument } from 'pdf-lib';
import { loadPyMuPDF } from '../../utils/pymupdf-loader.js';

export class JsonToPdfNode extends BaseWorkflowNode {
  readonly category = 'Input' as const;
  readonly icon = 'ph-file-code';
  readonly description = 'Upload JSON files and convert to PDF';

  private files: File[] = [];

  constructor() {
    super('JSON Input');
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'PDF'));
  }

  async addFiles(fileList: File[]): Promise<void> {
    for (const file of fileList) {
      if (file.name.toLowerCase().endsWith('.json')) {
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
    return `${this.files.length} JSON files`;
  }

  async data(
    _inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    if (this.files.length === 0)
      throw new Error('No JSON files uploaded in JSON Input node');

    const pymupdf = await loadPyMuPDF();
    const results: PDFData[] = [];
    for (const file of this.files) {
      const rawText = await file.text();
      let formatted: string;
      try {
        formatted = JSON.stringify(JSON.parse(rawText), null, 2);
      } catch {
        formatted = rawText;
      }
      const pdfBlob = await pymupdf.textToPdf(formatted, {
        fontSize: 10,
        fontName: 'cour',
        pageSize: 'a4',
      });
      const bytes = new Uint8Array(await pdfBlob.arrayBuffer());
      const pdfDoc = await PDFDocument.load(bytes);
      results.push({
        type: 'pdf',
        document: pdfDoc,
        bytes,
        filename: file.name.replace(/\.json$/i, '.pdf'),
      });
    }

    if (results.length === 1) return { pdf: results[0] };
    return { pdf: { type: 'multi-pdf', items: results } as MultiPDFData };
  }
}
