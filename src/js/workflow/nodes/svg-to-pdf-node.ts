import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { PDFData, SocketData } from '../types';
import { PDFDocument } from 'pdf-lib';

export class SvgToPdfNode extends BaseWorkflowNode {
  readonly category = 'Input' as const;
  readonly icon = 'ph-file-svg';
  readonly description = 'Upload SVG files and convert to PDF';

  private files: File[] = [];

  constructor() {
    super('SVG Input');
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'PDF'));
  }

  async addFiles(fileList: File[]): Promise<void> {
    for (const file of fileList) {
      if (file.name.endsWith('.svg') || file.type === 'image/svg+xml') {
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
    return `${this.files.length} SVG files`;
  }

  private async svgToPng(svgText: string): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 800;
        canvas.height = img.naturalHeight || 600;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob(async (blob) => {
          if (!blob) {
            reject(new Error('Failed to convert SVG'));
            return;
          }
          resolve(new Uint8Array(await blob.arrayBuffer()));
        }, 'image/png');
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG'));
      };
      img.src = url;
    });
  }

  async data(
    _inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    if (this.files.length === 0)
      throw new Error('No SVG files uploaded in SVG Input node');

    const doc = await PDFDocument.create();

    for (const file of this.files) {
      const svgText = await file.text();
      const pngBytes = await this.svgToPng(svgText);
      const pngImage = await doc.embedPng(pngBytes);
      const page = doc.addPage([pngImage.width, pngImage.height]);
      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: pngImage.width,
        height: pngImage.height,
      });
    }

    const pdfBytes = new Uint8Array(await doc.save());
    const result: PDFData = {
      type: 'pdf',
      document: doc,
      bytes: pdfBytes,
      filename: 'svg_converted.pdf',
    };

    return { pdf: result };
  }
}
