import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { PDFData, SocketData, MultiPDFData } from '../types';
import { PDFDocument } from 'pdf-lib';
import { loadPyMuPDF } from '../../utils/pymupdf-loader.js';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

export class MarkdownToPdfNode extends BaseWorkflowNode {
  readonly category = 'Input' as const;
  readonly icon = 'ph-markdown-logo';
  readonly description = 'Upload Markdown files and convert to PDF';

  private files: File[] = [];

  constructor() {
    super('Markdown Input');
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'PDF'));
  }

  async addFiles(fileList: File[]): Promise<void> {
    for (const file of fileList) {
      const name = file.name.toLowerCase();
      if (name.endsWith('.md') || name.endsWith('.markdown')) {
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
    return `${this.files.length} Markdown files`;
  }

  async data(
    _inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    if (this.files.length === 0)
      throw new Error('No Markdown files uploaded in Markdown Input node');

    const pymupdf = await loadPyMuPDF();
    const results: PDFData[] = [];
    for (const file of this.files) {
      const textContent = await file.text();
      const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
        body { font-family: sans-serif; font-size: 12pt; line-height: 1.6; max-width: 100%; padding: 0; }
        h1 { font-size: 24pt; } h2 { font-size: 20pt; } h3 { font-size: 16pt; }
        code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; font-size: 0.9em; }
        pre code { display: block; padding: 12px; overflow-x: auto; }
        blockquote { border-left: 3px solid #ccc; margin-left: 0; padding-left: 12px; color: #555; }
        table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ccc; padding: 6px 12px; }
      </style></head><body>${md.render(textContent)}</body></html>`;
      const pdfBlob = await (pymupdf as any).htmlToPdf(htmlContent, {
        pageSize: 'a4',
      });
      const bytes = new Uint8Array(await pdfBlob.arrayBuffer());
      const pdfDoc = await PDFDocument.load(bytes);
      results.push({
        type: 'pdf',
        document: pdfDoc,
        bytes,
        filename: file.name.replace(/\.(md|markdown)$/i, '.pdf'),
      });
    }

    if (results.length === 1) return { pdf: results[0] };
    return { pdf: { type: 'multi-pdf', items: results } as MultiPDFData };
  }
}
