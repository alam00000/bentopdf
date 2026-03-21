import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { PDFData, SocketData, MultiPDFData } from '../types';
import { PDFDocument } from 'pdf-lib';
import { getLibreOfficeConverter } from '../../utils/libreoffice-loader.js';

export class OdgToPdfNode extends BaseWorkflowNode {
  readonly category = 'Input' as const;
  readonly icon = 'ph-image';
  readonly description = 'Upload OpenDocument Graphics and convert to PDF';

  private files: File[] = [];

  constructor() {
    super('ODG Input');
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'PDF'));
  }

  async addFiles(fileList: File[]): Promise<void> {
    for (const file of fileList) {
      if (file.name.toLowerCase().endsWith('.odg')) {
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
    return `${this.files.length} ODG files`;
  }

  async data(
    _inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    if (this.files.length === 0)
      throw new Error('No ODG files uploaded in ODG Input node');

    const converter = getLibreOfficeConverter();
    await converter.initialize();

    const results: PDFData[] = [];
    for (const file of this.files) {
      const resultBlob = await converter.convertToPdf(file);
      const bytes = new Uint8Array(await resultBlob.arrayBuffer());
      const document = await PDFDocument.load(bytes);
      results.push({
        type: 'pdf',
        document,
        bytes,
        filename: file.name.replace(/\.odg$/i, '.pdf'),
      });
    }

    if (results.length === 1) return { pdf: results[0] };
    return { pdf: { type: 'multi-pdf', items: results } as MultiPDFData };
  }
}
