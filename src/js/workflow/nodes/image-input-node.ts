import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { PDFData, SocketData } from '../types';
import { PDFDocument } from 'pdf-lib';
import { loadPyMuPDF } from '../../utils/pymupdf-loader.js';

export class ImageInputNode extends BaseWorkflowNode {
  readonly category = 'Input' as const;
  readonly icon = 'ph-image';
  readonly description = 'Upload images and convert to PDF';

  private files: File[] = [];

  constructor() {
    super('Image Input');
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'PDF'));
  }

  async addFiles(fileList: File[]): Promise<void> {
    for (const file of fileList) {
      if (file.type.startsWith('image/')) {
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
    return `${this.files.length} images`;
  }

  async data(
    _inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    if (this.files.length === 0) {
      throw new Error('No images uploaded in Image Input node');
    }

    const pymupdf = await loadPyMuPDF();
    const pdfBlob = await pymupdf.imagesToPdf(this.files);
    const bytes = new Uint8Array(await pdfBlob.arrayBuffer());
    const document = await PDFDocument.load(bytes);

    const result: PDFData = {
      type: 'pdf',
      document,
      bytes,
      filename: 'images.pdf',
    };

    return { pdf: result };
  }
}
